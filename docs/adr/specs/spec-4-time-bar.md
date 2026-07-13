# Spec 4 — Time bar (raster axis reuse)

**Goal:** draw the top time bar from the reusable raster engines, matching `xScaleType`.

**Depends on:** [Spec 3](./spec-3-geometry.md) (`TraceGeometry`, `TraceStyle`).

## Files

- `chart_types/trace_chart/render/time_bar.ts`.

## Contract

```ts
function drawTimeBar(ctx: CanvasRenderingContext2D, geom: TraceGeometry, style: TraceStyle): void;
```

## Steps

Select
[`continuousTimeRasters`](../../../packages/charts/src/chart_types/xy_chart/axes/timeslip/continuous_time_rasters.ts)
when `xScaleType === 'time'`, or
[`numericalRasters`](../../../packages/charts/src/chart_types/xy_chart/axes/timeslip/numerical_rasters.ts)
when `'linear'` — mirroring how Timeslip already picks between them
(`timeslip/render/raster.ts` / `cartesian.ts`). Request tick layers for `geom.focusDomain` and
`geom.timeBar.width`. Draw tick lines + labels within `geom.timeBar`, and faint gridlines down through
`geom.plot`. Use the existing density helpers (`notTooDense`, `MINIMUM_TICK_PIXEL_DISTANCE`) rather than
reimplementing tick-spacing logic.

## Storybook

`storybook/stories/trace/04_time_bar.story.tsx` — draws only the time bar on a canvas for a fixed
domain, with a control to switch `xScaleType` (`time` ↔ `linear`) and to nudge the focus domain; the
first genuinely visual step in the build.

## Tests

Light unit test asserting the correct raster factory is chosen per `xScaleType` (mock/inspect).
Visual correctness is verified via the story and later integration stories.

## Review (`/review-claudio`)

Correct reuse of the shared raster engines (no forked/duplicated logic), label formatting/timezone
handling, redraw performance.

## Acceptance

Ticks/labels render for both scale types and update as `focusDomain` changes; review findings addressed.
