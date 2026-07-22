# Spec 22 — Critical path

**Goal:** render a consumer-supplied, interval-precise critical path as a distinct colored line along
the bottom edge of the affected lanes. Presence of the `criticalPath` prop is the on/off toggle
(supply it → drawn; omit/empty → nothing). Enables a consumer's "Show critical path" checkbox
(Kibana APM style) by conditionally passing the prop.

See [ADR 0015](../0015-critical-path-consumer-supplied-intervals.md) for the rationale: why
consumer-supplied, why interval-precise, and why the re-zero lives in the pipeline.

**Depends on:**
- [Spec 5](./spec-5-canvas2d-renderer.md) — `draw(ctx, geom, style)` contract, `renderMultiLine`
  primitive, `LANE_PADDING` constant, `firstLane`/`lastLane` culling.
- [Spec 12](./spec-12-accessibility.md) — `laneHeight` in geometry, lane-index arithmetic.
- [Spec 13](./spec-13-segment-selection.md) — `buildGeometry` extra-parameter + resolved-field
  pattern (e.g. `resolvedSelection`); `spanId→laneIndex` map; pipeline-cache key pattern.

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — export `TraceCriticalInterval` and
  `TraceCriticalPath`; add `criticalPath?: TraceCriticalPath` to `TraceSpec`.
- `packages/charts/src/chart_types/trace_chart/data/normalize.ts` — extend `normalize()` to accept
  and project `criticalPath` intervals (re-zero + clamp inside `project()`). Extend `NormalizeResult`
  to carry projected intervals. This is **the** location of the re-zero; doing it in `buildGeometry`
  would require threading `domainMin` backwards past the frozen `draw(ctx, geom, style)` contract.
- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add `criticalPathColor: Color` and
  `criticalPathThickness: number` to `TraceStyle`; add
  `criticalIntervalsByLane: ReadonlyMap<number, ReadonlyArray<{ start: number; end: number }>>` to
  `TraceGeometry` (keeps the frozen contract — ADR 0001).
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — accept the projected intervals
  from the pipeline; reuse the existing `spanId→laneIndex` map; populate
  `geom.criticalIntervalsByLane`.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — add a critical-path
  draw pass after the active-segment fills, before the connections/selection passes (z-order: fills →
  **critical-path** → connections → selection outlines).
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — add `criticalPath` as a cache key
  in `getPipeline()` (alongside `dataRef`, `xScaleType`, `traceId`, `colorBy`, `vizColors` at
  `trace_chart.tsx:545-551`); pass `spec.criticalPath` into `normalize()`; thread the projected
  result into `buildGeometry()` in `frame()`. No new instance state; no event handlers.
- `packages/charts/src/utils/themes/theme.ts` and the six theme files
  (`light_theme.ts`, `dark_theme.ts`, `amsterdam_light_theme.ts`, `amsterdam_dark_theme.ts`,
  `legacy_light_theme.ts`, `legacy_dark_theme.ts`) — add `criticalPathColor` and
  `criticalPathThickness` to the `trace:` block.
- `storybook/stories/trace/19_critical_path.story.tsx` — new story; register in `trace.stories.tsx`.

## Contract

### Public types (`trace_api.ts`)

```ts
/**
 * One interval-precise portion of the critical path within a span. May cover only part of a
 * segment. Times are in the same units as {@link TraceDatum} `start`/`end` (pre-normalization).
 * @public
 */
export interface TraceCriticalInterval {
  spanId: string;
  start: number;
  end: number;
}

/** Array of critical intervals. Empty = nothing drawn. @public */
export type TraceCriticalPath = TraceCriticalInterval[];
```

New field on `TraceSpec`:
```ts
/**
 * Consumer-supplied critical-path intervals. Each marks an interval-precise portion of a span that
 * lay on the trace's critical path; rendered as a colored line along the bottom edge of the lane.
 * When omitted or empty, nothing is drawn — the prop's presence is the toggle.
 *
 * Times must be in the same units as {@link TraceDatum} `start`/`end`. In `'linear'` x-scale mode
 * the chart re-zeros them internally alongside segment timestamps — supply raw pre-normalization
 * values.
 * @public
 */
criticalPath?: TraceCriticalPath;
```

### Pipeline extension (`normalize.ts`)

`normalize()` gains a `criticalPath?: TraceCriticalPath` parameter (optional, defaults to `[]`).
`NormalizeResult` gains
`criticalIntervals: Array<{ spanId: string; start: number; end: number }>` (projected, clamped).

Inside `project()`, when `xScaleType === 'linear'`, for each input interval:
1. If clock-skew correction moved the owning span (Spec 24), add that span's own correction offset
   to `start` and `end`.
2. Re-zero: `start -= min`, `end -= min`.
3. Clamp to the span's projected `[span.start, span.end]` (look up the span by `spanId` from the
   projected spans array; if the span is not found, drop the interval).
4. Drop if `start >= end` after clamping.

In `'time'` mode no re-zero is needed (times are already epoch-based); perform the clock-skew
translation when present, then clamp and drop. In both modes unknown `spanId` → drop.

**Cache key:** `getPipeline()` must add `criticalPath: spec.criticalPath` to `PipelineCache` and
include it in the cache-hit condition (same reference equality as `dataRef`, `colorBy`, etc.).

### Geometry extension (`render/types.ts` + `geometry.ts`)

New `TraceStyle` fields:
```ts
/** Color of the critical-path line drawn along the bottom edge of affected lanes. */
criticalPathColor: Color;
/** Thickness of the critical-path line in px. */
criticalPathThickness: number;
```

