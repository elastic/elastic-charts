/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from './types';
import { buildColorMap, buildSegmentColorMap } from './colors';
import { Logger } from '../../../utils/logger';
import type { Color } from '../../../common/colors';
import type { TraceDatum, TraceColorAccessor, TraceSpec } from '../trace_api';

type XScaleType = TraceSpec['xScaleType'];

/** @internal */
export interface NormalizeResult {
  spans: NormalizedSpan[];
  domain: { min: number; max: number };
  emptyReason?: 'trace-not-found';
}

/**
 * Prepares `TraceDatum[]` for rendering in three stages:
 *
 * 1. **Shape** — maps each `TraceDatum` to a `NormalizedSpan`, ensuring `activeSegments` is always
 *    an array (empty when not supplied; filled by `resolveActive` / ADR 0003) and `meta` always
 *    backrefs the original datum.
 * 2. **Filter** — when `traceId` is supplied, keeps only spans with a matching `traceId` and
 *    dev-warns when nothing matches. When omitted, all spans are rendered as one combined waterfall
 *    and a dev-warn fires if they span more than one distinct trace.
 * 3. **Project** — computes the domain `[min, max]`. Under `'linear'`, re-zeros `start`/`end`/
 *    `activeSegments` relative to the domain minimum (elapsed ms); under `'time'` keeps epoch ms.
 *
 * For OpenTelemetry data, call `fromOtlp()` first — it converts OTLP spans to `TraceDatum[]` and
 * carries the original `OtelSpan` on `datum.meta`.
 * @internal
 */
export function normalize(
  data: TraceDatum[],
  xScaleType: XScaleType,
  traceId?: string,
  colorBy?: TraceColorAccessor,
  vizColors?: Color[],
): NormalizeResult {
  // Build color maps over the full input — before traceId filtering — so colors are stable across
  // all traces/views (cross-trace color stability).
  const colorMap =
    colorBy !== undefined && vizColors !== undefined ? buildColorMap(data, colorBy, vizColors) : undefined;
  // Segment label map: same stability rationale as colorMap. Built unconditionally when vizColors is
  // present so segment labels work even without a span-level colorBy accessor.
  const segmentColorMap = vizColors !== undefined ? buildSegmentColorMap(data, vizColors) : undefined;
  const flat = parseSimple(data, colorBy, colorMap, segmentColorMap);
  const selected = selectTrace(flat, traceId);
  // Glossary-precise: trace-not-found means the traceId filter matched nothing, not that all
  // matched spans happened to have non-finite timestamps (dropNonFinite below handles that case).
  const traceNotFound = traceId !== undefined && flat.length > 0 && selected.length === 0;
  const finite = dropNonFinite(selected);
  const result = project(finite, xScaleType);
  if (traceNotFound) result.emptyReason = 'trace-not-found';
  return result;
}

function parseSimple(
  data: TraceDatum[],
  colorBy: TraceColorAccessor | undefined,
  colorMap: Map<string, Color> | undefined,
  segmentColorMap: Map<string, Color> | undefined,
): NormalizedSpan[] {
  return data.map((datum) => {
    const groupKey = colorBy !== undefined ? colorBy(datum) : undefined;
    const groupColor = groupKey !== undefined && colorMap !== undefined ? colorMap.get(groupKey) : undefined;
    return {
      id: datum.id,
      name: datum.name,
      parentId: datum.parentId,
      traceId: datum.traceId,
      start: datum.start,
      end: datum.end,
      activeSegments: datum.activeSegments
        ? datum.activeSegments.map((segment) => {
            // Precedence: explicit segment.color > label-derived palette color.
            // Span-level and themed fallbacks are applied in the renderer via activeFill.
            const resolvedColor =
              segment.color ?? (segment.label !== undefined ? segmentColorMap?.get(segment.label) : undefined);
            return resolvedColor !== undefined ? { ...segment, color: resolvedColor } : { ...segment };
          })
        : [],
      color: datum.color ?? groupColor,
      meta: datum,
    };
  });
}

function selectTrace(spans: NormalizedSpan[], traceId?: string): NormalizedSpan[] {
  if (traceId !== undefined) {
    const kept = spans.filter((span) => span.traceId === traceId);
    if (kept.length === 0 && spans.length > 0) {
      Logger.warn(`Trace chart: traceId "${traceId}" matched no spans; rendering empty.`);
    }
    return kept;
  }
  const distinctTraceIds = new Set(spans.map((span) => span.traceId));
  if (distinctTraceIds.size > 1) {
    Logger.warn(
      `Trace chart received spans from ${distinctTraceIds.size} distinct traces with no traceId set; rendering all as one combined waterfall.`,
    );
  }
  return spans;
}

/**
 * Drops spans whose `start` or `end` is non-finite (NaN / ±Infinity) and warns about the count.
 * Also strips individual `activeSegments` with non-finite bounds from otherwise-valid spans.
 *
 * This is the single choke point that defends both the direct `TraceDatum[]` path and the OTel
 * path (`fromOtlp` → `nanoToMs` → NaN on BigInt parse failure) from poisoning the domain.
 * `Math.min(x, NaN) === NaN`, so a single bad span in `project`'s reduce would blank the entire
 * chart. See otel_adapter.ts comment at L60-62 which promised this filter would exist here.
 *
 * Downstream safety: colorMaps are built over the full pre-filter input (color stability is
 * unaffected), and selection refs are spanId-based (lane reindexing after a drop is correct).
 */
function dropNonFinite(spans: NormalizedSpan[]): NormalizedSpan[] {
  const valid = spans
    .filter((span) => {
      if (!Number.isFinite(span.start) || !Number.isFinite(span.end)) {
        return false;
      }
      return true;
    })
    .map((span) => {
      const finiteSegments = span.activeSegments.filter(
        (seg) => Number.isFinite(seg.start) && Number.isFinite(seg.end),
      );
      return finiteSegments.length === span.activeSegments.length ? span : { ...span, activeSegments: finiteSegments };
    });

  const droppedSpans = spans.length - valid.length;
  if (droppedSpans > 0) {
    Logger.warn(
      `Trace chart: dropped ${droppedSpans} span${droppedSpans === 1 ? '' : 's'} with non-finite start/end timestamps (NaN or ±Infinity). Check your data source for failed timestamp conversions.`,
    );
  }
  return valid;
}

function project(spans: NormalizedSpan[], xScaleType: XScaleType): NormalizeResult {
  if (spans.length === 0) {
    return { spans: [], domain: { min: 0, max: 0 } };
  }
  const min = spans.reduce((acc, span) => Math.min(acc, span.start), Infinity);
  const max = spans.reduce((acc, span) => Math.max(acc, span.end), -Infinity);

  if (xScaleType === 'time') {
    return { spans, domain: { min, max } };
  }

  const rezeroed = spans.map((span) => ({
    ...span,
    start: span.start - min,
    end: span.end - min,
    activeSegments: span.activeSegments.map((segment) => ({ ...segment, start: segment.start - min, end: segment.end - min })),
  }));
  return { spans: rezeroed, domain: { min: 0, max: max - min } };
}
