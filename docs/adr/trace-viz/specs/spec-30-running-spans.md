# Spec 30 — Running spans (in-progress visualization)

**Goal:** accept and visualize spans that have started but not yet finished. A running span
(`TraceDatum.end` omitted or `null`) renders from its `start` to the trace's latest known finite
boundary (domain max: completed ends, running starts, and confirmed running active-segment ends)
using a **dashed** total line and no active-segment fabrication; the tooltip and
screen-reader surface show a **"running"** state with no duration number.

See [ADR 0023](../0023-running-span-model.md) for the rationale: why `end?: number | null` (vs a
`running` boolean), why domain max (vs a `now` prop or `Date.now()`), why no self-time fabrication,
and why the dashed visual.

**Depends on:**
- [Spec 1](./spec-1-normalization.md) — `normalize` pipeline, `parseSimple`, `dropNonFinite`,
  `project`; `NormalizedSpan` type.
- [Spec 2](./spec-2-self-time.md) — `resolveActive` (must skip running spans; no self-time
  fabrication up to a synthetic end).
- [Spec 3](./spec-3-geometry.md) + [Spec 5](./spec-5-canvas2d-renderer.md) — geometry contract,
  renderer, `TraceStyle` theme tokens.
- [Spec 7](./spec-7-tooltip-events.md) — `REGION_LABEL`, tooltip datum, duration display.
- [Spec 12](./spec-12-accessibility.md) — screen-reader span table, `totalDuration` field.
- [ADR 0023](../0023-running-span-model.md) — all non-obvious decisions recorded there.

**Ordering with Spec 24 (clock-skew correction):** the clock-skew stage runs **before** running-end
synthesis. An edge involving a running child or parent cannot originate correction because it has no
meaningful duration. The running span remains at its recorded start, carries no `skewCorrected`, and
is not reparented; its structural children remain attached. A deeper edge whose participants are both
completed may be evaluated independently. This spec's changes land after Spec 24's
`correctClockSkew` stage.
See [Spec 24](./spec-24-clock-skew.md).

## Scope guardrails

- No wall clock, `now` prop, polling, or continuous RAF work.
- No Spec 26 recovery implementation; keep running-end synthesis in `project` so a future recovery
  stage can determine visible membership before projection.
- No public `provisional` selection region. Provisional hover/click maps to the existing whole-span
  selection identity.
- Preserve collapsed-lane precedence and completed-span Active / Waiting behavior. Critical-path and
  connection semantics are unchanged by this spec.
- Aggregate `selfTime` presentation/payload semantics for running spans are deferred. This spec only
  prevents self-time derivation from the synthesized end and preserves explicitly supplied active
  segments; it does not widen existing public `selfTime` fields.
- Demonstrate the required mixed trace in Storybook. Cover all-running and zero-width behavior in
  unit tests rather than adding the optional second story panel.

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — `TraceDatum.end` → `end?: number | null`; update JSDoc.
- `packages/charts/src/chart_types/trace_chart/data/types.ts` — add `running: boolean` to `NormalizedSpan`; `end` stays `number` (the synthesized provisional end after `project`).
- `packages/charts/src/chart_types/trace_chart/data/normalize.ts` — changes to `parseSimple`, `dropNonFinite`, and `project` (see Steps below).
- `packages/charts/src/chart_types/trace_chart/data/self_time.ts` — `resolveActive`: skip self-time derivation for running spans.
- `packages/charts/src/chart_types/trace_chart/data/otel_adapter.ts` — `fromOtlp`: map a semantic zero
  `endTimeUnixNano` (`0`, `'0'`, or `0n`) → `end: null`.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — total-line pass: use the
  existing dashed `Stroke` support for running spans; add provisional-region and point-marker picking.
- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add `runningLineDash: number[]` to `TraceStyle`.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — map clicks on a provisional region
  to whole-span selection; announce "running" instead of a provisional duration.
- Six theme files (`light_theme.ts`, `dark_theme.ts`, `amsterdam_light_theme.ts`,
  `amsterdam_dark_theme.ts`, `legacy_light_theme.ts`, `legacy_dark_theme.ts`) — add
  `runningLineDash` to the `trace:` block; update complete `TraceStyle` test/story literals. The
  existing theme type and `buildTraceStyle` passthrough need no production change.
