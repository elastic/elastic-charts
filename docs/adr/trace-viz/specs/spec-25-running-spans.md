# Spec 25 — Running spans (in-progress visualization)

**Goal:** accept and visualize spans that have started but not yet finished. A running span
(`TraceDatum.end` omitted or `null`) renders from its `start` to the trace's latest known finite end
(domain max) using a **dashed** total line and no active-segment fabrication; the tooltip and
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

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — `TraceDatum.end` → `end?: number | null`; update JSDoc.
- `packages/charts/src/chart_types/trace_chart/data/types.ts` — add `running: boolean` to `NormalizedSpan`; `end` stays `number` (the synthesized provisional end after `project`).
- `packages/charts/src/chart_types/trace_chart/data/normalize.ts` — changes to `parseSimple`, `dropNonFinite`, and `project` (see Steps below).
- `packages/charts/src/chart_types/trace_chart/data/self_time.ts` — `resolveActive`: skip self-time derivation for running spans.
- `packages/charts/src/chart_types/trace_chart/data/otel_adapter.ts` — `fromOtlp`: map `endTimeUnixNano === 0` → `end: null`.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — total-line pass: `setLineDash` for running spans.
- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add `runningLineDash: number[]` to `TraceStyle`.
- Six theme files (`light_theme.ts`, `dark_theme.ts`, `amsterdam_light_theme.ts`, `amsterdam_dark_theme.ts`, `legacy_light_theme.ts`, `legacy_dark_theme.ts`) and `src/utils/themes/theme.ts` — add `runningLineDash` to the `trace:` block.
- `packages/charts/src/chart_types/trace_chart/render/tooltip.ts` — running state label; suppress duration number.
- `packages/charts/src/chart_types/trace_chart/state/selectors/get_screen_reader_data.ts` — "running" announcement; suppress numeric duration.
- `storybook/stories/trace/27_running_spans.story.tsx` — new story; register in `trace.stories.tsx`.

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
   * extending to the latest known finite end across all spans in the trace (the domain max).
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
 * must not be treated as a real end timestamp. Absent (effectively `false`) on completed spans.
 */
running: boolean;
```

`end` stays a concrete `number` after `project` — the synthesized provisional end — so the rest of
the pipeline (geometry, renderer, scroll math) needs no further branching on `null`.

### OTel adapter (`data/otel_adapter.ts`)

OTel running spans set `endTimeUnixNano` to `0` (not omitted — the field is always present).
`nanoToMs(0)` yields `0` (a valid absolute epoch time), which `dropNonFinite` would *keep*
(finite), causing a running span to render as ending at the Unix epoch. Fix:

```ts
end: span.endTimeUnixNano === 0 ? null : nanoToMs(span.endTimeUnixNano),
```

(The BigInt / string check that `nanoToMs` already performs still covers genuine parse failures.)

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
// Collect finite ends from completed spans and starts from running spans
// (a running span contributes at least its start to the right boundary).
const min = spans.reduce((acc, s) => Math.min(acc, s.start), Infinity);
const maxFiniteEnd = spans.reduce((acc, s) => (!s.running ? Math.max(acc, s.end) : acc), -Infinity);
const maxRunningStart = spans.reduce((acc, s) => (s.running ? Math.max(acc, s.start) : acc), -Infinity);
const max = Math.max(
  Number.isFinite(maxFiniteEnd) ? maxFiniteEnd : -Infinity,
  Number.isFinite(maxRunningStart) ? maxRunningStart : -Infinity,
);

// Synthesize provisional end for running spans.
const spansMaybeFixed = spans.map((s) =>
  s.running ? { ...s, end: Math.max(max, s.start) } : s,
);

// Re-zero (linear scale) or keep epoch (time scale) as today.
```

**Edge: all spans running** — `maxFiniteEnd` is `-Infinity`; `max = maxRunningStart`; running bars
from their start to the latest-starting one (which renders as a zero-width marker at the right edge).

**Edge: a running span starts after all finite ends** — `max` is already that span's start (from
`maxRunningStart`); its provisional end is clamped to `max(max, span.start) = span.start` → zero-
width marker. Documented, not special-cased.

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

In the total-line draw pass (currently ~L137-145):

```ts
if (span.running) {
  ctx.save();
  ctx.setLineDash(style.runningLineDash);
  // draw the total line (no right cap on running spans)
  ctx.restore();
} else {
  // existing solid total-line draw (unchanged)
}
```

`ctx.setLineDash([])` is restored by `ctx.restore()`, so completed spans are unaffected.
Active segments inside a running span are drawn solid (they represent confirmed execution).
No right-end cap is drawn for the running span (the dashed line itself signals "open end").

### 6. Theme token (`render/types.ts` + theme files)

```ts
// render/types.ts — TraceStyle
/** Dash pattern for the total-duration line of a running (in-progress) span. */
runningLineDash: number[];
```

Default value `[4, 3]` in all six theme files (4 px dash, 3 px gap — legible at standard laneHeight).
Wire via `theme.ts` in the `trace:` block alongside the other `TraceStyle` fields.

