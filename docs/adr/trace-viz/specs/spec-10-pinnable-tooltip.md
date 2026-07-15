# Spec 10 — Sticky (pinnable) tooltip

**Goal:** click a span to pin the tooltip so it persists and is interactive (mouse into it, select
text, click links); `Esc` or clicking empty canvas space unpins; anchor is frozen at the click
position and respects `stickTo`.

**Depends on:** [Spec 7](./spec-7-tooltip-events.md) — `BasicTooltip` is already mounted and the
hover tooltip is working. This spec wires the three pin props that are currently hardcoded off.

## Files

- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — add `pinnedIndex: number | null`
  and `pinnedAnchor: { x: number; y: number } | null` instance fields; wire `BasicTooltip`'s
  `pinned`, `canPinTooltip`, and `pinTooltip` props (hardcoded `false` at lines ~607–619) to instance
  state; handle `click` to set/clear pin; handle `keydown` `Escape` to unpin; handle data/view change
  in `componentDidUpdate` to reset pin.
- `render/tooltip.ts` — no changes needed; tooltip content is already built per span index.

## Contract

**Frozen anchor:** the anchor pixel is captured once at click time and stays fixed while the user
subsequently scrolls, zooms, or pans. The tooltip content is static per span (built at click time);
nothing goes stale. This matches XY's pinned-tooltip semantics and preserves the interactivity
goal — a tracking anchor that slides under animation would make it impossible to move the cursor into
the tooltip.

**Pin interactions:**
- **Click over a span** → set `pinnedIndex = hoverIndex`, `pinnedAnchor = { x: pointerX, y: pointerY }`;
  keep `BasicTooltip` visible regardless of subsequent hover position.
- **Click over another span while pinned** → re-pin to the new span (update both fields).
- **Click over empty canvas** → clear pin (`pinnedIndex = null`, `pinnedAnchor = null`).
- **`Escape` key** → clear pin. Handled by `keydown` on the already-`tabIndex=0` canvas — no global
  `window` listener needed.
- **Data or view change** (`componentDidUpdate` with changed `traceSpec.data` or `viewKey`) → clear
  pin (stale index may no longer be valid).

**Anchor placement:** uses `stickTo` (default `MousePosition`) to drive `BasicTooltip`'s placement.
Captured at `pinnedAnchor`; the tooltip positions itself relative to that frozen point.

**No redux migration.** All state is local instance fields on `TraceChart`, consistent with the
self-managed model (ADR 0004).

## Steps

1. Add `pinnedIndex: number | null = null` and `pinnedAnchor: { x: number; y: number } | null = null`
   instance fields.
2. In the `click` handler: branch on whether the click hit a span or empty space, set/clear the two
   fields accordingly, call `this.forceUpdate()` (or `setState`) so `BasicTooltip` re-renders.
3. In the `keydown` handler on the canvas: intercept `Escape`, clear pin fields.
4. In `componentDidUpdate`: if `traceSpec.data` or `viewKey` changed, clear pin fields.
5. Wire `BasicTooltip` props: `canPinTooltip={true}`, `pinned={this.pinnedIndex !== null}`,
   `pinTooltip={() => { /* no-op — pin is managed by the click handler, not by BasicTooltip's
   internal toggle */ }}`. Pass the frozen anchor position when pinned.
6. Author or extend the tooltip story demonstrating pin/unpin + `stickTo` knob.

## Storybook

`13_pinned_tooltip.story.tsx` (or extend `07_tooltip_events.story.tsx`) — demonstrate:
- Click to pin, move mouse away — tooltip stays.
- Click another span while pinned — tooltip jumps to the new span.
- Click empty canvas — tooltip disappears.
- Press `Escape` — tooltip disappears.
- `stickTo` knob cycling through `MousePosition`, `VerticalCursor`, `HorizontalCursor`.

## Tests

- Click on a span: `pinnedIndex` and `pinnedAnchor` are set; tooltip remains visible after hover ends.
- Click on empty space: pin is cleared.
- `Escape` key: pin is cleared.
- Data change (`componentDidUpdate`): pin is cleared even if `pinnedIndex` was set.
- Re-pin: clicking a second span while pinned updates both fields to the new span.

## Review (`/review-claudio`)

- Verify no global `window` listener is added (should use canvas `keydown` only).
- Verify `pinnedIndex` is always cleared when `data` changes (stale lane index must not survive a
  data update — `NormalizedSpan` array is rebuilt, old indices are invalid).
- Verify `Escape` handler does not conflict with any existing browser default or EUI shortcut.
- Verify frozen-anchor behavior under DPR scaling (anchor is in CSS pixels; confirm no DPR multiply
  is applied twice).

## Acceptance

- Clicking a span pins the tooltip; it persists when the mouse moves away, scrolls, or zooms.
- Clicking empty canvas, pressing `Escape`, or changing data all unpin the tooltip.
- Clicking a second span while pinned re-pins to the new span.
- `stickTo` controls anchor placement.
- `yarn jest trace_chart` and `yarn typecheck` are green.