New `TraceGeometry` field:
```ts
/**
 * Projected critical intervals grouped by lane index. Populated by `buildGeometry` from the
 * pipeline output. Empty map when `criticalPath` is absent or empty.
 */
criticalIntervalsByLane: ReadonlyMap<number, ReadonlyArray<{ start: number; end: number }>>;
```

`buildGeometry()` gains a `criticalIntervals` parameter (the projected array from the pipeline).
It groups them by lane using the existing `spanId→laneIndex` map and returns the map.

### Render pass (`canvas2d_renderer.ts`)

After the active-segment fill loop, before the connections pass:

```
for each (laneIndex, intervals) of geom.criticalIntervalsByLane:
  if laneIndex < firstLane or laneIndex > lastLane: continue
  laneTop = plot.top + laneIndex * laneHeight - scrollOffset
  y = laneTop + laneHeight - LANE_PADDING
  for each interval of intervals:
    x1 = Math.max(plot.left, scale(interval.start))
    x2 = Math.min(plotRight, scale(interval.end))
    if x2 <= x1: continue
    renderMultiLine(ctx, [{ x1, y1: y, x2, y2: y }], {
      strokeWidth: style.criticalPathThickness,
      stroke: criticalPathRgba,   // resolved once per pass from style.criticalPathColor
    })
```

## Steps

1. Add `TraceCriticalInterval` and `TraceCriticalPath` to `trace_api.ts`; add `criticalPath` field to
   `TraceSpec`.
2. Extend `NormalizeResult` in `normalize.ts`; extend `normalize()` signature; add re-zero + clamp
   logic inside `project()`. Unit-test the projection.
3. Add `criticalPathColor` and `criticalPathThickness` to `TraceStyle`; set defaults in all six theme
   files and `theme.ts`.
4. Add `criticalIntervalsByLane` to `TraceGeometry`; extend `buildGeometry()` to accept and group the
   projected intervals.
5. Add the critical-path draw pass to `draw()` in `canvas2d_renderer.ts`.
6. Wire in `trace_chart.tsx`: add cache key, pass `criticalPath` into `normalize()`, thread projected
   intervals into `buildGeometry()`.
7. Author `19_critical_path.story.tsx`; register in `trace.stories.tsx`.

## Storybook

`storybook/stories/trace/19_critical_path.story.tsx`:
- Reuse the `12_kibana_trace` fixture (4-service OTel trace: frontend → checkout → payments /
  inventory).
- Hand-author a `criticalPath` that covers the gating chain (e.g. the `checkout-root` waiting gap
  and the full `pay-charge` span).
- `boolean('Show critical path', true)` knob conditionally supplies the `criticalPath` prop vs.
  `undefined`, demonstrating the presence-is-toggle behaviour.
- Show a sub-segment interval (e.g. only the last 200 ms of a 800 ms span) to demonstrate interval
  precision.

## Tests

- `normalize()` — linear re-zero: critical interval `{start: 100, end: 300}` with `domainMin=100`
  projects to `{start: 0, end: 200}` (parity with `activeSegments` re-zero).
- `normalize()` — out-of-extent clamp: interval extending past span end is clamped; fully-outside
  interval is dropped.
- `normalize()` — unknown `spanId`: interval is dropped silently.
- `normalize()` — `start >= end` after clamp: dropped.
- `normalize()` — `'time'` mode: no re-zero; clamp-only (still drops fully-outside intervals).
- `buildGeometry()` — maps projected intervals to the correct `laneIndex` for each `spanId`.
- `buildGeometry()` — empty input → empty `criticalIntervalsByLane` (no render attempt).
- Renderer smoke — visible lane: a critical interval in a visible lane produces a `renderMultiLine`
  call at the correct `y = laneTop + laneHeight - LANE_PADDING`.
- Renderer smoke — culled lane: an interval in a lane outside `[firstLane, lastLane]` produces no
  draw call.
- Sub-segment interval: an interval shorter than the parent segment produces a narrower drawn width.
- Cache invalidation: changing `criticalPath` reference triggers pipeline recompute.

## Out of scope (named follow-up)

- Screen-reader announcement of critical-path membership (e.g. "Critical path" row in the SR span
  table, ADR 0013).
- Tooltip / label showing which segment is on the critical path.
- A `label` field on `TraceCriticalInterval`.
- Keyboard reach to critical-interval details.

## Review (`/review-claudio`)

- Verify the re-zero is placed in `project()` (not `buildGeometry`), where `min` is still in scope.
- Verify `getPipeline()` cache key includes `criticalPath` reference; a new array reference with the
  same contents still invalidates (reference equality, consistent with `colorBy`).
- Verify `criticalIntervalsByLane` is not rebuilt on every rAF frame when `criticalPath` prop hasn't
  changed (it flows through `getPipeline()` → `buildGeometry()`; check no per-frame allocation).
- Verify `renderMultiLine` is called with a pre-resolved `Color` (same `segFillCache` pattern used
  for active segments) so repeated draws don't parse the color string every frame.
- Verify the critical-path pass respects the `firstLane`/`lastLane` culling.
- Verify `x1 < x2` guard before drawing to avoid zero-width line artefacts.

## Acceptance

- Supplying `criticalPath` draws a distinct colored line along the bottom edge of the affected lanes;
  omitting or supplying `[]` draws nothing.
- A critical interval shorter than its span's active segment draws only as wide as the interval (not
  the full segment).
- `'linear'` x-scale: a critical interval specified in raw epoch-ms times renders at the correct
  position after normalization (same visual x as the same time on the active segment).
- A critical interval belonging to a clock-skew-corrected span receives the same owning-span translation
  and retains its relative position within that span.
- Culled lanes (above/below the scroll viewport) produce no draw calls.
- `yarn jest trace_chart normalize` and `yarn typecheck` are green.