### 7. Tooltip (`render/tooltip.ts`)

When the resolved span has `running === true`:
- **Duration row:** omit the numeric duration entirely (no "running · ≥ X ms" — the provisional
  `end − start` is not a real duration and drifts as the domain grows).
- **State label:** show **"running"** as the span's state (e.g. in place of the duration, or as a
  separate badge). The exact placement is implementation choice; the spec requires the word "running"
  to appear and the numeric duration to be absent.
- `REGION_LABEL` for active / waiting regions within a running span is unchanged.

### 8. Screen reader (`state/selectors/get_screen_reader_data.ts`)

When `span.running`:
- Emit `"running"` (or `"in progress"`) in the `totalDuration` cell instead of the formatted
  millisecond value.

### 9. Story (`27_running_spans.story.tsx`)

Dataset:
- `root` (completed): 0–300 ms.
- `auth` (child of `root`, completed): 10–80 ms.
- `data-fetch` (child of `root`, **running**): `start: 90, end: null`. Renders 90 ms → domain max
  (300 ms) with a dashed line.
- `render` (child of `root`, completed): 180–290 ms.

Shows: a mixed trace where one in-flight span coexists with completed siblings; dashed bar clearly
distinguishable; tooltip shows "running" with no duration.

Optional: a second panel with all spans running (no finite end), demonstrating the all-running
domain fallback.

## Edge cases

| Case | Behavior |
|---|---|
| Running span starts after all finite ends | `max = span.start`; zero-width marker at the right edge. Documented; no special case. |
| All spans running | `max = max(starts)`; bars render from each start to that max. The latest-starting span is a zero-width marker. |
| Running span with explicit `activeSegments` | Segments retained; self-time derivation still skipped. Dashed total line covers the full provisional extent. |
| `end === 0` (non-running span at the Unix epoch) | Not treated as running (`end == null` check uses strict null equality for the `null` case and the `undefined` case — `0 == null` is `false`). |
| OTel `endTimeUnixNano === 0` | Mapped to `end: null` in `fromOtlp` before entering the pipeline; treated as running. |
| OTel `endTimeUnixNano > 0` | `nanoToMs(endTimeUnixNano)` yields the real end ms; not running. |
| Clock-skew correction (Spec 24) | Runs before running-end synthesis. An edge involving a running participant is skipped; the running span remains structurally attached, untranslated, and unmarked. A deeper completed edge may be evaluated independently. |
| Selection/SR of a running span | Region picking uses the provisional end as the right boundary; tooltip/SR show "running." No duration in the `TraceSelectionDetail.duration` field — emit `null` or `undefined`. |

## Tests

- `data/normalize.test.ts`:
  - `end: null` survives `dropNonFinite` (not dropped).
  - `end: undefined` survives `dropNonFinite`.
  - `end: NaN` (non-null non-finite) still dropped — the OTel poison guard holds.
  - Running span's synthesized `end === domain max` (max of finite ends).
  - All-running fallback: `end = max(starts)` for each span.
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
  - `endTimeUnixNano: 0` → `end: null`; `datum.running` would be `true`.
  - `endTimeUnixNano: '2000000000'` → normal `end` (2000 ms, not running).
- Renderer:
  - Running span → `ctx.setLineDash` called with `style.runningLineDash`.
  - Completed span → `ctx.setLineDash` not called (or called with `[]`).
- Tooltip / SR:
  - Running span → "running" present; numeric `end − start` absent.
  - Completed span → normal duration format; no "running" label.

## Review (`/review-claudio`)

- Verify `end == null` uses `==` (catches both `null` and `undefined`), and that `end === 0` is **not**
  treated as running.
- Verify `ctx.save()` / `ctx.restore()` wraps the `setLineDash` call so the dash state does not leak
  to subsequent draw passes (active segments, selection outlines).
- Verify `project` computes `max` over both finite ends *and* running starts so a running span whose
  start is beyond all finite ends still expands the domain.
- Verify the all-running fallback does not produce `max = -Infinity` entering the re-zero step.
- Verify `resolveActive` skips self-time **only** when `span.running && span.activeSegments.length === 0`;
  a running span with explicit segments must not be skipped (the pass-through is already the first
  branch — `if (span.activeSegments.length > 0) return span`).
- Verify `TraceSelectionDetail.duration` is `null`/`undefined` (not `provisionalEnd − start`) for
  running spans — the duration is not a real measurement and must not be surfaced as one.

## Acceptance

- A span supplied with no `end` renders from its `start` to the latest known finite end using a
  dashed total line; its active-segment area shows confirmed execution only.
- The tooltip shows "running" with no numeric duration; the SR surface announces "running."
- Completed spans and existing traces are unchanged — behavior is byte-identical to today when no
  running spans are present.
- The chart gains no wall-clock dependency; the RAF loop does not run continuously for a static
  dataset containing running spans.
- `yarn jest trace_chart` and `yarn typecheck` are green.