- `packages/charts/src/chart_types/trace_chart/render/tooltip.ts` — running state label; suppress duration number.
- `packages/charts/src/specs/settings.tsx` — `TraceElementEvent.duration` → `number | null`; document
  the provisional `end` reported for running spans.
- `packages/charts/src/chart_types/trace_chart/state/selectors/get_screen_reader_data.ts` — "running" announcement; suppress numeric duration.
- `storybook/stories/trace/32_running_spans.story.tsx` — new story; register in `trace.stories.tsx`.
- Existing trace stories that consume `TraceDatum.end` as a required number — preserve concrete
  fixture inference or narrow `end` before arithmetic / constructing full-span active segments.
- `packages/charts/api/charts.api.md` — regenerate the public API report.

## Contract

### Public API change (`trace_api.ts`)

```ts
export interface TraceDatum {
  id: string;
  name: string;
  parentId?: string;
  traceId?: string;
  start: number;
  /**
   * End time of the span in the same units as `start`. Omit (or pass `null`) to mark the span as
   * **running** — started but not yet finished. Running spans are rendered with a dashed total line
   * extending to the latest known finite boundary across all visible spans in the selected trace
   * data (completed ends, running starts, and confirmed running active-segment ends). Spec 26
   * recovery determines visible membership before projection.
   * Duration and elapsed-time fields are not shown in the tooltip or screen reader for running spans.
   */
  end?: number | null;
  activeSegments?: TraceActiveSegment[];
  color?: Color;
  meta?: unknown;
}
```

### Internal `NormalizedSpan` (`data/types.ts`)

Add:
```ts
/**
 * `true` when this span was supplied without an `end` (or with `end: null`). The `end` field on a
 * running span holds a **synthesized provisional value** (the domain max at normalization time) and
 * must not be treated as a real end timestamp. Always `false` on completed spans.
 */
running: boolean;
```

`end` stays a concrete `number` after `project` — the synthesized provisional end — so the rest of
the pipeline (geometry, renderer, scroll math) needs no further branching on `null`.

### OTel adapter (`data/otel_adapter.ts`)

OTel running spans set `endTimeUnixNano` to zero (not omitted — the field is always present).
The adapter accepts OTLP timestamps as `string | number | bigint`, so the sentinel may arrive as
`'0'`, `0`, or `0n`. `nanoToMs` yields `0` for all three representations; `dropNonFinite` would
*keep* that finite value, causing a running span to render as ending at the Unix epoch. Convert once,
then test the converted value:

```ts
const end = nanoToMs(span.endTimeUnixNano);
// ...
end: end === 0 ? null : end,
```

This covers every accepted zero representation without duplicating conversion logic. The BigInt /
string check that `nanoToMs` already performs still covers genuine parse failures.

## Steps

### 1. `parseSimple` — mark running spans

Set `running = datum.end == null` and pass `end` through as-is (the field is now nullable):

```ts
return {
  ...
  start: datum.start,
  end: datum.end ?? NaN,   // NaN as a temporary sentinel; dropNonFinite handles it below
  running: datum.end == null,
  ...
};
```

_Alternative:_ carry `end: datum.end` directly (typed as `number | null | undefined`) and push the
sentinel logic into `dropNonFinite`. Either approach is acceptable; pick the one that keeps the type
flow cleanest. The key invariant is that `running === true` ↔ `datum.end == null`.

### 2. `dropNonFinite` — relax for running spans

The current check:
```ts
if (!Number.isFinite(span.start) || !Number.isFinite(span.end)) return false;
```

Relax to keep running spans while still dropping the OTel-adapter NaN case and any other
genuine non-finite end:

```ts
if (!Number.isFinite(span.start)) return false;
if (!span.running && !Number.isFinite(span.end)) return false;
// (running spans may have NaN/null end at this stage — synthesized in project)
```

The warning count and message remain unchanged for genuinely dropped spans.

### 3. `project` — synthesize running ends and adjust domain max

