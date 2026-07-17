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
 * Imperative control callbacks handed to the caller via `controlProviderCallback`.
 * Re-calling `scrollToSpan` with the same id re-triggers (no prop-diffing guard).
 * @public
 */
export interface TraceControlCallbacks {
  /**
   * Scroll the lane for the span with the given id into view (centered) and highlight it.
   * Does NOT move DOM keyboard focus (no focus-steal). Unknown id → dev-warn, no-op.
   * Imperative: re-calling with the same id re-triggers the scroll.
   */
  scrollToSpan: (id: string) => void;
}

/**
 * Shaped to match the OtelSpan fields read by the color-by helpers. Defined locally to avoid
 * a type-import cycle between trace_api ↔ otel_adapter.
 * @internal
 */
type SpanMeta = {
  attributes?: { key: string; value: unknown }[];
  resource?: { attributes?: { key: string; value: unknown }[] };
  kind?: number;
};

/**
 * Derives the color-group key for a span's active segments. Return `undefined` to fall through
 * to the themed default color. Two spans that return the same string receive the same palette color.
 *
 * Pass a **stable reference** (module-level const or memoized value) — a fresh function on every
 * render would rebuild the color map on every pipeline pass.
 * @public
 */
export type TraceColorAccessor = (datum: TraceDatum) => string | undefined;

/**
 * A single active-execution segment within a span.
 *
 * Segments sharing the same `label` are assigned the same palette color (cyclic index into
 * `theme.colors.vizColors`) and the label is shown in the tooltip as
 * "Active segment: <label> (i of n)". An explicit `color` wins over the label-derived palette
 * color, the span-level `TraceDatum.color`, and the themed `activeSegmentColor` default.
 * @public
 */
export interface TraceActiveSegment {
  start: number;
  end: number;
  /**
   * Phase name (e.g. `'loading'`, `'process'`, `'final'`). All segments with the same label
   * across every span receive the same palette color. Shows in the tooltip as
   * "Active segment: <label>".
   */
  label?: string;
  /**
   * Explicit per-segment color override. Wins over the label-derived palette color, the
   * span-level `TraceDatum.color`, and the themed `activeSegmentColor` default.
   */
  color?: Color;
}

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
   *
   * Each segment may carry an optional `label` (phase name) and an optional `color` override; see
   * {@link TraceActiveSegment} for precedence rules.
   */
  activeSegments?: TraceActiveSegment[];
  color?: Color;
  /**
   * Arbitrary per-span payload passed through unchanged to tooltip `datum` and element-event
   * callbacks. Use this to carry source-specific data (e.g. OTel `attributes`/`status` when the
   * data was produced by {@link fromOtlp}) without modifying the `TraceDatum` structure.
   */
  meta?: unknown;
}

/**
 * Identity of one selected segment (thin — used in the controlled `selection` prop).
 * @public
 */
export interface TraceSegmentRef {
  spanId: string;
  /** `'span'` = whole span selected (double-click). `'active'` | `'waiting'` = one segment. */
  region: 'span' | 'active' | 'waiting';
  /** 0-based index into `span.activeSegments` or `waitingSegments(span)`. -1 when `region === 'span'`. */
  segmentIndex: number;
}

/** Array of selected refs. Empty array = nothing selected. @public */
export type TraceSelection = TraceSegmentRef[];

/**
 * Rich per-entry detail fired via `onSelectionChange`. Carries all tooltip-equivalent data so
 * consumers don't need to re-derive durations. See ADR 0011 Decision 3.
 * @public
 */
