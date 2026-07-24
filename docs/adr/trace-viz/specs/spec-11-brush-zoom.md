# Spec 11 — Brush-to-zoom (X-only)

**Goal:** `Shift`+drag draws an X-axis rubber-band rect; on release the visible time window eases to
the selected range. A `dragMode` prop inverts the default gesture so plain drag brushes and
`Shift`+drag pans.

**Depends on:** [Spec 6](./spec-6-connected-component.md) — the RAF loop, `zoomPan`/`tween`, and the
existing drag-pan gesture are in place. [ADR 0009](../0009-brush-overlay-css-div.md) records the CSS
`<div>` rendering decision. The `domainToZoomPan` helper authored here is also consumed by
[Spec 16](./spec-16-focus-domain-control.md).

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — add `dragMode?: 'pan' | 'brush'`
  (default `'pan'`) to `TraceSpec`.
- `packages/charts/src/chart_types/trace_chart/render/interaction.ts` — add
  `domainToZoomPan(domain: [number, number], referenceDomain: [number, number]): ZoomPan` helper
  (closed-form inversion of `getFocusDomain`; reuses exported `multiplierToZoom`); add
  `pixelRangeToDomain(x0: number, x1: number, geometry: TraceGeometry): [number, number]` helper.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — gesture routing (effective gesture =
  `dragMode` XOR `Shift`); brush CSS overlay shown/hidden via `setState`; `mouseup` handler applies
  the brushed range.

## Contract

**Gesture routing:** let `isBrushMode = (dragMode === 'brush') !== shiftKey`. When `isBrushMode`:
- `mousedown` → record `brushStart: number` (canvas CSS x px), show the `<div>` overlay.
- `mousemove` → update `brushEnd: number`, resize the overlay `<div>` via `setState`.
- `mouseup` → hide the overlay; convert `[brushStart, brushEnd]` to ms via `pixelRangeToDomain`;
  guard: if the resulting range is below `MIN_VISIBLE_EXTENT_MS`, do nothing (mirror XY's
  `minBrushDelta` no-op at `on_brush_end_caller.ts:160-163`); clamp to the reference domain with
  `clamp` (`utils/common.tsx:149`); call `domainToZoomPan` to set `this.zoomPan.focus`; start the
  RAF loop so the tween eases to the new window.
- `mouseleave` while brushing → cancel the brush (clear overlay, reset `brushStart`).

When `!isBrushMode`, the existing drag-pan / kinetic-flywheel logic runs unchanged.

**Brush overlay (ADR 0009):** a `position: absolute` `<div>` inside the `<figure>`, styled with a
semi-transparent fill and a 1px border. Sized via component state (`brushOverlay: { x: number; width:
number } | null`). No DPR scaling — it is a CSS element. Suppresses the hover tooltip while active
(set a `isBrushing` instance flag; skip `tooltipInfo` updates while set).

**`domainToZoomPan` (canonical implementation):**

```ts
function domainToZoomPan(
  [domainFrom, domainTo]: [number, number],
  [refFrom, refTo]: [number, number],
): ZoomPan {
  const refExtent = refTo - refFrom;
  const focusExtent = domainTo - domainFrom;
  const zoom = multiplierToZoom(focusExtent / refExtent); // exported from zoom_pan.ts
  const leeway = refExtent - focusExtent;
  const pan = leeway > 0 ? (domainFrom - refFrom) / leeway : 0;
  return { focus: { zoom, pan } };
}
```

After setting `this.zoomPan` via `domainToZoomPan`, the existing tween/RAF path eases the extent
(zoom) per ADR 0004; pan snaps immediately (ADR 0004 pan-is-1:1). This is identical to what
wheel-zoom does — no second code path.

## Steps

1. Add `dragMode` prop to `TraceSpec`.
2. Add `domainToZoomPan` and `pixelRangeToDomain` to `render/interaction.ts`.
3. Add `brushOverlay: { x: number; width: number } | null` to component state and a `isBrushing`
   instance flag.
4. Route `mousedown`/`mousemove`/`mouseup`/`mouseleave` through the `isBrushMode` branch.
5. Render a `<div>` overlay in JSX, conditionally styled from `brushOverlay` state.
6. Author `14_brush_zoom.story.tsx`.

## Storybook

`14_brush_zoom.story.tsx` — a knob for `dragMode` (`'pan'` / `'brush'`); prose instructions for
`Shift`+drag to invert; a `MIN_VISIBLE_EXTENT_MS` note so the user understands why a 1px drag is a
no-op.

## Tests

- `pixelRangeToDomain`: given known geometry, x pixels map to the expected ms range.
- `domainToZoomPan`: round-trip — `getFocusDomain(domainToZoomPan(d, ref), ref.from, ref.to) ≈ d`.
- Clamp: a brushed range extending beyond the reference domain is clamped to it.
- Min-extent guard: a brushed range narrower than `MIN_VISIBLE_EXTENT_MS` is a no-op (no state change).
- Gesture routing: `dragMode='pan'` + `shiftKey=true` enters brush mode; `dragMode='brush'` +
  `shiftKey=false` enters brush mode.

## Review (`/review-claudio`)

- Verify the brush overlay is cleared on `mouseleave` so it can't be left orphaned.
- Verify kinetic flywheel is stopped before the brush result is applied (no gesture conflict).
- Verify tooltip suppression is lifted as soon as the brush ends (no persistent blank tooltip).
- Verify `domainToZoomPan` handles degenerate `refExtent = 0` (empty dataset) without division by zero.

## Acceptance

- `Shift`+drag (with `dragMode='pan'`) zooms to the selected X range with easing.
- Plain drag (with `dragMode='brush'`) brushes; `Shift`+drag pans.
- A drag narrower than `MIN_VISIBLE_EXTENT_MS` is a no-op.
- The overlay clears on release and on `mouseleave`.
- `yarn jest trace_chart` and `yarn typecheck` are green.
