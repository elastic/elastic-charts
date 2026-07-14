/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NormalizedSpan, OtelInput, OtelSpan, OtlpEnvelope } from './types';
import { Logger } from '../../../utils/logger';
import type { TraceDatum, TraceSpec } from '../trace_api';

type XScaleType = TraceSpec['xScaleType'];

/** @internal */
export interface NormalizeResult {
  spans: NormalizedSpan[];
  domain: { min: number; max: number };
}

/*
 * `data` and `format` are correlated (the caller-chosen format dictates which shape `data` is), so the
 * parameter list is a union of tuples rather than two independently-typed parameters: that lets
 * `format === 'simple'` narrow `data` to `TraceDatum[]` below without an `as` cast, and rejects
 * mismatched (data, format) pairs at every call site.
 */
type NormalizeArgs =
  | [data: TraceDatum[], format: 'simple', xScaleType: XScaleType, traceId?: string]
  | [data: OtelInput, format: 'otel', xScaleType: XScaleType, traceId?: string];

/**
 * Converts either input format into `NormalizedSpan[]`, carrying an explicit `active` through when the
 * simple format supplies one, else empty for self-time derivation to resolve. See ADR 0002.
 * @internal
 */
export function normalize(...[data, format, xScaleType, traceId]: NormalizeArgs): NormalizeResult {
  const flat = format === 'simple' ? parseSimple(data) : parseOtel(data);
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
    active: datum.active ? datum.active.map((segment) => ({ ...segment })) : [],
    color: datum.color,
    meta: datum,
  }));
}

function parseOtel(data: OtelInput): NormalizedSpan[] {
  const spans = isOtlpEnvelope(data) ? flattenEnvelope(data) : data;
  return spans.map((span) => ({
    id: span.spanId,
    name: span.name,
    parentId: span.parentSpanId,
    traceId: span.traceId,
    start: nanoToMs(span.startTimeUnixNano),
    end: nanoToMs(span.endTimeUnixNano),
    active: [], // OTel spans carry no active sub-range; resolved by self-time derivation (ADR 0003)
    meta: span,
  }));
}

function isOtlpEnvelope(data: OtelInput): data is OtlpEnvelope {
  return !Array.isArray(data) && 'resourceSpans' in data;
}

// defensive `?? []`: a partial/malformed OTLP payload may omit empty resourceSpans/scopeSpans/spans arrays
function flattenEnvelope(envelope: OtlpEnvelope): OtelSpan[] {
  return (envelope.resourceSpans ?? []).flatMap((resourceSpan) =>
    (resourceSpan.scopeSpans ?? []).flatMap((scopeSpan) => scopeSpan.spans ?? []),
  );
}

/**
 * Converts an OTLP nanosecond timestamp to epoch milliseconds via bigint arithmetic, so precision
 * isn't lost to floating point (epoch nanos exceed `Number.MAX_SAFE_INTEGER`). OTLP JSON emits nanos as
 * strings; some sources use number or bigint directly.
 *
 * Malformed values (non-integer strings such as `"12.5"` or `"abc"`) would throw a `SyntaxError`
 * inside `BigInt()`. Since OTLP data arrives from external pipelines, we guard with a try/catch and
 * return `NaN` (consistent with the defensive `?? []` in `flattenEnvelope`). Upstream code should
 * filter spans whose `start`/`end` are `NaN` before they reach geometry/rendering.
 * @internal
 */
export function nanoToMs(nano: string | number | bigint): number {
  try {
    const nanoBigInt = typeof nano === 'number' ? BigInt(Math.trunc(nano)) : BigInt(nano);
    const ms = nanoBigInt / 1_000_000n;
    const remainderNs = nanoBigInt % 1_000_000n;
    return Number(ms) + Number(remainderNs) / 1_000_000;
  } catch {
    Logger.warn(`nanoToMs: could not convert "${String(nano)}" to a BigInt — malformed OTLP timestamp; using NaN.`);
    return NaN;
  }
}

function selectTrace(spans: NormalizedSpan[], traceId?: string): NormalizedSpan[] {
  if (traceId) {
    return spans.filter((span) => span.traceId === traceId);
  }
  const distinctTraceIds = new Set(spans.map((span) => span.traceId));
  if (distinctTraceIds.size > 1) {
    Logger.warn(
      `Trace chart received spans from ${distinctTraceIds.size} distinct traces with no traceId set; keeping all.`,
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
    active: span.active.map((segment) => ({ start: segment.start - min, end: segment.end - min })),
  }));
  return { spans: rezeroed, domain: { min: 0, max: max - min } };
}
