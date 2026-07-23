/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { correctClockSkew, normalize } from './normalize';
import { orderLanes } from './order_lanes';
import { fromOtlp, nanoToMs } from './otel_adapter';
import type { OtelSpan, OtlpEnvelope } from './otel_adapter';
import type { NormalizedSpan } from './types';
import { Logger } from '../../../utils/logger';
import type { TraceDatum } from '../trace_api';
import { colorByOtelAttribute, colorByOtelKind } from '../trace_api';

const simpleData: TraceDatum[] = [
  { id: 'a', name: 'root', start: 1000, end: 2000, traceId: 't1' },
  {
    id: 'b',
    name: 'child',
    parentId: 'a',
    start: 1200,
    end: 1500,
    traceId: 't1',
    activeSegments: [
      { start: 1200, end: 1300 },
      { start: 1400, end: 1500 },
    ],
  },
];

const normalizedSpan = (datum: TraceDatum): NormalizedSpan => ({
  ...datum,
  activeSegments: datum.activeSegments?.map((segment) => ({ ...segment })) ?? [],
  meta: datum,
});

// OTel fixture — same timing as simpleData, expressed as OTLP nanos (1ms === 1_000_000ns)
const otelSpans: OtelSpan[] = [
  {
    spanId: 'a',
    name: 'root',
    traceId: 't1',
    startTimeUnixNano: '1000000000',
    endTimeUnixNano: '2000000000',
    attributes: [{ key: 'service.name', value: 'checkout' }],
    status: { code: 1, message: 'OK' },
    kind: 2,
  },
  {
    spanId: 'b',
    parentSpanId: 'a',
    name: 'child',
    traceId: 't1',
    startTimeUnixNano: '1200000000',
    endTimeUnixNano: '1500000000',
    attributes: [{ key: 'http.method', value: 'GET' }],
    status: { code: 1, message: 'OK' },
    kind: 3,
  },
];

const otelEnvelope: OtlpEnvelope = {
  resourceSpans: [{ scopeSpans: [{ spans: [otelSpans[0]!] }] }, { scopeSpans: [{ spans: [otelSpans[1]!] }] }],
};

// ---------------------------------------------------------------------------
// fromOtlp adapter
// ---------------------------------------------------------------------------
describe('fromOtlp', () => {
  it('maps spanId/parentSpanId/name/traceId and converts nanos to ms', () => {
    const data = fromOtlp(otelSpans);
    expect(data).toEqual([
      expect.objectContaining({ id: 'a', name: 'root', traceId: 't1', start: 1000, end: 2000 }),
      expect.objectContaining({ id: 'b', name: 'child', parentId: 'a', traceId: 't1', start: 1200, end: 1500 }),
    ]);
  });

  it('flattens an OTLP envelope into the same result as a flat span array', () => {
    const fromEnvelope = fromOtlp(otelEnvelope);
    const fromFlat = fromOtlp(otelSpans);
    expect(fromEnvelope.map((s) => s.id)).toEqual(fromFlat.map((s) => s.id));
    expect(fromEnvelope[0]?.start).toEqual(fromFlat[0]?.start);
  });

  it('carries the original OtelSpan on datum.meta', () => {
    const data = fromOtlp(otelSpans);
    expect(data[0]?.meta).toBe(otelSpans[0]);
    expect(data[1]?.meta).toBe(otelSpans[1]);
  });

  it('omits parentId when parentSpanId is absent (root span)', () => {
    const data = fromOtlp(otelSpans);
    expect(data[0]).not.toHaveProperty('parentId');
  });
});

// ---------------------------------------------------------------------------
// nanoToMs
// ---------------------------------------------------------------------------
describe('nanoToMs', () => {
  it('converts string nanos', () => {
    expect(nanoToMs('1000000000')).toBe(1000);
  });

  it('converts number nanos', () => {
    expect(nanoToMs(1000000000)).toBe(1000);
  });

  it('converts bigint nanos', () => {
    expect(nanoToMs(1000000000n)).toBe(1000);
  });

  it('retains sub-millisecond precision beyond Number.MAX_SAFE_INTEGER via bigint arithmetic', () => {
    // 1700000000123456789 ns exceeds Number.MAX_SAFE_INTEGER (9007199254740991); a naive
    // Number(nano) / 1e6 conversion would silently lose the low-order digits.
    expect(nanoToMs('1700000000123456789')).toBeCloseTo(1700000000123.456789, 6);
  });
});

