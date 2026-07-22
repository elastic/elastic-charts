# Spec 12 — Accessibility (best effort)

**Goal:** make the trace chart reachable and operable by keyboard; give screen-reader users a
meaningful description of the trace data via a hidden paginated table and an `aria-live` announcement
region; provide a focused-lane visual highlight for sighted keyboard users. This spec also owns the
`scrollLaneIntoView` / `computeScrollTarget` scroll helper used by [Spec 14](./spec-14-scroll-to-lane.md).

**Depends on:** [Spec 6](./spec-6-connected-component.md) — `scrollOffset` and `computeMaxScroll`
are in place. Canvas is already `tabIndex=0`.

> **Note on `ScreenReaderSummary`:** `getA11ySettingsSelector` is imported and mapped in
> `trace_chart.tsx`, but `ScreenReaderSummary` is **not yet rendered** — this spec must add it.

## Files

- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add `focusedLaneBackground: Color`
  to `TraceStyle` (a themed token for the full-width highlight behind the keyboard-focused lane); add
  `focusedLaneIndex: number | null` to `TraceGeometry`.
- `packages/charts/src/chart_types/trace_chart/render/interaction.ts` — add `computeScrollTarget(
  laneIndex, scrollOffset, plotHeight, laneHeight, maxScroll, align)` scroll-target math (used here for
  keyboard nav and reused by [Spec 14](./spec-14-scroll-to-lane.md) for `scrollToSpan`).
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — accept `focusedLaneIndex` and
  thread it into the returned `TraceGeometry`.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — add a focused-lane
  background-highlight pass before lane content (full-width rect in `focusedLaneBackground` color,
  drawn only when `focusedLaneIndex !== null` and the lane is in the visible window).
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — add `focusedLaneIndex: number |
  null` instance field; `keydown` handler; `blur` handler; `scrollLaneIntoView(index, { align })`
  method; an `aria-live="polite"` visually-hidden `<div>` for announcements; render
  `ScreenReaderSummary` and the screen-reader table.
- `packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.tsx` *(new)* — a
  hidden, paginated `<table>` of spans (name, total duration, self time, start offset, parent name)
  styled with `echScreenReaderOnly`. Pagination: 20 rows per page, following the pattern in
  `partition_chart/renderer/dom/screen_reader_partition_table.tsx`.

## Contract

**`focusedLaneIndex`:** the lane currently selected by keyboard navigation. Distinct from
`hoverIndex` (mouse-driven). Only one lane is focused at a time; cleared when the canvas loses focus
(`blur` event) or `Escape` is pressed.

**Keyboard model** (canvas is already `tabIndex=0`):

| Key | Action |
|---|---|
| `↑` | Move `focusedLaneIndex` to previous lane (clamp at 0); scroll into view; announce via `aria-live`. |
| `↓` | Move `focusedLaneIndex` to next lane (clamp at `spans.length - 1`); scroll; announce. |
| `Home` | Jump to lane 0; scroll; announce. |
| `End` | Jump to last lane; scroll; announce. |
| `Enter` or `Space` | Fire `onElementClick` for the focused span. |
| `←` | Pan the focus domain one step to the left (same nudge as a pan gesture). |
| `→` | Pan the focus domain one step to the right. |
| `+` | Zoom in one step (same as one wheel-up tick). |
| `-` | Zoom out one step. |
| `Esc` | Clear `focusedLaneIndex`; also unpin tooltip (Spec 10). |

Arrows are navigation only — `↑`/`↓` move between lanes; `←`/`→` pan time. Zoom is on `+`/`-`
so screen-reader users (for whom zoom is a visual-only affordance) keep all four arrows for
navigation.

**`computeScrollTarget(laneIndex, scrollOffset, plotHeight, laneHeight, maxScroll, align)`:**
- **`align: 'center'`** (used by [Spec 14](./spec-14-scroll-to-lane.md) `scrollToSpan`): center the
  lane in the plot: `target = laneIndex * laneHeight - (plotHeight - laneHeight) / 2`. Clamp to
  `[0, maxScroll]`.
- **`align: 'nearest'`** (used by keyboard nav): if the lane is already fully visible
  (`top >= 0 && top + laneHeight <= plotHeight`), return `scrollOffset` unchanged. Otherwise scroll
  just enough: if `top < 0`, `target = laneIndex * laneHeight`; if `top + laneHeight > plotHeight`,
  `target = laneIndex * laneHeight - plotHeight + laneHeight`. Clamp to `[0, maxScroll]`.
- Both modes snap (no tween) per ADR 0004 vertical-1:1.

**`scrollLaneIntoView(index, { align })`:** computes the target via `computeScrollTarget`, sets
`this.scrollOffset`, then triggers a repaint via `this.scheduleRender?.()`.

**Scroll into view (keyboard nav):** after each ↑/↓/Home/End keypress, call
`scrollLaneIntoView(focusedLaneIndex, { align: 'nearest' })` — scroll only if off-screen, just
enough to bring the lane to the nearest edge. Never centers on each arrow press (would yank the
viewport).

