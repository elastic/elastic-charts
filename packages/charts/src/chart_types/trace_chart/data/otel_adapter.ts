/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Logger } from '../../../utils/logger';
import type { TraceDatum } from '../trace_api';

/**
 * A single OpenTelemetry span, as it appears in an OTLP payload (JSON encoding: nanos are strings).
 *
 * When produced by {@link fromOtlp} from an {@link OtlpEnvelope}, the span is augmented with its
 * parent resource-span's `resource` field (not part of the raw OTLP span schema) so that
 * resource-level attributes such as `service.name` are reachable via `span.resource?.attributes`.
 * @public
 */
export interface OtelSpan {
  spanId: string;
  parentSpanId?: string;
  traceId?: string;
  name: string;
  startTimeUnixNano: string | number | bigint;
  endTimeUnixNano: string | number | bigint;
  attributes?: { key: string; value: unknown }[];
  status?: { code?: number; message?: string };
  kind?: number;
  /** Resource-level attributes attached by {@link fromOtlp}; absent when input is a flat span array. */
  resource?: { attributes?: { key: string; value: unknown }[] };
}

/**
 * The OTLP JSON envelope shape, as emitted by OTel exporters/collectors.
 * @public
 */
export interface OtlpEnvelope {
  resourceSpans: {
    /** Resource-level attributes (e.g. `service.name`) shared by all spans in this resource group. */
    resource?: { attributes?: { key: string; value: unknown }[] };
    scopeSpans: {
      spans: OtelSpan[];
    }[];
  }[];
}

/**
 * Accepted shapes for {@link fromOtlp}: the full OTLP envelope, or a flat span array.
 * @public
 */
export type OtelInput = OtlpEnvelope | OtelSpan[];

/**
 * OTLP/JSON encodes attribute values as an `AnyValue` union object, e.g.:
 * `{ stringValue: "checkout" }` or `{ intValue: 42 }`.
 *
 * Extracts the primitive member from a real OTLP `AnyValue`, and falls back to `String(value)`
 * for the simpler flat-scalar shape used by the story fixtures and non-OTLP adapters so the
 * behaviour is backward-compatible.
 *
 * Returns a string for every input (never `undefined`) so callers can use the result directly
 * as a color-group key.
 * @internal
 */
export function anyValueToString(value: unknown): string {
  if (value !== null && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    // Check well-known OTLP AnyValue keys in precedence order.
    if (typeof v['stringValue'] === 'string') return v['stringValue'];
    if (typeof v['intValue'] === 'number') return String(v['intValue']);
    if (typeof v['intValue'] === 'string') return v['intValue']; // some exporters keep it as string
    if (typeof v['doubleValue'] === 'number') return String(v['doubleValue']);
    if (typeof v['boolValue'] === 'boolean') return String(v['boolValue']);
    // arrayValue / kvlistValue → not useful as a color group key; fall through to String()
  }
  return String(value);
}

/**
 * Converts an OTLP nanosecond timestamp to epoch milliseconds via bigint arithmetic, so precision
 * isn't lost to floating point (epoch nanos exceed `Number.MAX_SAFE_INTEGER`). OTLP JSON emits nanos as
 * strings; some sources use number or bigint directly.
 *
 * Malformed values (non-integer strings such as `"12.5"` or `"abc"`) would throw a `SyntaxError`
 * inside `BigInt()`. Since OTLP data arrives from external pipelines, we guard with a try/catch and
 * return `NaN`. The `normalize` pipeline's `dropNonFinite` stage filters out any spans whose
 * `start`/`end` are `NaN` before they reach geometry/rendering.
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

function isOtlpEnvelope(data: OtelInput): data is OtlpEnvelope {
  return !Array.isArray(data) && 'resourceSpans' in data;
}

// defensive `?? []`: a partial/malformed OTLP payload may omit empty resourceSpans/scopeSpans/spans arrays.
// Each span is spread with its parent resource-span's `resource` so that resource-level attributes
// (e.g. `service.name`) are reachable via `span.resource?.attributes` after fromOtlp().
function flattenEnvelope(envelope: OtlpEnvelope): OtelSpan[] {
  return (envelope.resourceSpans ?? []).flatMap((resourceSpan) =>
    (resourceSpan.scopeSpans ?? []).flatMap((scopeSpan) =>
      (scopeSpan.spans ?? []).map((span) => ({ ...span, resource: resourceSpan.resource })),
    ),
  );
}

/**
 * Converts an OTLP envelope or flat `OtelSpan[]` to `TraceDatum[]`, suitable for passing directly
 * to `<Trace data={...} />`. The original `OtelSpan` is carried on each datum's `meta` field so
 * custom tooltips and element-event callbacks can access OTel `attributes` and `status`.
 *
 * ```tsx
 * import { fromOtlp } from '@elastic/charts';
 *
 * const data = fromOtlp(otlpEnvelope);
 * // In a custom tooltip: (values[0].datum as TraceDatum).meta as OtelSpan
 *
 * <Chart><Trace data={data} xScaleType="time" /></Chart>
 * ```
 * @public
 */
export function fromOtlp(data: OtelInput): TraceDatum[] {
  const spans = isOtlpEnvelope(data) ? flattenEnvelope(data) : data;
  return spans.map((span) => ({
    id: span.spanId,
    name: span.name,
    ...(span.parentSpanId !== undefined && { parentId: span.parentSpanId }),
    ...(span.traceId !== undefined && { traceId: span.traceId }),
    start: nanoToMs(span.startTimeUnixNano),
    end: nanoToMs(span.endTimeUnixNano),
    meta: span,
  }));
}
