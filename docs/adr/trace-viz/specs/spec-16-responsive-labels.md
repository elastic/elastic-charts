# Spec 16 — Responsive layout & relocatable label panel

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
embeds). Labels are drawn in the plot area itself:
- Start at the bar's start edge in CSS pixels.
- Overflow to the right into the empty lane space (not clipped to the bar width). This matches the
  Chrome DevTools Network / Kibana trace behavior where most bars are narrower than their name.
- Clip at the plot's right edge (canvas clip or manual pixel bound).
- **Right-edge flip:** when `barStartX + textWidth > plotRight - FLIP_MARGIN_PX`, right-align the
  text so it ends at `barStartX` (text drawn to the left of the bar start) rather than clipping off-
  screen.
- Draw labels *after* the active-segment fill (text on top); use `theme.trace.gutterLabel` color;
  no halo/stroke by default (add only if a review pass shows readability is inadequate).

**None mode (`'none'`):** no label drawing. Labels remain accessible via tooltip and the screen-reader
table (Spec 16).

**`gutterWidth = 0` guard:** when `gutterWidth = 0` (common with `'inline'` or `'none'`), the plot
occupies the full canvas width. Guard the geometry calculation so `plotWidth = canvasWidth` (not
`canvasWidth - 0`); ensure hit-testing maps correctly to lanes.

## Steps

1. Add `labelPosition: 'gutter' | 'inline' | 'none'` to `TraceStyle` in `render/types.ts`.
2. Update the default theme object to set `labelPosition: 'gutter'`.
3. Guard `gutterWidth = 0` in `render/geometry.ts`.
4. Add inline/none branches to the label-drawing pass in `canvas2d_renderer.ts`.
5. Implement the right-edge flip for inline labels.
6. Author `20_responsive.story.tsx` with `labelPosition` and width knobs; include mobile (~320px)
   and side-panel (~480px) presets.

## Storybook

`20_responsive.story.tsx`:
- A `labelPosition` knob (`gutter` / `inline` / `none`).
- A chart `width` knob with presets: mobile (320px), side-panel (480px), full (800px).
- Demonstrates that at 320px with `labelPosition='inline'` and `gutterWidth=0`, the timeline remains
  usable and labels read correctly.

## Tests

- Geometry: with `gutterWidth = 0`, `plotWidth = canvasWidth` and hit-testing (lane index from y-px)
  is unchanged.
- Inline labels: given a bar at `x=10`, `textWidth=200`, `plotRight=300`, label starts at `x=10`
  and is clipped at 300 (no overflow beyond the canvas).
- Right-edge flip: given `barStartX=280`, `textWidth=200`, `plotRight=300`, text is right-aligned to
  end at `barStartX=280` (text drawn leftward, not clipped off-screen).
- `'none'` mode: `draw()` emits zero text calls (spy/mock `ctx.fillText`).

## Review (`/review-claudio`)

- Verify inline label right-overflow behavior when `ctx.measureText` width is unavailable or zero
  (degenerate empty span name).
- Verify right-edge flip threshold `FLIP_MARGIN_PX` is a named constant, not a magic number.
- Verify `labelPosition='none'` + `gutterWidth=0` doesn't leave a grey gutter panel on-screen (ensure
  the `<figure>` layout also removes the gutter DOM if any).
- Verify ADR 0004 Decision 4 dimension math still holds with `gutterWidth = 0` (no division by zero
  or negative widths in scroll/hit-test math).

## Acceptance

- At ~320px with `labelPosition='inline'` and `gutterWidth=0`, the timeline is readable and labels
  do not clip off-screen (they overflow right or flip near the right edge).
- `labelPosition='none'` renders no text labels on canvas.
- `labelPosition='gutter'` (default) is pixel-identical to the pre-Spec-13 baseline.
- `yarn jest trace_chart` and `yarn typecheck` are green.
