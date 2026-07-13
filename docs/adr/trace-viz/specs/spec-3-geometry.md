# Spec 3 — Geometry, theme & renderer contract

**Goal:** the pure layout model + the `TraceRenderer` interface + default styling.

**Depends on:** [Spec 1](./spec-1-normalization.md), [Spec 2](./spec-2-self-time.md).

See [ADR 0001](../0001-renderer-canvas2d-with-webgl-seam.md) for why `TraceRenderer` exists as a seam.

## Files

- `chart_types/trace_chart/render/types.ts` — `TraceRenderer`, `TraceGeometry`, `TraceStyle`.
- `chart_types/trace_chart/render/geometry.ts` — `buildGeometry`.
- `chart_types/trace_chart/theme.ts` — style defaults.

## Contract

```ts
function buildGeometry(
  spans: NormalizedSpan[],
  canvasSize: Size,
  focusDomain: { min: number; max: number },
  scrollOffset: number,
  style: TraceStyle,
): TraceGeometry;

interface TraceGeometry {
  spans: NormalizedSpan[];                     // start-sorted
  gutter: Dimensions; timeBar: Dimensions; plot: Dimensions;
  laneHeight: number;
  domain: { min: number; max: number };        // full trace extent
  focusDomain: { min: number; max: number };   // eased zoom window
  scrollOffset: number;                        // vertical lane-scroll, px
  xScaleType: 'time' | 'linear';
  scale: (tMs: number) => number;              // ms → px x within plot given focusDomain
}

interface TraceRenderer {
  draw(ctx: CanvasRenderingContext2D, geom: TraceGeometry, style: TraceStyle): void;
  pickLane(x: number, y: number, geom: TraceGeometry): number; // datum index or -1
}
```

## Steps

Start-sort spans. Split the canvas into `gutter` (fixed width from `style`), `timeBar` (fixed height),
and `plot` (the remainder). Build `scale(tMs)` mapping `focusDomain` to the `plot` x-range. Carry both
`domain` (full extent, used for "fit all"/reset) and `focusDomain` (current zoom window), plus
`scrollOffset` verbatim (no vertical scaling — 1 unit = 1px) so lane y and `pickLane` stay pure
functions of `TraceGeometry` alone, with no external mutable state at call time (unlike Timeslip's
zoom/pan, which is read from a mutable closure rather than threaded through a pure builder). `theme.ts`
exports `TraceStyle` defaults — gutter width, lane height, line thickness, muted total-line color,
stronger active-segment color, time-bar and label styles — resolved from the chart's `Theme`, not hardcoded.

## Storybook

`storybook/stories/trace/03_geometry_debug.story.tsx` — renders the geometry regions
(gutter/timeBar/plot) and lane rects as positioned `<div>`s from `buildGeometry`, so the layout math is
visible before any canvas drawing exists.

## Tests

`render/geometry.test.ts` — start-order, gutter/plot/timeBar partition sums to the canvas size,
`scale` maps domain endpoints to plot edges, lane y = `index * laneHeight - scrollOffset`.

## Review (`/review-claudio`)

Purity (no DOM access), `TraceRenderer`/`TraceGeometry` type design, theme-derivation from the chart
`Theme` (no magic numbers), test meaningfulness.

## Acceptance

Tests green; debug story shows correct regions/lanes; geometry functions are pure; review findings addressed.
