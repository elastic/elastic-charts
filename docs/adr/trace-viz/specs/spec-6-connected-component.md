# Spec 6 — Connected component, RAF loop & zoom/pan

**Goal:** the live, interactive chart: mount the canvas, run the render loop, zoom/pan the time axis, scroll lanes.

**Depends on:** [Spec 5](./spec-5-canvas2d-renderer.md).

## Files

- `chart_types/trace_chart/trace_chart.tsx` (fills in the [Spec 0](./spec-0-scaffolding.md) stub).

## Contract

`chartRenderer: ChartRenderer`; `mapStateToProps` pulls the spec, settings, and dimensions from the redux store.

## Steps

In `mapStateToProps`: `getSpecsFromStore<TraceSpec>(state.specs, ChartType.Trace, SpecType.Series)[0]`,
`getSettingsSpecSelector` for `onElementOver/Click/Out` and `onRenderChange`, `state.parentDimensions`,
and the active `Theme`.

On mount, run the `normalize` → `resolveActive` pipeline (memoized on spec identity, so unrelated
re-renders don't recompute it) and start a `requestAnimationFrame` loop that eases `focusDomain`
toward a `targetFocusDomain` via `domainTween`, calls `buildGeometry` each frame with the current
`focusDomain` and `scrollOffset` (per Spec 3's contract), and calls `renderer.draw`.

Interaction is self-managed (own the listeners, as Timeslip does — `preventDefault` on `wheel`):
mouse-wheel → zoom via `doZoomAroundPosition`; drag → pan via `doPanFromJumpDelta` +
`kineticFlywheel`; vertical wheel/drag (or a scrollbar) → component-instance `scrollOffset`, passed
into `buildGeometry` each frame. Initial
`focusDomain = domain` (fit all). Emit `onRenderChange`/`onChartRendered` per the standard chart
protocol. Leave [chart_container.tsx](../../../../packages/charts/src/components/chart_container.tsx)
untouched unless a pointer-event conflict actually appears — Timeslip needs no special-casing there,
unlike Flame.

Reuse:
[`initialZoomPan`, `doZoomAroundPosition`, `doPanFromJumpDelta`, `kineticFlywheel`, `markDragStartPosition`, `endDrag`](../../../../packages/charts/src/chart_types/timeslip/projections/zoom_pan.ts),
[`domainTween`](../../../../packages/charts/src/chart_types/timeslip/projections/domain_tween.ts).

## Storybook

`storybook/stories/trace/06_interactive.story.tsx` — the live chart from real `<Trace data=…>` input
with wheel-zoom, drag-pan, lane scroll, and an `xScaleType` control.

## Tests

A smoke mount test asserting the RAF loop starts and `onChartRendered` fires. Interaction itself is
exercised via the story (hard to unit test meaningfully).

## Review (`/review-claudio`)

RAF lifecycle/cleanup (no leaks on unmount), memoization correctness of the normalize→geometry
pipeline, event-listener teardown, jank/performance under interaction.

## Acceptance

Interactive story pans/zooms smoothly with easing; scale swaps correctly with `xScaleType`; lanes
scroll for tall traces; review findings addressed.
