# Spec 9 — Categorical color palette (color-by API)

**Goal:** colorize active segments per lane from a caller-supplied category key (service, span kind,
custom), using the EUI Borealis palette; keep per-datum `color` as an override. Ship two showcase
stories reproducing the Chrome DevTools Network waterfall and Kibana execution-trace looks.

**Depends on:** [Spec 8](./spec-8-integration.md) — `TraceDatum`, `NormalizedSpan`, and the ADR 0005
single-input format are in place. [ADR 0006](../0006-color-group-accessor-function-only.md) records
the function-only design decision.

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — add `colorBy?: TraceColorAccessor`
  to `TraceSpec`; export `TraceColorAccessor` type; export `colorByOtelAttribute` and `colorByOtelKind`
  convenience helpers.
- `packages/charts/src/chart_types/trace_chart/data/otel_adapter.ts` — stow resource attributes into
  `TraceDatum.meta` alongside the existing `OtelSpan` so `service.name` (from `resource.attributes`)
  is reachable via `(datum.meta as OtelSpan).resource?.attributes`.
- `packages/charts/src/chart_types/trace_chart/render/colors.ts` *(new)* — `buildColorMap(data,
  colorBy, vizColors)` util: iterates `data` once, calls `colorBy(datum)`, assigns a cyclic palette
  index (first-seen ordering), returns a `Map<string, string>`. Pure function, no React dependency.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — resolve active-segment
  fill from the color map (`colorMap.get(groupKey) ?? defaultActiveFill`); the existing
  `span.color != null ? colorToRgba(span.color) : defaultActiveFill` precedence expands to:
  `span.color != null` → explicit color; else `colorMap.get(groupKey)` → color-group color;
  else `defaultActiveFill` (themed default).
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — add `colorMap` instance field;
  build it in `componentDidMount` + `componentDidUpdate` whenever `data`, `colorBy`, or
  `theme.colors.vizColors` reference changes; extend the `hasViewKeyChanged` guard to cover these
  three inputs.
- `storybook/stories/trace/10_color_by.story.tsx` — color-by knob (none / service / span-kind /
  custom); must use stable (module-level) accessor references per mode.
- `storybook/stories/trace/11_chrome_network.story.tsx` — DevTools Network waterfall aesthetic.
- `storybook/stories/trace/12_kibana_trace.story.tsx` — Kibana execution-trace aesthetic.

## Contract

```ts
/** Derives the color-group key for a span's active segments. Return `undefined` to fall through
 *  to the themed default. Two spans returning the same string receive the same palette color. */
export type TraceColorAccessor = (datum: TraceDatum) => string | undefined;

/** Returns a `TraceColorAccessor` that reads the given OTel span attribute (from `datum.meta`). */
export function colorByOtelAttribute(attribute: string): TraceColorAccessor;

/** Returns a `TraceColorAccessor` that groups by OTel span kind. */
export function colorByOtelKind(): TraceColorAccessor;
```

Precedence per span (in `canvas2d_renderer.ts`):
1. `TraceDatum.color` (explicit per-datum override) — wins always.
2. `colorBy` color-group color — cyclic index into `theme.colors.vizColors`.
3. Themed `activeSegmentColor` default.

`buildColorMap` in `render/colors.ts` mirrors `getSeriesColors` in
`xy_chart/utils/series.ts:587` — iterate once, cyclic index `i % vizColors.length`, Map keyed by the
string returned by `colorBy`. Stable first-seen ordering.

**Rebuild trigger (in `componentDidUpdate`):** rebuild `colorMap` when any of `traceSpec.data`,
`traceSpec.colorBy`, or `theme.colors.vizColors` has changed by reference. Data-only is insufficient
because the story knob swaps `colorBy` while `data` stays identical. Stories must pass
**module-level or memoized** `colorBy` references — a fresh arrow per render would rebuild the map on
every render.

## Steps

1. Add `TraceColorAccessor` type + `colorBy` prop to `TraceSpec` in `trace_api.ts`. Add
   `colorByOtelAttribute` and `colorByOtelKind` helpers in the same file.
2. Update `fromOtlp` in `data/otel_adapter.ts` to attach resource attributes to the span stored in
   `TraceDatum.meta` (either include them in the `OtelSpan` object or augment `meta` as needed).
3. Create `render/colors.ts` with `buildColorMap`.
4. Add `colorMap` instance field to `TraceChart`; build it on mount and on the three-way ref-change
   trigger in `componentDidUpdate`.
5. Update `draw()` in `canvas2d_renderer.ts` to apply the three-level color precedence.
6. Author `10_color_by.story.tsx` with a knob cycling through four accessors (module-level consts).
7. Author `11_chrome_network.story.tsx` and `12_kibana_trace.story.tsx` as showcase stories.
8. Register all three stories in `trace.stories.tsx`.

## Storybook

- `10_color_by.story.tsx` — knob: `none | service | kind | custom`. `colorBy` must be a stable
  module-level const per mode (not a fresh arrow) so the rebuild trigger fires only on knob change.
- `11_chrome_network.story.tsx` — synthetic HTTP request spans colored by resource type
  (document / script / stylesheet / image / xhr / font); `labelPosition: 'inline'` (Spec 17 preview);
  total-line dominates the visual; DevTools Network palette.
- `12_kibana_trace.story.tsx` — service-colored spans with a nested depth layout; colors from
  `colorByOtelAttribute('service.name')`; Kibana-style light background.

Full fidelity of the showcase stories lands after Specs 10 (pinned tooltip) and 13 (inline labels),
but the color-driven version is complete and useful on its own here.

## Tests

- `render/colors.test.ts` (new): `buildColorMap` determinism — same data + accessor → same map;
  stability — inserting a new span at the front doesn't reassign existing colors (first-seen ordering);
  palette wrap — N+1 unique groups cycles back to color 0; precedence — explicit `TraceDatum.color`
  wins over group color wins over default (test the full three-level chain in the renderer).
- Unit test: `colorByOtelAttribute` returns the named attribute value from `datum.meta as OtelSpan`.
- Unit test: rebuild trigger — map is rebuilt when `colorBy` changes but `data` does not.

## Review (`/review-claudio`)

- Palette exhaustion: wrap is intentional; verify the cyclic index math handles `vizColors.length = 0`
  gracefully (fallback to default color).
- Color contrast: spot-check active-segment colors on light and dark themes against the `laneHeight`
  background.
- Per-frame safety: confirm `colorMap` is never rebuilt inside `draw()` or the RAF loop.
- OTel resource attributes: verify `service.name` resolves after the `fromOtlp` update.

## Acceptance

- Spans colorize by the chosen category with the EUI Borealis palette.
- Explicit `TraceDatum.color` wins over `colorBy` color-group color.
- `colorByOtelAttribute('service.name')` assigns distinct palette colors to distinct services.
- Showcase stories `11_chrome_network` and `12_kibana_trace` render and visually match the reference
  screenshots closely enough to read as the same class of tool.
- `yarn jest trace_chart` and `yarn typecheck` are green.