// ---------------------------------------------------------------------------
// correctClockSkew
// ---------------------------------------------------------------------------
describe('correctClockSkew', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the same empty array', () => {
    const spans: NormalizedSpan[] = [];

    expect(correctClockSkew(spans)).toBe(spans);
  });

  // Local coordinate goldens for Kibana APM getClockSkew, introduced by commit 36c31d600a371.
  it.each([
    {
      name: 'keeps an item without a parent unchanged',
      data: [{ id: 'root', name: 'root', start: 0, end: 50 }],
      expected: { start: 0, end: 50, skewCorrected: undefined },
    },
    {
      name: 'keeps an item that starts after its parent unchanged',
      data: [
        { id: 'root', name: 'root', start: 0, end: 100 },
        { id: 'child', name: 'child', parentId: 'root', start: 10, end: 60 },
      ],
      expected: { start: 10, end: 60, skewCorrected: undefined },
    },
    {
      name: 'centres a shorter item that starts before its parent',
      data: [
        { id: 'root', name: 'root', start: 0, end: 100 },
        { id: 'child', name: 'child', parentId: 'root', start: -20, end: 20 },
      ],
      expected: { start: 30, end: 70, skewCorrected: true },
    },
    {
      name: 'clamps latency to zero when the item is longer than its parent',
      data: [
        { id: 'root', name: 'root', start: 0, end: 100 },
        { id: 'child', name: 'child', parentId: 'root', start: -30, end: 120 },
      ],
      expected: { start: 0, end: 150, skewCorrected: true },
    },
  ])('$name', ({ data, expected }) => {
    const spans = data.map(normalizedSpan);
    const result = correctClockSkew(spans);
    const item = result.at(-1);
    const wasCorrected = expected.skewCorrected === true;

    expect(item).toMatchObject({ start: expected.start, end: expected.end });
    expect(item !== undefined && 'skewCorrected' in item).toBe(wasCorrected);
    expect(result === spans).toBe(!wasCorrected);
    expect(item === spans.at(-1)).toBe(!wasCorrected);
  });

  it('centres a left-skewed child and translates its active segments without mutating source data', () => {
    const rootDatum: TraceDatum = { id: 'root', name: 'root', start: 0, end: 200 };
    const childDatum: TraceDatum = {
      id: 'child',
      name: 'child',
      parentId: 'root',
      start: -20,
      end: 80,
      activeSegments: [{ start: -10, end: 30 }],
    };
    const root = normalizedSpan(rootDatum);
    const child = normalizedSpan(childDatum);

    const result = correctClockSkew([root, child]);

    expect(result[0]).toBe(root);
    expect(result[1]).toMatchObject({ start: 50, end: 150, skewCorrected: true });
    expect(result[1]?.activeSegments).toEqual([{ start: 60, end: 100 }]);
    expect(result[1]?.meta).toBe(childDatum);
    expect(child).toMatchObject({ start: -20, end: 80 });
    expect(child.activeSegments).toEqual([{ start: -10, end: 30 }]);
  });

  it('corrects nested spans independently against the corrected parent start', () => {
    const spans = [
      normalizedSpan({ id: 'root', name: 'root', start: 0, end: 200 }),
      normalizedSpan({ id: 'http', name: 'http', parentId: 'root', start: -20, end: 80 }),
      normalizedSpan({ id: 'before', name: 'before', parentId: 'http', start: -30, end: -10 }),
      normalizedSpan({ id: 'between', name: 'between', parentId: 'http', start: 0, end: 20 }),
      normalizedSpan({ id: 'after', name: 'after', parentId: 'http', start: 100, end: 120 }),
    ];

    const result = correctClockSkew(spans);

    expect(result.map(({ start, end, skewCorrected }) => ({ start, end, skewCorrected }))).toEqual([
      { start: 0, end: 200, skewCorrected: undefined },
      { start: 50, end: 150, skewCorrected: true },
      { start: 90, end: 110, skewCorrected: true },
      { start: 90, end: 110, skewCorrected: true },
      { start: 100, end: 120, skewCorrected: undefined },
    ]);
    expect(result[4]).toBe(spans[4]);
    expect(result[4]).not.toHaveProperty('skewCorrected');
  });

  it('moves a left-skewed zero-duration child to the parent midpoint', () => {
    const spans = [
      normalizedSpan({ id: 'root', name: 'root', start: 0, end: 100 }),
      normalizedSpan({ id: 'child', name: 'child', parentId: 'root', start: -10, end: -10 }),
    ];

    expect(correctClockSkew(spans)[1]).toMatchObject({ start: 50, end: 50, skewCorrected: true });
  });

  it('retains negative-duration spans, skips their incident edges, and resumes below a valid edge', () => {
    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const negativeParent = normalizedSpan({ id: 'negative-parent', name: 'negative parent', start: 100, end: 0 });
    const child = normalizedSpan({
      id: 'child',
      name: 'child',
      parentId: 'negative-parent',
      start: 0,
      end: 20,
    });
    const grandchild = normalizedSpan({
      id: 'grandchild',
      name: 'grandchild',
      parentId: 'child',
      start: -10,
      end: 0,
    });

    const result = correctClockSkew([negativeParent, child, grandchild]);

    expect(result[0]).toBe(negativeParent);
    expect(result[1]).toBe(child);
    expect(result[2]).toMatchObject({ start: 5, end: 15, skewCorrected: true });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'Trace chart: ignored clock-skew correction for 1 negative-duration span ("negative-parent").',
    );
  });

  it('skips both edges incident to a negative-duration child', () => {
    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const root = normalizedSpan({ id: 'root', name: 'root', start: 0, end: 100 });
    const negativeChild = normalizedSpan({
      id: 'negative-child',
      name: 'negative child',
      parentId: 'root',
      start: -10,
      end: -20,
    });
    const childOfNegative = normalizedSpan({
      id: 'child-of-negative',
      name: 'child of negative',
      parentId: 'negative-child',
      start: -30,
      end: -10,
    });
    const spans = [root, negativeChild, childOfNegative];

    expect(correctClockSkew(spans)).toBe(spans);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('bounds an aggregated negative-duration warning to five IDs', () => {
    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const spans = Array.from({ length: 7 }, (_, index) =>
      normalizedSpan({ id: `negative-${index}`, name: `negative ${index}`, start: 10, end: 0 }),
    );

    expect(correctClockSkew(spans)).toBe(spans);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'Trace chart: ignored clock-skew correction for 7 negative-duration spans ("negative-0", "negative-1", "negative-2", "negative-3", "negative-4", and 2 more).',
    );
  });

  it('does not warn when every duration is non-negative', () => {
    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const spans = [
      normalizedSpan({ id: 'root', name: 'root', start: 0, end: 100 }),
      normalizedSpan({ id: 'child', name: 'child', parentId: 'root', start: 10, end: 30 }),
    ];

    correctClockSkew(spans);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('retains cyclic spans without hanging', () => {
    const spans = [
      normalizedSpan({ id: 'a', name: 'a', parentId: 'b', start: 0, end: 40 }),
      normalizedSpan({ id: 'b', name: 'b', parentId: 'a', start: -10, end: 30 }),
    ];

    expect(correctClockSkew(spans)).toBe(spans);
  });

  it('retains duplicate-id objects and input order when another subtree is corrected', () => {
    const duplicateA = normalizedSpan({ id: 'duplicate', name: 'duplicate A', start: 200, end: 220 });
    const duplicateB = normalizedSpan({ id: 'duplicate', name: 'duplicate B', start: 230, end: 250 });
    const spans = [
      duplicateA,
      normalizedSpan({ id: 'root', name: 'root', start: 0, end: 100 }),
      duplicateB,
      normalizedSpan({ id: 'child', name: 'child', parentId: 'root', start: -10, end: 50 }),
    ];

    const result = correctClockSkew(spans);

    expect(result).toHaveLength(4);
    expect(result[0]).toBe(duplicateA);
    expect(result[2]).toBe(duplicateB);
    expect(result.map(({ name }) => name)).toEqual(['duplicate A', 'root', 'duplicate B', 'child']);
  });
});

// ---------------------------------------------------------------------------
// normalize
// ---------------------------------------------------------------------------
describe('normalize', () => {
  describe('traceId filter', () => {
    const multiTrace: TraceDatum[] = [
      { id: 'a', name: 'a', start: 0, end: 10, traceId: 't1' },
      { id: 'b', name: 'b', start: 0, end: 10, traceId: 't2' },
    ];

    it('keeps only spans matching the given traceId', () => {
      const { spans } = normalize(multiTrace, 'time', 't1');
      expect(spans.map((s) => s.id)).toEqual(['a']);
    });

    it('returns an empty spans array when traceId matches nothing', () => {
      const { spans } = normalize(multiTrace, 'time', 'unknown');
      expect(spans).toHaveLength(0);
    });

    it('logs a dev-warn when traceId matches no spans and the input is non-empty', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      normalize(multiTrace, 'time', 'unknown');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('unknown'));
      warnSpy.mockRestore();
    });

    it('does not warn when traceId matches some spans', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      normalize(multiTrace, 'time', 't1');
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('multi-trace dev-warn', () => {
    const multiTrace: TraceDatum[] = [
      { id: 'a', name: 'a', start: 0, end: 10, traceId: 't1' },
      { id: 'b', name: 'b', start: 0, end: 10, traceId: 't2' },
    ];

    it('warns when spans from more than one trace are present and no traceId is given', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      normalize(multiTrace, 'time');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      warnSpy.mockRestore();
    });

    it('does not warn when a traceId is given', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      normalize(multiTrace, 'time', 't1');
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('does not warn for a single trace', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      normalize(simpleData, 'time');
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('linear re-zero vs. time epoch', () => {
    it('keeps epoch ms under xScaleType "time"', () => {
      const { spans, domain } = normalize(simpleData, 'time');
      expect(domain).toEqual({ min: 1000, max: 2000 });
      expect(spans.find((s) => s.id === 'a')).toMatchObject({ start: 1000, end: 2000 });
    });

    it('re-zeros spans and the domain to the domain minimum under xScaleType "linear"', () => {
      const { spans, domain } = normalize(simpleData, 'linear');
      expect(domain).toEqual({ min: 0, max: 1000 });
      expect(spans.find((s) => s.id === 'a')).toMatchObject({ start: 0, end: 1000 });
    });
  });

  describe('meta retention', () => {
    it('retains the original TraceDatum as meta', () => {
      const { spans } = normalize(simpleData, 'time');
      expect(spans[0]?.meta).toBe(simpleData[0]);
    });

    it('retains the original TraceDatum (with its OtelSpan meta) when data came from fromOtlp', () => {
      const data = fromOtlp(otelSpans);
      const { spans } = normalize(data, 'time');
      // meta is the TraceDatum; meta.meta is the OtelSpan
      expect(spans[0]?.meta).toBe(data[0]);
      expect((spans[0]?.meta as TraceDatum).meta).toBe(otelSpans[0]);
    });
  });

  describe('empty input', () => {
    it('returns no spans and a zeroed domain', () => {
      expect(normalize([], 'time')).toEqual({ spans: [], domain: { min: 0, max: 0 }, criticalIntervals: [] });
    });
  });

  describe('emptyReason', () => {
    const data: TraceDatum[] = [{ id: 'a', name: 'a', start: 0, end: 10, traceId: 't1' }];

    it('is "trace-not-found" when traceId is set but matches no spans', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const result = normalize(data, 'time', 'does-not-exist');
      expect(result.emptyReason).toBe('trace-not-found');
      warnSpy.mockRestore();
    });

    it('is undefined for a normal render (traceId matches spans)', () => {
      expect(normalize(data, 'time', 't1').emptyReason).toBeUndefined();
    });

    it('is undefined for combined-waterfall mode (no traceId)', () => {
      expect(normalize(data, 'time').emptyReason).toBeUndefined();
    });

    it('is undefined when data is empty (no-data case belongs to isChartEmpty, not emptyReason)', () => {
      expect(normalize([], 'time', 'any-id').emptyReason).toBeUndefined();
    });

    it('is undefined when traceId matches but all spans have non-finite timestamps (data-quality, not trace-not-found)', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      const badData: TraceDatum[] = [{ id: 'a', name: 'a', start: NaN, end: 10, traceId: 't1' }];
      // selectTrace returns the span (traceId matched) — traceNotFound is false.
      // dropNonFinite then removes it. emptyReason stays undefined.
      const result = normalize(badData, 'time', 't1');
      expect(result.emptyReason).toBeUndefined();
      warnSpy.mockRestore();
    });
  });

  describe('colorBy', () => {
    const VIZ_COLORS = ['red', 'green', 'blue'];

    const spanWithService = (id: string, service: string, start = 0, end = 10): TraceDatum => ({
      id,
      name: id,
      start,
      end,
      meta: { resource: { attributes: [{ key: 'service.name', value: service }] } },
    });

    const spanWithKind = (id: string, kind: number, start = 0, end = 10): TraceDatum => ({
      id,
      name: id,
      start,
      end,
      meta: { kind },
    });

    it('assigns group colors to active segments via NormalizedSpan.color', () => {
      // Single elected tree (a → b) so partial-trace recovery keeps both spans (Spec 26).
      const data = [spanWithService('a', 'svc-A'), { ...spanWithService('b', 'svc-B'), parentId: 'a' }];
      const { spans } = normalize(data, 'time', undefined, colorByOtelAttribute('service.name'), VIZ_COLORS);
      expect(spans.find((s) => s.id === 'a')?.color).toBe('red');
      expect(spans.find((s) => s.id === 'b')?.color).toBe('green');
    });

    it('explicit TraceDatum.color wins over the group color', () => {
      const data: TraceDatum[] = [
        { ...spanWithService('a', 'svc-A'), color: 'hotpink' },
        { ...spanWithService('b', 'svc-B'), parentId: 'a' },
      ];
      const { spans } = normalize(data, 'time', undefined, colorByOtelAttribute('service.name'), VIZ_COLORS);
      expect(spans.find((s) => s.id === 'a')?.color).toBe('hotpink'); // explicit wins
      // svc-A still occupies palette index 0 in buildColorMap (first-seen, regardless of explicit override)
      // so svc-B gets index 1 → 'green'
      expect(spans.find((s) => s.id === 'b')?.color).toBe('green');
    });

    it('falls through to undefined (renderer default) when colorBy returns undefined for a span', () => {
      const data: TraceDatum[] = [
        { id: 'no-meta', name: 'no-meta', start: 0, end: 10 }, // no meta → accessor returns undefined
      ];
      const { spans } = normalize(data, 'time', undefined, colorByOtelAttribute('service.name'), VIZ_COLORS);
      expect(spans[0]?.color).toBeUndefined();
    });

    it('falls through to undefined when vizColors is empty', () => {
      const data = [spanWithService('a', 'svc-A')];
      const { spans } = normalize(data, 'time', undefined, colorByOtelAttribute('service.name'), []);
      expect(spans[0]?.color).toBeUndefined();
    });

    it('returns undefined color when neither colorBy nor vizColors is supplied', () => {
      const data = [spanWithService('a', 'svc-A')];
      const { spans } = normalize(data, 'time');
      expect(spans[0]?.color).toBeUndefined();
    });

    it('colorByOtelKind groups by kind number', () => {
      // Single elected tree (a → b, a → c) so recovery keeps all three spans (Spec 26).
      const data = [
        spanWithKind('a', 2),
        { ...spanWithKind('b', 3), parentId: 'a' },
        { ...spanWithKind('c', 2), parentId: 'a' },
      ];
      const { spans } = normalize(data, 'time', undefined, colorByOtelKind(), VIZ_COLORS);
      expect(spans.find((s) => s.id === 'a')?.color).toBe('red');
      expect(spans.find((s) => s.id === 'b')?.color).toBe('green');
      expect(spans.find((s) => s.id === 'c')?.color).toBe('red'); // same kind → same color
    });

    it('colorByOtelAttribute reads span-level attribute before resource attribute', () => {
      // span has http.method on span.attributes AND (hypothetically) on resource — span wins
      const data: TraceDatum[] = [
        {
          id: 'a',
          name: 'a',
          start: 0,
          end: 10,
          meta: {
            attributes: [{ key: 'service.name', value: 'span-level' }],
            resource: { attributes: [{ key: 'service.name', value: 'resource-level' }] },
          },
        },
      ];
      const accessor = colorByOtelAttribute('service.name');
      const key = accessor(data[0]!);
      expect(key).toBe('span-level'); // span attribute wins
    });

    it('colorByOtelAttribute falls back to resource attribute when span attribute is absent', () => {
      const datum = spanWithService('a', 'checkout'); // resource only
      const accessor = colorByOtelAttribute('service.name');
      expect(accessor(datum)).toBe('checkout');
    });

    it('colorByOtelAttribute returns undefined when attribute is absent from both', () => {
      const datum: TraceDatum = { id: 'a', name: 'a', start: 0, end: 10, meta: { attributes: [] } };
      expect(colorByOtelAttribute('service.name')(datum)).toBeUndefined();
    });

    it('colorByOtelKind returns undefined when kind is absent', () => {
      const datum: TraceDatum = { id: 'a', name: 'a', start: 0, end: 10, meta: {} };
      expect(colorByOtelKind()(datum)).toBeUndefined();
    });

    it('uses a stable color map across traceId selection (map built over full data)', () => {
      // svc-A spans two traces; its color should be 'red' regardless of which trace is shown
      const data: TraceDatum[] = [
        { ...spanWithService('t1-a', 'svc-A', 0, 10), traceId: 't1' },
        { ...spanWithService('t1-b', 'svc-B', 5, 10), traceId: 't1', parentId: 't1-a' },
        { ...spanWithService('t2-a', 'svc-A', 0, 10), traceId: 't2' },
      ];
      const colorBy = colorByOtelAttribute('service.name');
      const { spans: t1Spans } = normalize(data, 'time', 't1', colorBy, VIZ_COLORS);
      const { spans: t2Spans } = normalize(data, 'time', 't2', colorBy, VIZ_COLORS);
      // svc-A is first-seen in both calls because the map is built over all 3 spans
      expect(t1Spans.find((s) => s.id === 't1-a')?.color).toBe('red');
      expect(t2Spans.find((s) => s.id === 't2-a')?.color).toBe('red');
    });

    it('colorByOtelAttribute resolves service.name from fromOtlp envelope data', () => {
      const envelope: OtlpEnvelope = {
        resourceSpans: [
          {
            resource: { attributes: [{ key: 'service.name', value: 'my-svc' }] },
            scopeSpans: [
              {
                spans: [
                  {
                    spanId: 'x',
                    name: 'op',
                    traceId: 't1',
                    startTimeUnixNano: '0',
                    endTimeUnixNano: '1000000000',
                  },
                ],
              },
            ],
          },
        ],
      };
      const data = fromOtlp(envelope);
      const { spans } = normalize(data, 'time', undefined, colorByOtelAttribute('service.name'), VIZ_COLORS);
      expect(spans[0]?.color).toBe('red'); // first group → first palette entry
    });
  });

  describe('explicit activeSegments', () => {
    it('copies activeSegments through unchanged under xScaleType "time"', () => {
      const { spans } = normalize(simpleData, 'time');
      expect(spans.find((s) => s.id === 'b')?.activeSegments).toEqual([
        { start: 1200, end: 1300 },
        { start: 1400, end: 1500 },
      ]);
    });

    it('re-zeros activeSegments identically to their span\'s own start/end under xScaleType "linear"', () => {
      const { spans } = normalize(simpleData, 'linear');
      const child = spans.find((s) => s.id === 'b');
      // domain min is 1000 (span "a"'s start); span "b" re-zeros from 1200/1500 to 200/500
      expect(child).toMatchObject({ start: 200, end: 500 });
      expect(child?.activeSegments).toEqual([
        { start: 200, end: 300 },
        { start: 400, end: 500 },
      ]);
    });

    it('defaults to an empty array when no activeSegments is supplied', () => {
      const { spans } = normalize(simpleData, 'time');
      expect(spans.find((s) => s.id === 'a')?.activeSegments).toEqual([]);
    });

    it('always yields an empty activeSegments array for fromOtlp output (derived by self-time)', () => {
      const data = fromOtlp(otelSpans);
      const { spans } = normalize(data, 'time');
      expect(spans.every((s) => s.activeSegments.length === 0)).toBe(true);
    });
  });

  describe('segment phase coloring', () => {
    const VIZ_COLORS = ['red', 'green', 'blue'];

    it('assigns palette colors to labeled segments in first-seen order', () => {
      const data: TraceDatum[] = [
        {
          id: 'a',
          name: 'a',
          start: 0,
          end: 100,
          activeSegments: [
            { start: 0, end: 30, label: 'loading' },
            { start: 30, end: 80, label: 'process' },
            { start: 80, end: 100, label: 'final' },
          ],
        },
      ];
      const { spans } = normalize(data, 'time', undefined, undefined, VIZ_COLORS);
      const segs = spans[0]?.activeSegments ?? [];
      expect(segs[0]?.color).toBe('red'); // loading → index 0
      expect(segs[1]?.color).toBe('green'); // process → index 1
      expect(segs[2]?.color).toBe('blue'); // final → index 2
    });

    it('the same label across multiple spans maps to the same color', () => {
      const data: TraceDatum[] = [
        { id: 'a', name: 'a', start: 0, end: 100, activeSegments: [{ start: 0, end: 50, label: 'loading' }] },
        {
          id: 'b',
          name: 'b',
          start: 0,
          end: 100,
          parentId: 'a',
          activeSegments: [{ start: 0, end: 50, label: 'loading' }],
        },
      ];
      const { spans } = normalize(data, 'time', undefined, undefined, VIZ_COLORS);
      expect(spans[0]?.activeSegments[0]?.color).toBe('red');
      expect(spans[1]?.activeSegments[0]?.color).toBe('red'); // same label → same color
    });

    it('explicit segment.color wins over the label-derived palette color', () => {
      const data: TraceDatum[] = [
        {
          id: 'a',
          name: 'a',
          start: 0,
          end: 100,
          activeSegments: [
            { start: 0, end: 50, label: 'loading', color: 'hotpink' }, // explicit override
            { start: 50, end: 100, label: 'loading' }, // same label, no explicit color
          ],
        },
      ];
      const { spans } = normalize(data, 'time', undefined, undefined, VIZ_COLORS);
      const segs = spans[0]?.activeSegments ?? [];
      expect(segs[0]?.color).toBe('hotpink'); // explicit wins
      expect(segs[1]?.color).toBe('red'); // label-derived (loading → index 0)
    });

    it('segment without label or color has no color property', () => {
      const data: TraceDatum[] = [
        {
          id: 'a',
          name: 'a',
          start: 0,
          end: 100,
          activeSegments: [{ start: 0, end: 100 }],
        },
      ];
      const { spans } = normalize(data, 'time', undefined, undefined, VIZ_COLORS);
      expect(spans[0]?.activeSegments[0]?.color).toBeUndefined();
    });

    it('project() preserves label and resolved color when re-zeroing under xScaleType "linear"', () => {
      const data: TraceDatum[] = [
        {
          id: 'a',
          name: 'a',
          start: 1000,
          end: 2000,
          activeSegments: [
            { start: 1000, end: 1300, label: 'loading' },
            { start: 1300, end: 2000, label: 'process' },
          ],
        },
      ];
      const { spans } = normalize(data, 'linear', undefined, undefined, VIZ_COLORS);
      const segs = spans[0]?.activeSegments ?? [];
      // domain min is 1000; rezeroed: loading [0, 300], process [300, 1000]
      expect(segs[0]).toMatchObject({ start: 0, end: 300, label: 'loading', color: 'red' });
      expect(segs[1]).toMatchObject({ start: 300, end: 1000, label: 'process', color: 'green' });
    });

    it('uses a stable segment color map across traceId selection', () => {
      const data: TraceDatum[] = [
        {
          id: 't1-a',
          name: 'a',
          start: 0,
          end: 100,
          traceId: 't1',
          activeSegments: [{ start: 0, end: 50, label: 'loading' }],
        },
        {
          id: 't2-a',
          name: 'a',
          start: 0,
          end: 100,
          traceId: 't2',
          activeSegments: [{ start: 0, end: 50, label: 'loading' }],
        },
      ];
      const { spans: t1 } = normalize(data, 'time', 't1', undefined, VIZ_COLORS);
      const { spans: t2 } = normalize(data, 'time', 't2', undefined, VIZ_COLORS);
      // map is built over full data before traceId filtering → stable across views
      expect(t1[0]?.activeSegments[0]?.color).toBe('red');
      expect(t2[0]?.activeSegments[0]?.color).toBe('red');
    });

    it('segment coloring works independently of span-level colorBy', () => {
      // Both segment labels and colorBy are active simultaneously; segment wins per precedence.
      const data: TraceDatum[] = [
        {
          id: 'a',
          name: 'a',
          start: 0,
          end: 100,
          meta: { resource: { attributes: [{ key: 'service.name', value: 'checkout' }] } },
          activeSegments: [
            { start: 0, end: 50, label: 'loading' },
            { start: 50, end: 100, label: 'process' },
          ],
        },
      ];
      const { spans } = normalize(data, 'time', undefined, colorByOtelAttribute('service.name'), VIZ_COLORS);
      // Span-level color: 'red' (first-seen 'checkout'). Segment loading → 'red' too (index 0 resets).
      // Both maps independently index from 0 — this is the documented behaviour.
      const segs = spans[0]?.activeSegments ?? [];
      expect(segs[0]?.color).toBe('red'); // loading → segment palette index 0
      expect(segs[1]?.color).toBe('green'); // process → segment palette index 1
    });
  });
});

// ---------------------------------------------------------------------------
// dropNonFinite — NaN / Infinity guard (Spec: Stage D-1)
// ---------------------------------------------------------------------------

describe('normalize — dropNonFinite guard', () => {
  const VALID: TraceDatum = { id: 'v', name: 'valid', start: 0, end: 100 };

  it('passes through spans with finite timestamps unchanged', () => {
    const { spans, domain } = normalize([VALID], 'linear');
    expect(spans).toHaveLength(1);
    expect(domain).toEqual({ min: 0, max: 100 });
  });

  it('drops a span whose start is NaN and keeps valid siblings', () => {
    const bad: TraceDatum = { id: 'bad', name: 'bad', start: NaN, end: 100 };
    const { spans, domain } = normalize([VALID, bad], 'linear');
    expect(spans).toHaveLength(1);
    expect(spans[0]?.id).toBe('v');
    expect(Number.isFinite(domain.min)).toBe(true);
    expect(Number.isFinite(domain.max)).toBe(true);
  });

  it('drops a span whose end is NaN', () => {
    const bad: TraceDatum = { id: 'bad', name: 'bad', start: 0, end: NaN };
    const { spans } = normalize([bad, VALID], 'linear');
    expect(spans).toHaveLength(1);
    expect(spans[0]?.id).toBe('v');
  });

  it('drops a span whose start is +Infinity', () => {
    const bad: TraceDatum = { id: 'bad', name: 'bad', start: Infinity, end: 100 };
    const { spans } = normalize([bad, VALID], 'linear');
    expect(spans).toHaveLength(1);
  });

  it('returns empty result and zero domain when ALL spans are non-finite', () => {
    const bad: TraceDatum = { id: 'bad', name: 'bad', start: NaN, end: NaN };
    const { spans, domain } = normalize([bad], 'linear');
    expect(spans).toHaveLength(0);
    expect(domain).toEqual({ min: 0, max: 0 });
  });

  it('strips only the non-finite activeSegments from an otherwise-valid span', () => {
    const span: TraceDatum = {
      id: 'v',
      name: 'valid',
      start: 0,
      end: 100,
      activeSegments: [
        { start: 10, end: 40 }, // finite — kept
        { start: NaN, end: 60 }, // NaN start — dropped
        { start: 50, end: Infinity }, // Infinity end — dropped
        { start: 70, end: 90 }, // finite — kept
      ],
    };
    const { spans } = normalize([span], 'linear');
    expect(spans).toHaveLength(1);
    expect(spans[0]?.activeSegments).toHaveLength(2);
    expect(spans[0]?.activeSegments[0]).toMatchObject({ start: 10, end: 40 });
    expect(spans[0]?.activeSegments[1]).toMatchObject({ start: 70, end: 90 });
  });

  it('emits a Logger.warn for each batch of dropped spans', () => {
    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const bad: TraceDatum = { id: 'bad', name: 'bad', start: NaN, end: 200 };
    normalize([VALID, bad], 'linear');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('dropped 1 span'));
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// normalize — criticalIntervals projection
// ---------------------------------------------------------------------------
describe('normalize — criticalIntervals', () => {
  const data: TraceDatum[] = [
    { id: 'root', name: 'root', start: 100, end: 300 },
    { id: 'child', name: 'child', parentId: 'root', start: 200, end: 250 },
  ];

  describe('linear mode', () => {
    it('re-zeros a critical interval by domainMin (parity with activeSegments)', () => {
      // domainMin = 100; interval {start:100, end:300} → {start:0, end:200}
      const { criticalIntervals } = normalize(data, 'linear', undefined, undefined, undefined, [
        { spanId: 'root', start: 100, end: 300 },
      ]);
      expect(criticalIntervals).toHaveLength(1);
      expect(criticalIntervals[0]).toMatchObject({ spanId: 'root', start: 0, end: 200 });
    });

    it('clamps an interval that extends past the span end', () => {
      // span 'child' projected: start=100, end=150; interval {start:100, end:300} → clamped to {100, 150}
      const { criticalIntervals } = normalize(data, 'linear', undefined, undefined, undefined, [
        { spanId: 'child', start: 200, end: 400 },
      ]);
      expect(criticalIntervals).toHaveLength(1);
      expect(criticalIntervals[0]).toMatchObject({ spanId: 'child', start: 100, end: 150 });
    });

    it('drops an interval that is fully outside the span extent after clamping', () => {
      // span 'child' projected: [100, 150]; interval {start:0, end:50} re-zeroed→{start:-100, end:-50} → fully outside
      const { criticalIntervals } = normalize(data, 'linear', undefined, undefined, undefined, [
        { spanId: 'child', start: 0, end: 50 },
      ]);
      expect(criticalIntervals).toHaveLength(0);
    });

    it('drops an interval where start >= end after clamping', () => {
      // interval on 'child' clamped to [100,150]; supply start=child.end (250), end=260 → after re-zero start=150, end=160;
      // clamp to [100,150] → start=150, end=150 → start >= end → dropped
      const { criticalIntervals } = normalize(data, 'linear', undefined, undefined, undefined, [
        { spanId: 'child', start: 250, end: 260 },
      ]);
      expect(criticalIntervals).toHaveLength(0);
    });

    it('survives a waiting-region interval (interval in [start, end] but not in activeSegments)', () => {
      // 'root' has no activeSegments; a waiting-region interval is still within [start, end]
      const { criticalIntervals } = normalize(data, 'linear', undefined, undefined, undefined, [
        { spanId: 'root', start: 150, end: 200 },
      ]);
      expect(criticalIntervals).toHaveLength(1);
      expect(criticalIntervals[0]).toMatchObject({ spanId: 'root', start: 50, end: 100 });
    });

    it('drops an interval with an unknown spanId', () => {
      const { criticalIntervals } = normalize(data, 'linear', undefined, undefined, undefined, [
        { spanId: 'unknown', start: 100, end: 200 },
      ]);
      expect(criticalIntervals).toHaveLength(0);
    });
  });

  describe('time mode', () => {
    it('does not re-zero in time mode (epoch times kept)', () => {
      // In time mode span 'root' stays at start=100, end=300; interval should be kept as-is
      const { criticalIntervals } = normalize(data, 'time', undefined, undefined, undefined, [
        { spanId: 'root', start: 150, end: 250 },
      ]);
      expect(criticalIntervals).toHaveLength(1);
      expect(criticalIntervals[0]).toMatchObject({ spanId: 'root', start: 150, end: 250 });
    });

    it('still clamps to span extent in time mode', () => {
      const { criticalIntervals } = normalize(data, 'time', undefined, undefined, undefined, [
        { spanId: 'root', start: 150, end: 400 },
      ]);
      expect(criticalIntervals).toHaveLength(1);
      expect(criticalIntervals[0]).toMatchObject({ spanId: 'root', start: 150, end: 300 });
    });

    it('still drops fully-outside intervals in time mode', () => {
      const { criticalIntervals } = normalize(data, 'time', undefined, undefined, undefined, [
        { spanId: 'root', start: 0, end: 50 },
      ]);
      expect(criticalIntervals).toHaveLength(0);
    });
  });

  it('returns empty criticalIntervals when no criticalPath is supplied', () => {
    const { criticalIntervals } = normalize(data, 'linear');
    expect(criticalIntervals).toEqual([]);
  });

  it.each([
    ['time', { spanStart: 150, spanEnd: 250, intervalStart: 170, intervalEnd: 190 }],
    ['linear', { spanStart: 50, spanEnd: 150, intervalStart: 70, intervalEnd: 90 }],
  ] as const)('translates an owning span critical interval by the same skew offset in %s mode', (mode, expected) => {
    const skewedData: TraceDatum[] = [
      { id: 'root', name: 'root', start: 100, end: 300 },
      { id: 'child', name: 'child', parentId: 'root', start: 80, end: 180 },
    ];

    const result = normalize(skewedData, mode, undefined, undefined, undefined, [
      { spanId: 'child', start: 100, end: 120 },
    ]);

    expect(result.spans[1]).toMatchObject({
      start: expected.spanStart,
      end: expected.spanEnd,
      skewCorrected: true,
    });
    expect(result.criticalIntervals).toEqual([
      { spanId: 'child', start: expected.intervalStart, end: expected.intervalEnd },
    ]);
  });
});

describe('normalize — corrected lane ordering', () => {
  it('orders siblings by their corrected starts', () => {
    const data: TraceDatum[] = [
      { id: 'root', name: 'root', start: 0, end: 200 },
      { id: 'a', name: 'a', parentId: 'root', start: -20, end: 80 },
      { id: 'b', name: 'b', parentId: 'root', start: 10, end: 30 },
    ];

    const { spans } = normalize(data, 'time');

    expect(orderLanes(spans, 'tree').lanes.map(({ id }) => id)).toEqual(['root', 'b', 'a']);
    expect(orderLanes(spans, 'chronological').lanes.map(({ id }) => id)).toEqual(['root', 'b', 'a']);
  });

  it('recomputes the linear domain after clamping a long child to its parent start', () => {
    const data: TraceDatum[] = [
      { id: 'root', name: 'root', start: 100, end: 200 },
      { id: 'child', name: 'child', parentId: 'root', start: 40, end: 190 },
    ];

    const result = normalize(data, 'linear');

    expect(result.domain).toEqual({ min: 0, max: 150 });
    expect(result.spans).toEqual([
      expect.objectContaining({ id: 'root', start: 0, end: 100 }),
      expect.objectContaining({ id: 'child', start: 0, end: 150, skewCorrected: true }),
    ]);
  });
});

describe('normalize — partial-trace recovery integration (Spec 26)', () => {
  it('reparents a left-skewed orphan under the recorded root and corrects it against that display parent', () => {
    const data: TraceDatum[] = [
      { id: 'root', name: 'root', start: 0, end: 200 },
      { id: 'orphan', name: 'orphan', parentId: 'missing', start: -20, end: 60 }, // left-skewed, missing parent
    ];
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const { spans } = normalize(data, 'time');
    const orphan = spans.find((s) => s.id === 'orphan')!;
    expect(orphan).toMatchObject({ orphaned: true, reparentedToSpanId: 'root', skewCorrected: true });
    expect(orphan.start).toBeGreaterThanOrEqual(spans.find((s) => s.id === 'root')!.start);
    warn.mockRestore();
  });

  it('leaves emptyReason undefined when recovery invalidates the entire result (cross-trace duplicate)', () => {
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const data: TraceDatum[] = [
      { id: 'a-root', name: 'a-root', traceId: 'A', start: 0, end: 10 },
      { id: 'shared', name: 'shared', traceId: 'A', parentId: 'a-root', start: 1, end: 5 },
      { id: 'b-root', name: 'b-root', traceId: 'B', start: 0, end: 10 },
      { id: 'shared', name: 'shared', traceId: 'B', parentId: 'b-root', start: 1, end: 5 },
    ];
    const result = normalize(data, 'time');
    expect(result.spans).toEqual([]);
    expect(result.emptyReason).toBeUndefined(); // blank mounted plot, not "trace-not-found"
    warn.mockRestore();
  });

  it('gives tree and chronological lane orders identical visible membership after recovery', () => {
    const data: TraceDatum[] = [
      { id: 'root', name: 'root', start: 0, end: 200 },
      { id: 'o1', name: 'o1', parentId: 'gone-1', start: 40, end: 120 },
      { id: 'o2', name: 'o2', parentId: 'gone-2', start: 10, end: 90 },
    ];
    const warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    const { spans } = normalize(data, 'time');
    const treeIds = orderLanes(spans, 'tree')
      .lanes.map((s) => s.id)
      .sort();
    const chronoIds = orderLanes(spans, 'chronological')
      .lanes.map((s) => s.id)
      .sort();
    expect(treeIds).toEqual(chronoIds);
    expect(treeIds).toEqual(['o1', 'o2', 'root']);
    warn.mockRestore();
  });
});
