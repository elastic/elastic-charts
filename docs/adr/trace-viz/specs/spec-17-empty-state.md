# Spec 17 — Empty-state distinction

**Goal:** render a distinct centered message on the canvas when the trace chart has no lanes to
render. Two cases require different messages:
- `"No data"` — the `data` prop was empty (no spans supplied at all).
- `No spans found for trace "{id}"` — spans were supplied but the specified `traceId` matched none.

The combined-waterfall case (spans present, no `traceId` filter) is never an empty state. The time
bar still draws in both empty cases (it shows the axis structure even without lanes).

**Depends on:** [Spec 5](./spec-5-canvas2d-renderer.md) — `draw()` in `canvas2d_renderer.ts`;
[Spec 1](./spec-1-normalization.md) — `normalize()` in `normalize.ts`.

## Files

- `packages/charts/src/chart_types/trace_chart/data/normalize.ts` — add
  `emptyReason?: 'no-data' | 'trace-not-found'` to `NormalizeResult`.
- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add
  `emptyMessage: string | null` to `TraceGeometry`.
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — add `emptyMessage` parameter
  to `buildGeometry`; thread it through to the returned `TraceGeometry`.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — draw centered message
  when `spans.length === 0 && geom.emptyMessage`.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — thread `emptyReason` through
  `getPipeline`, compose the user-facing message string in `frame()`, pass to `buildGeometry`.

## Contract

**`NormalizeResult.emptyReason`:**
- `'trace-not-found'` — `data.length > 0` and a `traceId` was supplied and matched nothing. This
  mirrors the exact condition that triggers `Logger.warn` in `selectTrace` (which is retained).
- `'no-data'` — `data` was empty before filtering.
- `undefined` — spans are present (not an empty state).

**`emptyMessage` string composition (in `frame()`, not in pure geometry):**
- `no-data` → `"No data"`
- `trace-not-found` → `` `No spans found for trace "${spec.traceId}"` ``

**Rendering:** `renderText` centered in the plot region at
`{ x: plot.left + plot.width / 2, y: plot.top + plot.height / 2 }` using the `timeBarLabel` font
(`align: 'center'`, `baseline: 'middle'`). `drawTimeBar` is called before the early return so the
time bar remains visible.

## Steps

1. Add `emptyReason?: 'no-data' | 'trace-not-found'` to `NormalizeResult` in `normalize.ts`.
2. In `normalize()`, after `project()`, compute `emptyReason`:
   ```ts
   if (result.spans.length === 0) {
     result.emptyReason = (flat.length > 0 && traceId !== undefined) ? 'trace-not-found' : 'no-data';
   }
   ```
3. Thread `emptyReason` through `getPipeline`'s memoized result in `trace_chart.tsx` (no new cache
   key — it is derived from existing inputs `data` and `traceId`).
4. In `frame()`, compose `emptyMessage: string | null` from `emptyReason` + `spec.traceId`.
5. Add `emptyMessage: string | null` to `TraceGeometry` and the `buildGeometry` signature.
6. In `draw()`, after `drawTimeBar`, when `spans.length === 0`:
   - If `geom.emptyMessage` is set, call `renderText` with the message centered in `plot`.
   - Then return (existing behavior for the no-message path is preserved).

## Storybook

`storybook/stories/trace/21_empty_state.story.tsx`:
- Two side-by-side panels (or knob toggle): one with `data={[]}` showing `"No data"`, one with
  non-empty data and a mismatched `traceId` showing `No spans found for trace "…"`.
- Demonstrates that the time bar is still visible in both cases.

## Tests

- `normalize.test.ts`:
  - `emptyReason = 'no-data'` when `data = []`.
  - `emptyReason = 'trace-not-found'` when data is non-empty, `traceId` is supplied, but no span
    matches.
  - `emptyReason = undefined` when spans are returned (normal and combined-waterfall cases).
- `canvas2d_renderer.test.ts`:
  - When `emptyMessage` is set and `spans` is empty, `renderText` is called once with the message.
  - When `emptyMessage` is `null` and `spans` is empty, no text call is made.

## Review (`/review-claudio`)

- Verify `emptyMessage` composition happens in `frame()`, not inside `normalize()` (pure data
  function must stay free of UI strings).
- Verify the centered position formula degenerates gracefully when the plot is zero-size
  (`plot.width = 0` → `x = plot.left`).
- Verify `drawTimeBar` is called before the early return so the time bar renders in empty cases.
- Verify `Logger.warn` in `selectTrace` is retained alongside the new canvas message (it is
  a dev-mode diagnostic, not a replacement for the visual feedback).

## Acceptance

- `data={[]}` renders `"No data"` centered in the plot area; time bar is visible.
- Non-empty data with an unmatched `traceId` renders `No spans found for trace "X"` message.
- Non-empty data with no `traceId` renders normally (no message).
- `yarn jest trace_chart` and `yarn typecheck` green.