**`aria-live` announcement:** a `position: absolute; width: 1px; height: 1px; overflow: hidden`
`<div aria-live="polite" aria-atomic="true">` updated with the focused span's name and total duration
after each lane move. Example: `"http.get /api/users — 142 ms"`. Use `textContent` assignment,
not `innerHTML` (XSS guard).

**Screen-reader table (`screen_reader_trace_table.tsx`):** hidden paginated `<table>` of all visible spans.
Columns: name, total duration, self time, start offset (relative to trace start), parent name
(`"—"` if root). 20 rows per page (`TABLE_PAGINATION = 20`). Styled with `echScreenReaderOnly`
(visible only to AT). Model: `partition_chart/renderer/dom/screen_reader_partition_table.tsx`.

**`ScreenReaderSummary`:** add to the JSX with a meaningful `label` (e.g. "Trace waterfall with N
spans"). This component is **not** currently rendered in `trace_chart.tsx` — this spec adds it.

**`focusedLaneBackground` theme token:** default value is a low-opacity version of the EUI focus
color (or `theme.colors.primary` at 10% opacity). Drawn as a full-width rect across the lane row,
before span content (so active segments render on top). Add to `TraceStyle` + the six theme files.

## Steps

1. Add `focusedLaneBackground: Color` to `TraceStyle` and the six theme files; add
   `focusedLaneIndex: number | null` to `TraceGeometry`.
2. Add `computeScrollTarget(laneIndex, scrollOffset, plotHeight, laneHeight, maxScroll, align)` to
   `render/interaction.ts`.
3. Extend `buildGeometry` in `render/geometry.ts` to accept and thread `focusedLaneIndex`.
4. Add the focused-lane highlight pass to `canvas2d_renderer.ts:draw()` (before span content).
5. Add `focusedLaneIndex: number | null = null` instance field to `TraceChart`.
6. Implement `scrollLaneIntoView(index, { align })` on `TraceChart` using `computeScrollTarget`;
   pass `focusedLaneIndex` into `buildGeometry` each frame.
7. Add `keydown` handler on the canvas for the 10 key bindings in the table above; call
   `scrollLaneIntoView(…, { align: 'nearest' })` after each ↑/↓/Home/End.
8. Add `blur` handler to clear `focusedLaneIndex`.
9. Add the `aria-live` `<div>` to JSX; update its `textContent` with span name + duration after
   each lane move.
10. Create `render/screen_reader_trace_table.tsx`; render it inside `TraceChart`'s JSX.
11. Render `ScreenReaderSummary` with a meaningful `label`.
12. Author `16_accessibility.story.tsx`.

## Storybook

`16_accessibility.story.tsx`:
- `parameters.markdown` prose explaining keyboard nav and screen-reader table.
- Demonstrates: Tab to focus canvas → arrow down through lanes (watch aria-live announcements) →
  Enter to fire click → Esc to clear focus.
- Include a visible `aria-live` output box in the story (for sighted review of announcements).

## Tests

- `computeScrollTarget` (`align: 'center'`): lane 5, laneHeight 30, plotHeight 200, maxScroll 1000 →
  `target = 5*30 - (200-30)/2 = 150 - 85 = 65`.
- `computeScrollTarget` (`align: 'nearest'`): lane already in view → returns current scrollOffset
  unchanged; lane above view → returns `laneIndex * laneHeight`; lane below view → returns
  `laneIndex * laneHeight - plotHeight + laneHeight`.
- Clamp: target < 0 → 0; target > maxScroll → maxScroll.
- SR table: given 5 spans, the table renders 5 rows with correct name/duration/self-time/parent cells.
- SR table pagination: 25 spans → first page has 20 rows, second page has 5.
- Keyboard: ↑ from lane 3 → `focusedLaneIndex = 2`; at lane 0, ↑ clamps to 0.
- Keyboard: Home → `focusedLaneIndex = 0`; End → `focusedLaneIndex = spans.length - 1`.
- Keyboard: Enter fires `onElementClick` with the focused span.
- Keyboard: Esc clears `focusedLaneIndex`.
- `aria-live` div updated with the expected announcement string after a lane move.
- `focusedLaneIndex` cleared on canvas blur.

## Review (`/review-claudio`)

- Verify no focus trap (Tab moves focus out of the canvas to the next focusable element).
- Verify `aria-live` verbosity is acceptable — no double-announcement from both the live region and
  the SR table being read out simultaneously on focus change.
- Verify XSS is not possible via OTel span name/attributes flowing into the `aria-live` text (use
  `textContent` assignment, not `innerHTML`).
- Verify `focusedLaneBackground` is visually distinct on both light and dark themes.
- Run an axe check on `16_accessibility.story.tsx` and address any critical/serious findings.

## Acceptance

- All visible spans are reachable by keyboard (Tab → canvas, then arrow keys).
- Screen reader announces span name + total duration on each lane change.
- A focused lane shows a full-width background highlight in `draw()`.
- The hidden table lists all visible spans with correct data; Spec 27 omissions are reported through
  its temporary developer warning and future diagnostics rather than inaccessible table rows.
- `Esc` clears focus; canvas blur clears focus.
- `yarn jest trace_chart` and `yarn typecheck` are green; axe check passes on the story.
