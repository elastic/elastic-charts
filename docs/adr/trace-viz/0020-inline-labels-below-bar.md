# ADR 0020 — Inline labels render on a dedicated row below the bar (Kibana APM style)

## Context

Spec 17 adds a `labelPosition: 'inline'` mode so the trace waterfall works on narrow widths without
a fixed-width gutter. The spec text originally described inline labels as a **Chrome DevTools–style
overlay** drawn on top of the active-segment fill at the lane's vertical centre, with a right-edge
flip when the label would clip off-screen.

During implementation review, the reference chosen by the team was the **Kibana APM waterfall**
(`Screenshot 2026-07-17`), where each lane is taller and the span name appears on its own row
*below* the bar, flowing freely to the right. This is the model already familiar to Kibana users.

## Decision

`labelPosition: 'inline'` uses a **two-band lane layout**:

- **Bar band** (top portion): the total-duration line, active-segment rects, and selection
  highlight fill the bar band; its height = `laneHeight − 2×LANE_PADDING − labelBandPx`.
- **Label band** (bottom portion): the span name drawn left-aligned from the bar's start x, with no
  truncation, overflowing right into empty lane space; clipped only at the plot's right edge.
  Height = `gutterLabel.fontSize + LANE_PADDING`.

`laneHeight` is the whole-row height. The caller sets it taller for inline (the story uses 40 px).
No new theme field is needed; the band split is derived from `gutterLabel.fontSize`.

## Consequences

**Not implemented:**
- **Right-edge flip** — the spec text described flipping to right-align when the label would clip
  off-screen. Dropped: labels simply clip at the plot edge (consistent with Kibana APM).
- **`measureText` per label** — no longer needed (no flip, no ellipsis in inline mode).
- **Speculative `FLIP_MARGIN_PX` constant** — removed.

**Also decided:**
- `gutterPx(style)` returns 0 for both `'inline'` and `'none'` modes. The gutter region has no
  content when labels are not drawn in it; reserving space for it would waste plot area and
  misalign interaction coordinates (wheel zoom, pan, keyboard zoom). This makes both non-gutter
  modes coherent without requiring the caller to also set `gutterWidth: 0`.
- Tick labels near the plot edges (leftmost and rightmost visible ticks) flip their `textAlign` to
  `'left'` / `'right'` respectively, preventing labels from painting outside the canvas. This was
  latent in gutter mode (the gutter acted as a left margin) and became visible in inline/none mode.

## Alternatives considered

**Chrome-style overlay (original spec text):** Draw the label centered vertically on the bar,
overlaid on the fill. Rejected: the active-segment fill is typically colored (Spec 9 `colorBy`)
and text-on-color is hard to read without a halo. The reference Kibana screenshot shows below-bar
labels, not overlays, and aligns with user expectations.

**Right-edge flip:** Flip from left- to right-aligned when `barStartX + textWidth > plotRight`. Not
needed for below-bar labels that overflow freely; a clip at the plot edge is sufficient and avoids
the `measureText` cost per visible label.

**Auto-collapse breakpoint:** Automatically switch `labelPosition` to `'inline'` when
`chartDimensions.width < responsiveBreakpointPx`. Considered during implementation; scoped out to a
future spec. The explicit `labelPosition` prop is sufficient for current use cases.
