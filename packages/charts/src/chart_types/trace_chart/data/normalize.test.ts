/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { nanoToMs, normalize } from './normalize';
import type { OtelSpan, OtlpEnvelope } from './types';
import { Logger } from '../../../utils/logger';
import type { TraceDatum } from '../trace_api';

const simpleData: TraceDatum[] = [
  { id: 'a', name: 'root', start: 1000, end: 2000, traceId: 't1' },
  {
    id: 'b',
    name: 'child',
    parentId: 'a',
    start: 1200,
    end: 1500,
    traceId: 't1',
    active: [
      { start: 1200, end: 1300 },
      { start: 1400, end: 1500 },
    ],
  },
];

// same timing as simpleData, expressed as OTLP nanos (1ms === 1_000_000ns); not half-mocked: carries
// the realistic attributes/status/kind fields a real exporter would emit
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

const otelEnvelope = {
  resourceSpans: [{ scopeSpans: [{ spans: [otelSpans[0]!] }] }, { scopeSpans: [{ spans: [otelSpans[1]!] }] }],
} satisfies OtlpEnvelope;

describe('normalize', () => {
  describe('otel envelope flatten', () => {
    it('flattens resourceSpans/scopeSpans/spans into the same result as a flat span array', () => {
      const fromEnvelope = normalize(otelEnvelope, 'otel', 'time');
      const fromFlat = normalize(otelSpans, 'otel', 'time');
      expect(fromEnvelope.spans.map((s) => s.id)).toEqual(fromFlat.spans.map((s) => s.id));
      expect(fromEnvelope.domain).toEqual(fromFlat.domain);
    });
  });

  describe('flat otel span array', () => {
    it('maps spanId/parentSpanId/name/traceId and converts nanos to ms', () => {
      const { spans } = normalize(otelSpans, 'otel', 'time');
      expect(spans).toEqual([
        expect.objectContaining({ id: 'a', name: 'root', parentId: undefined, traceId: 't1', start: 1000, end: 2000 }),
        expect.objectContaining({ id: 'b', name: 'child', parentId: 'a', traceId: 't1', start: 1200, end: 1500 }),
      ]);
    });
  });

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

  describe('parentSpanId -> parentId', () => {
    it('maps parentSpanId to parentId for otel input', () => {
      const { spans } = normalize(otelSpans, 'otel', 'time');
      expect(spans.find((s) => s.id === 'b')?.parentId).toBe('a');
      expect(spans.find((s) => s.id === 'a')?.parentId).toBeUndefined();
    });
  });

  describe('traceId filter', () => {
    const multiTrace: TraceDatum[] = [
      { id: 'a', name: 'a', start: 0, end: 10, traceId: 't1' },
      { id: 'b', name: 'b', start: 0, end: 10, traceId: 't2' },
    ];

    it('keeps only spans matching the given traceId', () => {
      const { spans } = normalize(multiTrace, 'simple', 'time', 't1');
      expect(spans.map((s) => s.id)).toEqual(['a']);
    });
  });

  describe('multi-trace dev-warn', () => {
    const multiTrace: TraceDatum[] = [
      { id: 'a', name: 'a', start: 0, end: 10, traceId: 't1' },
      { id: 'b', name: 'b', start: 0, end: 10, traceId: 't2' },
    ];

    it('warns when spans from more than one trace are present and no traceId is given', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      normalize(multiTrace, 'simple', 'time');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      warnSpy.mockRestore();
    });

    it('does not warn when a traceId is given', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      normalize(multiTrace, 'simple', 'time', 't1');
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('does not warn for a single trace', () => {
      const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
      normalize(simpleData, 'simple', 'time');
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('linear re-zero vs. time epoch', () => {
    it('keeps epoch ms under xScaleType "time"', () => {
      const { spans, domain } = normalize(simpleData, 'simple', 'time');
      expect(domain).toEqual({ min: 1000, max: 2000 });
      expect(spans.find((s) => s.id === 'a')).toMatchObject({ start: 1000, end: 2000 });
    });

    it('re-zeros spans and the domain to the domain minimum under xScaleType "linear"', () => {
      const { spans, domain } = normalize(simpleData, 'simple', 'linear');
      expect(domain).toEqual({ min: 0, max: 1000 });
      expect(spans.find((s) => s.id === 'a')).toMatchObject({ start: 0, end: 1000 });
    });
  });

  describe('meta retention', () => {
    it('retains the original TraceDatum as meta for simple format', () => {
      const { spans } = normalize(simpleData, 'simple', 'time');
      expect(spans[0]?.meta).toBe(simpleData[0]);
    });

    it('retains the original OtelSpan as meta for otel format', () => {
      const { spans } = normalize(otelSpans, 'otel', 'time');
      expect(spans[0]?.meta).toBe(otelSpans[0]);
    });
  });

  describe('empty input', () => {
    it('returns no spans and a zeroed domain for simple format', () => {
      expect(normalize([], 'simple', 'time')).toEqual({ spans: [], domain: { min: 0, max: 0 } });
    });

    it('returns no spans and a zeroed domain for otel format', () => {
      expect(normalize([], 'otel', 'time')).toEqual({ spans: [], domain: { min: 0, max: 0 } });
    });
  });

  describe('explicit active (simple format)', () => {
    it('copies active through unchanged under xScaleType "time"', () => {
      const { spans } = normalize(simpleData, 'simple', 'time');
      expect(spans.find((s) => s.id === 'b')?.active).toEqual([
        { start: 1200, end: 1300 },
        { start: 1400, end: 1500 },
      ]);
    });

    it('re-zeros active segments identically to their span\'s own start/end under xScaleType "linear"', () => {
      const { spans } = normalize(simpleData, 'simple', 'linear');
      const child = spans.find((s) => s.id === 'b');
      // domain min is 1000 (span "a"'s start); span "b" re-zeros from 1200/1500 to 200/500
      expect(child).toMatchObject({ start: 200, end: 500 });
      expect(child?.active).toEqual([
        { start: 200, end: 300 },
        { start: 400, end: 500 },
      ]);
    });

    it('defaults to an empty array when no active is supplied', () => {
      const { spans } = normalize(simpleData, 'simple', 'time');
      expect(spans.find((s) => s.id === 'a')?.active).toEqual([]);
    });
  });

  describe('otel active', () => {
    it('always yields an empty active array, regardless of scale type', () => {
      const { spans: timeSpans } = normalize(otelSpans, 'otel', 'time');
      const { spans: linearSpans } = normalize(otelSpans, 'otel', 'linear');
      expect(timeSpans.every((s) => s.active.length === 0)).toBeTrue();
      expect(linearSpans.every((s) => s.active.length === 0)).toBeTrue();
    });
  });
});
