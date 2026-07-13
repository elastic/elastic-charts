# Spec 0 — Chart-type scaffolding & registration

**Goal:** a `<Trace>` renders an empty, correctly-wired chart type; the build enforces registration.

**Depends on:** nothing.

## Background

elastic-charts registers a chart type in three places, all keyed by a `ChartType` enum member with no
default case (so TypeScript fails the build until every registry has an entry): the renderer registry,
the selectors registry, and the public spec barrel. The self-managed canvas family (Timeslip, Flame)
is the model here: a `connect`ed React component owns the shared stage `<canvas>` and drives its own
render/interaction loop; the chart type is inferred from whichever spec is mounted.

## Files

- [chart_types/index.ts](../../../packages/charts/src/chart_types/index.ts) — add `Trace: 'trace'` to `ChartType`.
- `chart_types/trace_chart/trace_api.ts` — minimal `TraceSpec` + `<Trace>` component via
  `buildSFProps`/`useSpecFactory` (data typed but unused yet).
- `chart_types/trace_chart/chart_selectors.ts` — `createChartSelectorsFactory` with
  `getChartTypeDescription`, `isInitialized: () => InitStatus.Initialized`, `isChartEmpty` stub.
- `chart_types/trace_chart/trace_chart.tsx` — connected component rendering one blank
  `<canvas ref={forwardStageRef} className="echCanvasRenderer">`, `getContext('2d')` on mount,
  `onChartRendered()`, exported `chartRenderer: ChartRenderer`.
- [chart_type_renderers.ts](../../../packages/charts/src/chart_types/chart_type_renderers.ts) — register `ChartType.Trace`.
- [chart_type_selectors.ts](../../../packages/charts/src/chart_types/chart_type_selectors.ts) — register `ChartType.Trace`.
- [packages/charts/src/index.ts](../../../packages/charts/src/index.ts) — `export * from './chart_types/trace_chart/trace_api'`.

## Contract

`TraceSpec`/`TraceDatum` shells (fields present per the architecture's authoritative contracts;
`data` accepted but not processed yet — see [Spec 1](./spec-1-normalization.md) for the real shape).

## Steps

Clone Timeslip's api + component skeleton
([timeslip_api.ts](../../../packages/charts/src/chart_types/timeslip/timeslip_api.ts),
[timeslip_chart.tsx](../../../packages/charts/src/chart_types/timeslip/timeslip_chart.tsx)); strip its
`getData`; wire the two registries and the barrel export.

## Storybook

`storybook/stories/trace/00_scaffold.story.tsx` — mounts `<Chart><Trace data={[]} /></Chart>`; proves
the type is registered and a blank stage canvas renders.

## Tests

`chart_selectors.test.ts` — factory returns `Initialized`, description string.

## Review (`/review-claudio`)

Registry wiring, spec-factory typing (no `as`), barrel exports.

## Acceptance

`yarn typecheck` passes (registries have no default case → missing entries fail); the scaffold story
shows a blank canvas with no console errors; review findings addressed.
