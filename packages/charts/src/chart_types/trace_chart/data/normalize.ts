/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan } from './types';
import { Logger } from '../../../utils/logger';
import type { TraceDatum, TraceSpec } from '../trace_api';

type XScaleType = TraceSpec['xScaleType'];

/** @internal */
export interface NormalizeResult {
  spans: NormalizedSpan[];
  domain: { min: number; max: number };
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
export function normalize(data: TraceDatum[], xScaleType: XScaleType, traceId?: string): NormalizeResult {
  const flat = parseSimple(data);
  const selected = selectTrace(flat, traceId);
  return project(selected, xScaleType);
}

function parseSimple(data: TraceDatum[]): NormalizedSpan[] {
  return data.map((datum) => ({
    id: datum.id,
    name: datum.name,
    parentId: datum.parentId,
    traceId: datum.traceId,
    start: datum.start,
    end: datum.end,
    activeSegments: datum.activeSegments ? datum.activeSegments.map((segment) => ({ ...segment })) : [],
    color: datum.color,
    meta: datum,
  }));
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
    activeSegments: span.activeSegments.map((segment) => ({ start: segment.start - min, end: segment.end - min })),
  }));
  return { spans: rezeroed, domain: { min: 0, max: max - min } };
}
