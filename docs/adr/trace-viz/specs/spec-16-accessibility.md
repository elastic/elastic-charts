# Spec 16 — Accessibility (best effort)

**Goal:** make the trace chart reachable and operable by keyboard; give screen-reader users a
meaningful description of the trace data via a hidden paginated table and an `aria-live` announcement
region; provide a focused-lane visual highlight for sighted keyboard users.

**Depends on:** [Spec 17](./spec-17-scroll-to-lane.md) — `scrollLaneIntoView(index, { align })` is
required for keyboard nav to bring focused lanes into view. (Spec 17 and 14 are independent to
implement; author Spec 17 first so the helper is available when wiring the keyboard handler.)
`getA11ySettingsSelector` and `ScreenReaderSummary` are already wired in `trace_chart.tsx`.

## Files

- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add `focusedLaneBackground: Color`
  to `TraceStyle` (a themed token for the full-width highlight behind the keyboard-focused lane).
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — add a focused-lane
  background-highlight pass before lane content (full-width rect in `focusedLaneBackground` color,
  drawn only when `focusedLaneIndex !== null` and the lane is in the visible window).
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — add `focusedLaneIndex: number |
  null` instance field; keyboard handlers; an `aria-live="polite"` visually-hidden `<div>` for
  announcements; render `ScreenReaderSummary` and the screen-reader table.
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
| `↑` | Move `focusedLaneIndex` to previous lane (clamp at 0); announce via `aria-live`. |
| `↓` | Move `focusedLaneIndex` to next lane (clamp at `spans.length - 1`); announce. |
| `Home` | Jump to lane 0; announce. |
| `End` | Jump to last lane; announce. |
| `Enter` or `Space` | Fire `onElementClick` for the focused span. |
| `←` | Pan the focus domain one step to the left (same nudge as a pan gesture). |
| `→` | Pan the focus domain one step to the right. |
| `+` | Zoom in one step (same as one wheel-up tick). |
| `-` | Zoom out one step. |
| `Esc` | Clear `focusedLaneIndex`; also unpin tooltip (Spec 10). |

Arrows are navigation only — `↑`/`↓` move between lanes; `←`/`→` pan time. Zoom is on `+`/`-`
so screen-reader users (for whom zoom is a visual-only affordance) keep all four arrows for
navigation.

**Scroll into view:** after each ↑/↓/Home/End keypress, call `scrollLaneIntoView(focusedLaneIndex,
{ align: 'nearest' })` — scroll only if off-screen, scroll just enough to bring the lane to the
nearest edge. Never centers on each arrow press (would yank the viewport).

**`aria-live` announcement:** a `position: absolute; width: 1px; height: 1px; overflow: hidden`
`<div aria-live="polite" aria-atomic="true">` updated with the focused span's name and total duration
after each lane move. Example: `"http.get /api/users — 142 ms"`.

**Screen-reader table (`screen_reader_trace_table.tsx`):** hidden paginated `<table>` of all spans.
Columns: name, total duration, self time, start offset (relative to trace start), parent name
(`"—"` if root). 20 rows per page (`TABLE_PAGINATION = 20`). Styled with `echScreenReaderOnly`
(visible only to AT). Model: `partition_chart/renderer/dom/screen_reader_partition_table.tsx`.

**`ScreenReaderSummary`:** already wired — ensure it receives a meaningful `label` (e.g. "Trace
waterfall with N spans").

**`focusedLaneBackground` theme token:** default value is a low-opacity version of the EUI focus
color (or `theme.colors.primary` at 10% opacity). Drawn as a full-width rect across the lane row,
before span content (so active segments render on top).

## Steps

1. Add `focusedLaneBackground: Color` to `TraceStyle`; set a sensible default in the theme.
2. Add the focused-lane highlight pass to `canvas2d_renderer.ts:draw()`.
3. Add `focusedLaneIndex: number | null = null` instance field to `TraceChart`.
4. Add `keydown` handler on the canvas for the 10 key bindings in the table above.
5. Add `blur` handler to clear `focusedLaneIndex`.
6. Add the `aria-live` `<div>` to JSX; update it with the span name + duration after each move.
7. Create `render/screen_reader_trace_table.tsx`; render it inside `TraceChart`'s JSX.
8. Ensure `ScreenReaderSummary` has a meaningful `label`.
9. Author `17_accessibility.story.tsx`.

## Storybook

`17_accessibility.story.tsx`:
- `parameters.markdown` prose explaining keyboard nav and screen-reader table.
- Demonstrates: Tab to focus canvas → arrow down through lanes (watch aria-live announcements) →
  Enter to fire click → Esc to clear focus.
- Include a visible `aria-live` output box in the story (for sighted review of announcements).

## Tests

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
  textContent assignment, not `innerHTML`).
- Verify `focusedLaneBackground` is visually distinct on both light and dark themes.
- Run an axe check on `17_accessibility.story.tsx` and address any critical/serious findings.

## Acceptance

- All spans are reachable by keyboard (Tab → canvas, then arrow keys).
- Screen reader announces span name + total duration on each lane change.
- A focused lane shows a full-width background highlight in `draw()`.
- The hidden table lists all spans with correct data.
- `Esc` clears focus; canvas blur clears focus.
- `yarn jest trace_chart` and `yarn typecheck` are green; axe check passes on the story.