```ts
// Collect finite ends from completed spans, starts from running spans, and confirmed ends from
// explicitly supplied active segments on running spans.
const min = spans.reduce((acc, s) => Math.min(acc, s.start), Infinity);
const maxFiniteEnd = spans.reduce((acc, s) => (!s.running ? Math.max(acc, s.end) : acc), -Infinity);
const maxRunningStart = spans.reduce((acc, s) => (s.running ? Math.max(acc, s.start) : acc), -Infinity);
const maxRunningActiveEnd = spans.reduce(
  (acc, s) =>
    s.running ? s.activeSegments.reduce((segmentAcc, segment) => Math.max(segmentAcc, segment.end), acc) : acc,
  -Infinity,
);
const max = Math.max(
  Number.isFinite(maxFiniteEnd) ? maxFiniteEnd : -Infinity,
  Number.isFinite(maxRunningStart) ? maxRunningStart : -Infinity,
  Number.isFinite(maxRunningActiveEnd) ? maxRunningActiveEnd : -Infinity,
);

// Synthesize provisional end for running spans.
const spansMaybeFixed = spans.map((s) =>
  s.running ? { ...s, end: Math.max(max, s.start) } : s,
);

// Re-zero (linear scale) or keep epoch (time scale) as today.
```

**Edge: all spans running** — `maxFiniteEnd` is `-Infinity`; `max` is the later of
`maxRunningStart` and `maxRunningActiveEnd`. Without explicit active segments, running bars extend
to the latest-starting one (which renders as a zero-width marker at the right edge). Confirmed
activity may extend that boundary.

**Edge: a running span starts after all finite ends** — `max` is already that span's start (from
`maxRunningStart`); its provisional end is clamped to `max(max, span.start) = span.start` → zero-
width marker handled by the renderer without changing the time domain.

### 4. `resolveActive` — skip self-time for running spans

```ts
return spans.map((span) => {
  if (span.activeSegments.length > 0) return span;
  if (span.running) return span;   // <-- do not fabricate activity up to a synthetic end
  const children = childrenByParentId.get(span.id) ?? [];
  return { ...span, activeSegments: gapSegments(span.start, span.end, children) };
});
```

A caller who supplies explicit `activeSegments` on a running span (partial known activity) retains
them; the chart renders the known solid segments plus the dashed remainder.

### 5. Renderer — dashed total line (`canvas2d_renderer.ts`)

The shared `renderMultiLine` primitive already accepts `Stroke.dash` and wraps each draw in
`withContext`, which saves and restores canvas state. Reuse that seam:

```ts
const runningTotalLineStroke = { ...totalLineStroke, dash: style.runningLineDash };
// ...
renderMultiLine(ctx, [line], span.running ? runningTotalLineStroke : totalLineStroke);
```

The primitive's context restore prevents dash state leaking, so completed spans are unaffected.
Active segments inside a running span are drawn solid (they represent confirmed execution).
No right-end cap is drawn for the running span (the dashed line itself signals "open end").

Canvas does not paint a zero-length line with its default butt cap. When a running span has
`start === end`, draw a square point marker at its scaled start using the existing `renderRect`
primitive, `totalLineColor`, and `totalLineThickness`. Clamp the marker fully inside the plot when
the start falls on either horizontal edge. The marker changes no domain value and implies no
duration; do not draw an artificial minimum-width dashed line.

For picking, give that marker a horizontal pixel-space target equal to `laneHeight`, centered on the
rendered marker and clamped inside the plot. Check this target before inverting x to time. Inside the
target, return `provisional`; outside it, return `empty`. This keeps the marker usable with mouse and
touch without a new theme token, avoids exact-timestamp picking in a non-degenerate domain, and
prevents a zero-width focus domain from making the entire lane a hit.

The existing whole-span selection pass skips zero-width outlines. For a selected zero-width running
span, instead draw a compact outline around the visible point marker. Derive its size from
`totalLineThickness + 2 * selectedSegmentStrokeWidth`, clamp it inside the plot, and use the existing
`selectedSegmentStroke`; do not outline the lane-height-wide hit target.

### 6. Theme token (`render/types.ts` + theme files)

```ts
// render/types.ts — TraceStyle
/** Dash pattern for the total-duration line of a running (in-progress) span. */
runningLineDash: number[];
```

Default value `[4, 3]` in all six theme files (4 px dash, 3 px gap — legible at standard laneHeight).
The existing `Theme.trace: TraceStyle` type and `buildTraceStyle(theme) { return theme.trace; }`
passthrough wire the field automatically; only concrete theme values and complete style literals
need updating.

### 7. Tooltip (`render/tooltip.ts`)

When the resolved span has `running === true`:
- Replace the **Duration** row with **Status: Running**. Do not show a numeric total duration (and do
  not show "running · ≥ X ms" — the provisional `end − start` is not a real duration and drifts as
  the domain grows).
- Keep the existing **State** row for the hovered region. "Status" describes the span lifecycle;
  "State" continues to describe the pointer region.
