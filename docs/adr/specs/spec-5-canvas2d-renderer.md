# Spec 5 — Canvas2D renderer

**Goal:** the v1 `TraceRenderer` implementation.

**Depends on:** [Spec 3](./spec-3-geometry.md), [Spec 4](./spec-4-time-bar.md).

## Files

- `chart_types/trace_chart/render/canvas2d_renderer.ts`.

## Contract

Implements `TraceRenderer` (`draw`, `pickLane`) from [Spec 3](./spec-3-geometry.md#contract).

## Steps

Clear the canvas; call `drawTimeBar`; draw the left gutter (span names, ellipsis-truncated via the
shared `text` primitive). Iterate lanes **culled** to the visible y-range; per visible lane, draw the
thin total line across `[scale(start), scale(end)]` and its `active` segments as solid rects (per-datum
`color` if set, else the themed active color), each additionally culled to the current `focusDomain`.
Implement `pickLane(x, y)` with plain CPU math —
`lane = floor((y - plot.y + scrollOffset) / laneHeight)`, bounds-checked against the span count — no
GPU pick texture is needed at Canvas2D scale (contrast with Flame's WebGL picking).

Reuse the shared Canvas2D primitives in
[renderers/canvas/primitives/](../../../packages/charts/src/renderers/canvas/primitives/) (`rect`,
`line`, `text`) rather than hand-rolling drawing calls.

## Storybook

`storybook/stories/trace/05_renderer.story.tsx` — renders a full static waterfall (gutter, time bar,
total lines, active segments) from a fixture geometry, no interaction yet; the first complete-looking chart.

## Tests

A thin renderer test with a complete, extendable stub `CanvasRenderingContext2D` (not a half-baked mock
that would hide bugs), asserting draw-call counts (lines/rects per visible span) and that culled
lanes/segments are skipped entirely; `pickLane` boundary math (edges of lanes, out-of-range coordinates).

## Review (`/review-claudio`)

Draw-loop performance (culling is effective, no per-frame allocations), stub completeness, color/theme
correctness in both light and dark themes.

## Acceptance

Fixture geometry produces the expected draw calls; picking returns the correct index; the static story
looks correct; review findings addressed.