export interface TraceSelectionDetail {
  spanId: string;
  name: string;
  parentId?: string;
  traceId?: string;
  /** Span start, rezeroed in `'linear'` mode. */
  start: number;
  /** Span end, same caveat. */
  end: number;
  duration: number;
  selfTime: number;
  datum: TraceDatum;
  region: 'span' | 'active' | 'waiting';
  segmentIndex: number;
  /** Present when `region !== 'span'`. */
  segmentStart?: number;
  segmentEnd?: number;
  segmentDuration?: number;
  /** Offset of the segment's start from the trace domain start, in ms. */
  segmentOffset?: number;
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
  /**
   * Derives the color-group key for each span's active segments. Two spans that return the same
   * key receive the same palette color (cyclic index into `theme.colors.vizColors`). Return
   * `undefined` to fall through to the themed `activeSegmentColor` default.
   *
   * Use the built-in helpers {@link colorByOtelAttribute} or {@link colorByOtelKind} for OTel data,
   * or supply a custom function. Pass a **module-level or memoized reference** — a fresh arrow per
   * render will rebuild the color map on every pipeline pass.
   *
   * Precedence per span: explicit `TraceDatum.color` > color-group color > themed default.
   */
  colorBy?: TraceColorAccessor;
  /**
   * Controls the order in which spans are assigned to lanes (top → bottom).
   *
   * - `'tree'` (**default**): depth-first `parentId` nesting — each parent is immediately followed
   *   by its descendants, recursively; siblings and roots are ordered by `start` ascending.
   *   Matches the Kibana APM trace view. In multi-trace mode (no `traceId` filter) this produces
   *   a forest: each subtree is grouped together rather than interleaved.
   * - `'chronological'`: ascending by span `start` (Chrome DevTools Network panel style). Use this
   *   when the trace has no meaningful nesting or when start-time ordering is the primary concern.
   *
   * See [ADR 0018](../../../../../../../docs/adr/trace-viz/0018-lane-ordering-tree-default.md).
   * @defaultValue 'tree'
   */
  laneOrder?: 'tree' | 'chronological';
  /**
   * Controls which gesture triggers the brush-to-zoom rubber-band.
   * - `'pan'` (default): plain drag pans; `Shift`+drag draws the brush.
   * - `'brush'`: plain drag draws the brush; `Shift`+drag pans.
   */
  dragMode?: 'pan' | 'brush';
  /**
   * When `true` (default), a small "keyboard active" badge appears in the top-left corner of the
   * chart while the canvas has keyboard focus, giving sighted users a WCAG 2.4.7 focus-visible cue.
   * Set to `false` to suppress the badge, e.g. in design mockups or when a custom focus indicator
   * is provided externally.
   * @defaultValue true
   */
  showKeyboardFocusBadge?: boolean;
  /**
   * Controlled selection. When supplied, this is the render source of truth; gestures still execute
   * and fire `onSelectionChange` — the parent decides whether to update the prop (perform-and-fire,
   * same model as `focusDomain`/ADR 0007). When omitted, the component manages selection internally.
   */
  selection?: TraceSelection;
  /**
   * Called once per completed gesture with the new thin `next` refs and rich `details`. Fires on
   * single-click (after the ~250 ms debounce), double-click, keyboard Enter/Space, and Escape.
   * Suppressed when the resulting set is identity-equal to the previous fire (no-op echo guard).
   */
  onSelectionChange?: (next: TraceSelection, details: TraceSelectionDetail[]) => void;
  /**
   * Imperative control registration (ADR 0008). When supplied, called on mount and whenever this
   * prop's reference changes, with the chart's live `TraceControlCallbacks`. Store the received
   * callbacks object and call its methods to drive the chart programmatically (e.g. scroll a span
   * into view from an external search box).
   *
   * The callback must be idempotent — it is called on every re-registration (prop reference change).
   */
  controlProviderCallback?: (callbacks: TraceControlCallbacks) => void;
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

/**
 * Returns a {@link TraceColorAccessor} that reads the given OTel attribute from each span.
 *
 * **Lookup precedence (span-level wins):** checks the span's own `attributes` first; if the key
 * is absent there, falls back to the span's resource `attributes` (where OTel resource-level
 * attributes such as `service.name` live after a {@link fromOtlp} conversion). Returns `undefined`
 * when the attribute is absent from both.
 *
 * Intended for use with data produced by {@link fromOtlp}. Assign the returned function to a
 * **module-level or memoized const** — a fresh call per render rebuilds the color map needlessly.
 *
 * ```ts
 * const BY_SERVICE = colorByOtelAttribute('service.name');
 * <Trace data={data} colorBy={BY_SERVICE} />
 * ```
 * @public
 */
export function colorByOtelAttribute(attribute: string): TraceColorAccessor {
  return (datum: TraceDatum): string | undefined => {
    const span = datum.meta as SpanMeta | undefined;
    if (span === undefined || span === null) return undefined;
    const spanAttr = span.attributes?.find((a) => a.key === attribute);
    if (spanAttr !== undefined) return String(spanAttr.value);
    const resourceAttr = span.resource?.attributes?.find((a) => a.key === attribute);
    if (resourceAttr !== undefined) return String(resourceAttr.value);
    return undefined;
  };
}

/**
 * Returns a {@link TraceColorAccessor} that groups spans by OTel span kind.
 *
 * Returns `String(span.kind)` when `kind` is present on the span; `undefined` otherwise (falls
 * through to the themed default). Intended for use with data produced by {@link fromOtlp}.
 *
 * Assign the returned function to a **module-level or memoized const**:
 * ```ts
 * const BY_KIND = colorByOtelKind();
 * <Trace data={data} colorBy={BY_KIND} />
 * ```
 * @public
 */
export function colorByOtelKind(): TraceColorAccessor {
  return (datum: TraceDatum): string | undefined => {
    const span = datum.meta as SpanMeta | undefined;
    return span?.kind !== null && span?.kind !== undefined ? String(span.kind) : undefined;
  };
}
