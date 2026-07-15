/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '..';
import type { Color } from '../../common/colors';
import type { Spec } from '../../specs/spec_type';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { SFProps } from '../../state/spec_factory';
import { buildSFProps, useSpecFactory } from '../../state/spec_factory';
import { stripUndefined } from '../../utils/common';

// Re-export the OTel adapter so consumers don't need a separate import path.
export type { OtelInput, OtelSpan, OtlpEnvelope } from './data/otel_adapter';
export { fromOtlp } from './data/otel_adapter';

/**
 * A single span in the Trace chart input.
 * @public
 */
export interface TraceDatum {
  id: string;
  name: string;
  parentId?: string;
  traceId?: string;
  start: number;
  end: number;
  /**
   * Explicit active-execution segments for this span (the solid marks drawn inside the total-duration
   * line). When omitted, defaults to the span's self time — its `[start, end]` extent minus the union
   * of its direct children's extents (see ADR 0003). When supplied, the values are taken verbatim.
   */
  activeSegments?: { start: number; end: number }[];
  color?: Color;
  /**
   * Arbitrary per-span payload passed through unchanged to tooltip `datum` and element-event
   * callbacks. Use this to carry source-specific data (e.g. OTel `attributes`/`status` when the
   * data was produced by {@link fromOtlp}) without modifying the `TraceDatum` structure.
   */
  meta?: unknown;
}

/**
 * Spec for the Trace chart. Add one `<Trace>` inside a `<Chart>` to render a waterfall visualization.
 * @public
 */
export interface TraceSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Trace;
  /** Span data. Each element occupies exactly one lane in the waterfall. */
  data: TraceDatum[];
  /**
   * Controls the x-axis scale and domain-origin semantics:
   * - `'time'`: absolute epoch-ms; tick labels show wall-clock time.
   * - `'linear'`: elapsed-from-zero (domain rezeroed to the earliest span start); tick labels show elapsed duration.
   *
   * Both modes store domain values in milliseconds and share the same 1 ms minimum-visible-extent
   * floor. When using `'time'`, ensure your `start`/`end` values are epoch-millisecond timestamps
   * (e.g. `Date.now()`); small elapsed-ms values are interpreted as 1970-01-01 dates. Use `fromOtlp`
   * (which converts OTLP nanoseconds to epoch-ms) or add your own epoch offset.
   */
  xScaleType: 'time' | 'linear';
  /**
   * When set, only spans whose `traceId` matches this value are rendered. When omitted, all spans in
   * `data` are rendered as one combined waterfall (one lane per span, interleaved by start time).
   * An informational dev-mode warning is logged when spans from more than one trace are present and
   * `traceId` is not set.
   */
  traceId?: string;
  /**
   * When `true`, the tooltip also appears while hovering the empty region of a lane
   * (past the span's `[start, end]` extent). Defaults to `false` — the span, not the
   * whole lane, is the hover target.
   * @public
   */
  showTooltipOverEmpty?: boolean;
}

const buildProps = buildSFProps<TraceSpec>()(
  {
    chartType: ChartType.Trace,
    specType: SpecType.Series,
  },
  {
    xScaleType: 'time',
  },
);

/**
 * Adds a trace spec to the chart. Place inside a `<Chart>` component.
 *
 * ```tsx
 * <Chart>
 *   <Settings baseTheme={theme} />
 *   <Trace id="my-trace" data={spans} xScaleType="linear" />
 * </Chart>
 * ```
 *
 * For OpenTelemetry data, convert first with {@link fromOtlp}:
 * ```tsx
 * <Trace id="my-trace" data={fromOtlp(otlpEnvelope)} xScaleType="time" />
 * ```
 * @public
 */
export const Trace = (
  props: SFProps<
    TraceSpec,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) => {
  const { defaults, overrides } = buildProps;
  useSpecFactory<TraceSpec>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};