- Keep duration rows for explicitly supplied active segments: those intervals are known measurements
  rather than the synthesized total extent.

### 8. Provisional-region interaction (`render/types.ts`, `canvas2d_renderer.ts`, `trace_chart.tsx`)

The part of a running span's synthesized extent that is not covered by an explicitly supplied active
segment is a **provisional region**, not waiting time:
- Add internal `HoverRegion: 'provisional'` and display it as **State: Provisional**.
- Preserve collapsed-lane precedence: a collapsed running parent returns the existing `span` region
  and displays **State: Collapsed** while **Status: Running** still communicates lifecycle.
- For an expanded running lane, return `active` inside an explicit active segment and `provisional`
  everywhere else inside `[start, provisionalEnd]`. Do not call `waitingSegments` for that remainder
  and do not expose a segment duration or offset.
- A click or tap on a provisional region maps to the existing whole-span selection ref
  `{ region: 'span', segmentIndex: -1 }`; no public provisional-segment identity is introduced.
- A zero-width running marker participates only within its bounded pixel-space hit target; the rest
  of its lane is empty. A collapsed marker returns `span`; an expanded marker returns `provisional`.
- A whole-span selection on that marker draws a compact marker outline rather than being silently
  skipped or outlining the larger hit target.
- Completed-span Active / Waiting / empty picking remains unchanged.

### 9. Screen reader (`state/selectors/get_screen_reader_data.ts`)

When `span.running`:
- Emit `"running"` in the `totalDuration` cell instead of the formatted millisecond value.
- In the keyboard / `scrollToSpan` aria-live announcement, emit the span name followed by
  `"running"` (and any existing provenance note) instead of formatting `span.end - span.start`.

### 10. Element and selection events (`render/tooltip.ts`, `trace_api.ts`, `specs/settings.tsx`)

For both `TraceSelectionDetail` and `TraceElementEvent`:
- Change `duration` to `number | null` and emit `null` when `span.running`.
- Keep normalized `start` and `end` numeric. A running span's `end` is its synthesized provisional
  domain boundary, not a completion timestamp; document that caveat on both public payloads.
- Retain numeric duration for completed spans.

### 11. Story (`32_running_spans.story.tsx`)

Dataset:
- `root` (completed): 0–300 ms.
- `auth` (child of `root`, completed): 10–80 ms.
- `data-fetch` (child of `root`, **running**): `start: 90, end: null`. Renders 90 ms → domain max
  (300 ms) with a dashed line.
- `render` (child of `root`, completed): 180–290 ms.

Shows: a mixed trace where one running span coexists with completed siblings; dashed total line clearly
distinguishable; tooltip shows "running" with no duration.

## Edge cases

| Case | Behavior |
|---|---|
| Running span starts after all finite ends | `max = span.start`; draw a point marker at the right edge without changing the domain. Its bounded hit target resolves to Provisional. |
| All spans running | `max = max(starts, explicit active-segment ends)`; without explicit activity, bars render to the latest start and the latest-starting span is a zero-width marker. |
| Running span with explicit `activeSegments` | Segments retained; self-time derivation still skipped. Dashed total line covers the full provisional extent. |
| Running explicit active segment ends after completed siblings | Its finite end extends the domain and the running span's provisional boundary, so confirmed activity is not clipped. |
| Running span outside explicit active segments | Region is Provisional, not Waiting; no segment duration/offset is reported. Click/tap selects the whole span. |
| `end === 0` (non-running span at the Unix epoch) | Not treated as running (`end == null` check uses strict null equality for the `null` case and the `undefined` case — `0 == null` is `false`). |
| OTel zero `endTimeUnixNano` (`0`, `'0'`, or `0n`) | Mapped to `end: null` in `fromOtlp` before entering the pipeline; treated as running. |
| OTel `endTimeUnixNano > 0` | `nanoToMs(endTimeUnixNano)` yields the real end ms; not running. |
| Clock-skew correction (Spec 24) | Runs before running-end synthesis. An edge involving a running participant is skipped; the running span remains structurally attached, untranslated, and unmarked. A deeper completed edge may be evaluated independently. |
| Events/selection/SR of a running span | Region picking uses the provisional end as the right boundary; tooltip/SR show "running." `TraceSelectionDetail.duration` and `TraceElementEvent.duration` are `null`; their numeric `end` is provisional. |

