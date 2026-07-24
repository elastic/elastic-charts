# Spec 17 — Responsive layout & relocatable label panel

**Goal:** make the trace chart usable on narrow widths (mobile / side-panel embeds ~320px) by
supporting three label-rendering modes — `gutter` (today's left panel), `inline` (Chrome/Kibana
style), and `none` — selectable via `theme.trace.labelPosition`. No auto-collapse; the caller sets
the mode explicitly.

**Depends on:** [Spec 5](./spec-5-canvas2d-renderer.md) — gutter label rendering in
`canvas2d_renderer.ts`. `TraceStyle.gutterWidth` and `TraceStyle.laneHeight` already exist; this
spec adds `labelPosition` only.

## Files

- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add
  `labelPosition: 'gutter' | 'inline' | 'none'` to `TraceStyle` (default: `'gutter'`).
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — guard the gutter-area geometry
  math when `gutterWidth = 0` (guard vs ADR 0004 Decision 4 dimension math; plot width must not go
  negative).
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — branch on
  `labelPosition` in the label-drawing pass:
  - `'gutter'` → today's behavior (unchanged).
  - `'inline'` → draw label starting at the bar's start edge, overflowing right into the empty lane
    space; clip at the plot's right edge; right-align when the bar is close to the plot's right edge.
  - `'none'` → skip label drawing entirely.
- `packages/charts/src/chart_types/trace_chart/theme.ts` — ensure `buildTraceStyle` propagates
  `labelPosition` from `theme.trace` (it already returns `theme.trace` directly, so no code change —
  just ensure the default is set in the default theme object).
- `storybook/stories/trace/20_responsive.story.tsx` — knobs for `labelPosition` and chart width.

## Contract

**`theme.trace.labelPosition`:** `'gutter'` | `'inline'` | `'none'`. Explicit only — no
auto-collapse based on available width.

**Gutter mode (`'gutter'`):** unchanged. Canvas is split into a fixed-width left panel (`gutterWidth`)
and the plot area. Labels drawn in the left panel.

**Inline mode (`'inline'`):** `gutterWidth` is typically 0 (the caller omits the gutter in narrow
embeds). Each lane splits vertically into a **bar band** (top) and a **label band** (bottom).
`laneHeight` covers both bands — the caller sets it taller than the gutter default (e.g. 40 px) to
accommodate the two rows. Bar-band height = `laneHeight − 2×LANE_PADDING − labelBandPx`; label band
height = `gutterLabel.fontSize + LANE_PADDING`. Labels are drawn in the plot area itself:
- Start at the bar's start edge, clamped to `plot.left` (sticky-left) when the bar starts off-screen.
- Culled entirely when the bar is off-screen in both x-directions (no bar to anchor to).
- Overflow freely to the right into the empty lane space (not clipped to the bar width). This matches
  the Kibana APM waterfall style where names are wider than their bars.
- Clip at the plot's right edge (canvas `clip()` call per label).
- No right-edge flip; no `measureText` call. Long names simply clip at the lane edge.
- Draw labels below the bar band; use `theme.trace.gutterLabel` color; no halo/stroke by default.

**None mode (`'none'`):** no label drawing. Labels remain accessible via tooltip and the screen-reader
table (Spec 16).

**`gutterWidth = 0` guard:** when `gutterWidth = 0` (common with `'inline'` or `'none'`), the plot
occupies the full canvas width. Guard the geometry calculation so `plotWidth = canvasWidth` (not
`canvasWidth - 0`); ensure hit-testing maps correctly to lanes.

## Steps

1. Add `labelPosition: 'gutter' | 'inline' | 'none'` to `TraceStyle` in `render/types.ts`.
2. Add `labelPosition: 'gutter'` to all built-in theme objects (6 files).
3. In `canvas2d_renderer.ts`: hoist `labelBandPx` (0 for gutter/none; `gutterLabel.fontSize +
   LANE_PADDING` for inline); derive `barTop`/`barBottom`/`barMidY` from `labelBandPx`; branch the
   label pass (`gutter` unchanged; `inline` draws full name below bar with clip; `none` skips).
   Thread the same bar-band geometry into the selection-highlight pass.
4. Author `22_responsive.story.tsx` with `labelPosition` and width knobs; include mobile (~320px)
   and side-panel (~480px) presets.

## Storybook

`20_responsive.story.tsx`:
- A `labelPosition` knob (`gutter` / `inline` / `none`).
- A chart `width` knob with presets: mobile (320px), side-panel (480px), full (800px).
- Demonstrates that at 320px with `labelPosition='inline'` and `gutterWidth=0`, the timeline remains
  usable and labels read correctly.

## Tests

- Geometry: `gutterPx(style)` returns 0 for `'inline'` and `'none'` → `plot.width = canvasWidth`,
  `plot.left = 0`, `gutter.width = 0` even when `style.gutterWidth = 200`. Verified in
  `geometry.test.ts`.
- `'none'` mode: `draw()` emits zero `ctx.fillText` calls (spied via `jest-canvas-mock`).
- `'inline'` with 3 visible spans: 3 `fillText` calls, each with the full span name (no ellipsis).
  A plot-bounds `clip()` is issued per visible label.
- `'inline'` with bar fully off-screen left: no `fillText` for that lane (bar-cull condition).
- `'inline'` with bar partially visible (starts off-screen left): label is drawn at `x = plot.left`
  (sticky-left clamp).
- Tick-label edge alignment: `TICK_LABEL_EDGE_PX` constant; leftmost tick switches to
  `align='left'`, rightmost to `align='right'`.

## Review (`/review-claudio`)

- Verify inline label behavior for an empty span name (`span.name = ''`) — the `&& span.name` guard
  in the inline branch skips the draw without calling `ctx.rect`/`ctx.clip`.
- Verify `labelPosition='none'` collapses the gutter via `gutterPx()` — no grey left panel on
  canvas and no misaligned wheel/key-zoom math.
- Verify ADR 0004 Decision 4 dimension math holds with `gutterPx()` returning 0 (no division by
  zero or negative widths in scroll/hit-test math).

## Acceptance

- At ~320px with `labelPosition='inline'`, the timeline is readable; labels start near the bar's
  start edge, overflow right, and clip at the plot's right edge (no right-edge flip).
- `labelPosition='none'` renders no text labels on canvas; gutter collapses automatically.
- `labelPosition='gutter'` (default) is pixel-identical to the pre-Spec-17 baseline.
- `yarn jest trace_chart` green (340 tests pass). `tsc --noEmit` on `packages/charts` is clean.
