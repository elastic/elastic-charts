/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../../common/colors';
import type { TraceDatum } from '../trace_api';

/**
 * A single OpenTelemetry span, as it appears in an OTLP payload (JSON encoding: nanos are strings).
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
}

/**
 * The OTLP JSON envelope shape, as emitted by OTel exporters/collectors.
 * @public
 */
export interface OtlpEnvelope {
  resourceSpans: {
    scopeSpans: {
      spans: OtelSpan[];
    }[];
  }[];
}

/**
 * Accepted shapes for `format: 'otel'`: the full OTLP envelope, or a flat span array.
 * @public
 */
export type OtelInput = OtlpEnvelope | OtelSpan[];

/**
 * A span normalized from either input format, format-agnostic for every downstream stage.
 * @internal
 */
export interface NormalizedSpan {
  id: string;
  name: string;
  parentId?: string;
  traceId?: string;
  /** ms: epoch (xScaleType 'time') or relative-from-domain-min (xScaleType 'linear') */
  start: number;
  end: number;
  /** copied from TraceDatum.active if supplied (simple format only); else empty, resolved in Spec 2 */
  active: { start: number; end: number }[];
  color?: Color;
  /** the original datum, for custom tooltip / element callbacks */
  meta: TraceDatum | OtelSpan;
}