## Tests

- `data/normalize.test.ts`:
  - `end: null` survives `dropNonFinite` (not dropped).
  - `end: undefined` survives `dropNonFinite`.
  - `end: NaN` (non-null non-finite) still dropped — the OTel poison guard holds.
  - Running span's synthesized `end === domain max` (latest finite completed end, running start, or
    running explicit-active end among Spec 26's surviving visible spans).
  - A finite explicit active-segment end on a running span extends the domain max and synthesized end.
  - All-running fallback: `end = max(starts, explicit active-segment ends)` for each span.
  - Start-past-all-ends case: zero-width (synthesized end clamped to start).
  - Re-zeroing under `'linear'` scale applies to the synthesized end.
  - A running child does not originate clock-skew centering.
  - A running span retains its recorded start, explicit active segments, and running end sentinel
    until `project`, and carries no `skewCorrected`.
  - Children of a supplied running span are not reparented; a deeper completed parent-child edge may
    resume independent clock-skew evaluation.
- `data/self_time.test.ts`:
  - A running span with no explicit segments → `activeSegments` remains empty after `resolveActive`.
  - A running span with explicit segments → those segments pass through unchanged.
- `data/otel_adapter.test.ts`:
  - `endTimeUnixNano: 0`, `'0'`, or `0n` → `end: null`; `datum.running` would be `true`.
  - `endTimeUnixNano: '2000000000'` → normal `end` (2000 ms, not running).
- Renderer:
  - Running span → `ctx.setLineDash` called with `style.runningLineDash`.
  - Completed span → `ctx.setLineDash` not called (or called with `[]`).
  - Zero-width running span → visible point marker clamped inside the plot; no artificial time width.
  - Selected zero-width running span → compact outline around the marker using the existing selection
    stroke; the interaction target itself is not outlined.
- Picking / selection:
  - Running explicit active segment → `active`; uncovered synthesized extent → `provisional`.
  - Collapsed running parent → existing `span` region / `State: Collapsed` takes precedence while
    `Status: Running` remains visible.
  - Provisional hover has no segment duration/offset; click/tap produces a whole-span selection ref.
  - Zero-width running marker → only its lane-height-wide pixel target is pickable; the rest of the
    lane remains empty even when the focus domain is zero-width.
  - Completed uncovered extent remains `waiting` with its existing segment identity.
- Tooltip / SR:
  - Running span → `Status: Running` present; numeric `end − start` absent; uncovered extent shows
    `State: Provisional` rather than `State: Waiting`.
  - Running keyboard/search announcement → "running" present; provisional duration absent.
  - Completed span → normal duration format; no "running" label.
- Events / selection:
  - Running span → `duration: null`; numeric `end` remains the provisional domain boundary.
  - Completed span → numeric `duration` remains `end − start`.

## Review (`/review-claudio`)

- Verify `end == null` uses `==` (catches both `null` and `undefined`), and that `end === 0` is **not**
  treated as running.
- Verify the existing `renderMultiLine` context save/restore contains its `Stroke.dash` state so it
  does not leak to active segments or selection outlines.
- Verify `project` computes `max` over completed finite ends, running starts, and running explicit
  active-segment ends so neither a late start nor confirmed activity is clipped.
- Verify the all-running fallback does not produce `max = -Infinity` entering the re-zero step.
- Verify `resolveActive` skips self-time **only** when `span.running && span.activeSegments.length === 0`;
  a running span with explicit segments must not be skipped (the pass-through is already the first
  branch — `if (span.activeSegments.length > 0) return span`).
- Verify `TraceSelectionDetail.duration` and `TraceElementEvent.duration` are `null` (not
  `provisionalEnd − start`) for running spans — the duration is not a real measurement and must not
  be surfaced as one.

## Acceptance

- A span supplied with no `end` renders from its `start` to the latest known finite boundary using a
  dashed total line (or a point marker for zero width); its active-segment area shows confirmed
  execution only.
- The tooltip shows "running" with no numeric duration; the SR surface announces "running."
- Completed spans and existing traces are unchanged — behavior is byte-identical to today when no
  running spans are present.
- The chart gains no wall-clock dependency; the RAF loop does not run continuously for a static
  dataset containing running spans.
- `yarn jest trace_chart`, `yarn typecheck:src`, and `yarn typecheck:storybook` are green.
- `yarn api:check:local` regenerates a clean public API report containing the nullable fields.
