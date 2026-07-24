# Spec 23 — Touch gestures (pinch-zoom, drag-pan, tap/double-tap selection, long-press pin)

**Goal:** touch-device parity for the core gestures — two-finger pinch changes the Focus domain,
single-finger drag pans, tap/double-tap select segments/spans, and long-press pins the tooltip.

**Depends on:** [Spec 7](./spec-7-tooltip-events.md) (picking/events), [Spec 10](./spec-10-pinnable-tooltip.md)
(pin machinery), [Spec 13](./spec-13-segment-selection.md) (segment selection model), [ADR 0004](../0004-raf-render-loop-and-interaction-model.md)
(interaction model), [ADR 0011](../0011-segment-selection-model.md) (selection), [ADR 0021](../0021-touch-interaction-model.md)
(touch model decisions).

## Files

- `chart_types/trace_chart/trace_chart.tsx` — three touch handlers + long-press timer wiring; extract
  shared `commitSegmentSelection` / `commitSpanSelection` / `pinAt` helpers out of the existing mouse
  handlers so touch and mouse share one implementation.
- `chart_types/trace_chart/render/interaction.ts` — two new pure helpers: `mapTouchesToCanvasX` and
  `pinchRatio`.
- `chart_types/trace_chart/trace_state.ts` — new `TouchState` interface.
- Reuse unchanged: `timeslip/projections/zoom_pan.ts` (`doZoomAroundPosition` with the `touch` flag,
  `doPanFromPosition`, `markDragStartPosition`, `endDrag`, `startTouchZoom` / `resetTouchZoom` /
  `touchOngoing`, `multiplierToZoom`); `timeslip/utils/multitouch.ts` (`touchMidpoint`, `twoTouchPinch`,
  `zeroTouch`, `continuedTwoPointTouch`, `setNewMultitouch`, `eraseMultitouch`, type `Multitouch` —
  **not** `touches` or `getPinchRatio`, see ADR 0021 Decision 3); `render/interaction.ts`
  (`computeZoomMax`, `computeMaxScroll`); `pickRegion`; `selection_helpers`; `pinTooltip`/`unpinTooltip`.

## Contract

Touch is a new *input* path into the existing Focus-domain / Scroll-offset / Selection / Pin machinery;
no new downstream concepts or callbacks are added.

| Gesture | Behavior | Mirrors |
|---|---|---|
| Two-finger pinch | Changes the **Focus domain** — horizontal time zoom about the pinch midpoint (zoom-only, no simultaneous pan) | `handleWheel` |
| Single-finger drag | Pans **Focus domain** (horizontal) and **Scroll offset** (vertical) simultaneously | `handleMouseMove` |
| Tap | **Selected segment** (`region: 'active' \| 'waiting'`) | `handleCanvasClick` |
| Double-tap | **Selected span** (`region: 'span'`) | `handleDblClick` |
| Long-press (~500 ms, stationary) | **Pins the tooltip** | `handleContextMenu` |

**Mouse-only (intentional non-goals):**
- **Hover tooltip** — no hover exists on touch; span detail on touch is reachable via long-press pin.
- **Brush** — no touch Shift modifier; pinch covers narrowing the Focus domain. See ADR 0021.

## Steps

### 1. Extract shared helpers from existing mouse handlers (`trace_chart.tsx`)

Pull three private methods out of the existing click/dblclick/contextmenu handlers so both mouse and
touch paths share a single implementation (no behaviour change — the extraction is guarded by the
existing test suite):

- **`commitSegmentSelection(result, geom, mode)`** — the body of the `handleCanvasClick` `setTimeout`
  callback that builds a `TraceSegmentRef` and calls `applySelection` + `fireSelectionChange`.
- **`commitSpanSelection(result, geom, mode)`** — the body of `handleDblClick` from the `pickRegion`
  result onward that builds a `region:'span'` ref and fires.
- **`pinAt(x, y)`** — the body of `handleContextMenu` from `pickRegion` on: the empty-region NOP, the
  `updateHover(result)` call, the scoped window listener additions, and `pinTooltip(true)`. `handleContextMenu`
  then delegates to `pinAt(zoomSafePointerX(e), zoomSafePointerY(e))`.

### 2. Add pure helpers to `render/interaction.ts`

```ts
/**
 * Map a TouchEvent's active touches to canvas-relative x positions, sorted left-to-right,
 * for pinch math. `rectLeft` is `canvas.getBoundingClientRect().left`.
 *
 * Uses `clientX - rectLeft` which equals `offsetX` when the canvas has zero border/padding
 * (trace_chart.tsx inline style), matching the offsetX convention of the wheel/mouse paths.
 */
export function mapTouchesToCanvasX(e: TouchEvent, rectLeft: number): Multitouch

/**
 * Pinch ratio = previous finger spread / current finger spread.
 * A value > 1 means the fingers spread apart (zoom in); < 1 means they converged (zoom out).
 *
 * NOT the same as timeslip's getPinchRatio, which is buggy (see ADR 0021 Decision 3).
 */
export function pinchRatio(prev: Multitouch, next: Multitouch): number
// → (prev[1].position - prev[0].position) / (next[1].position - next[0].position)
```

### 3. Add `TouchState` to `trace_state.ts`

```ts
export interface TouchState {
  multitouch: Multitouch;   // previous frame's sorted touch positions, for pinchRatio
  tapStart: { x: number; y: number } | null; // 1-finger gesture origin for hit-testing
  moved: boolean;            // true once movement exceeded TAP_MOVE_TOLERANCE_PX → drag, not tap
  longPressFired: boolean;   // true once the long-press timer fired → suppress the release-tap
}
```

`longPressTimer` is a plain instance field alongside `clickTimer` (not part of `TouchState`).

### 4. Wire touch handlers in `trace_chart.tsx`

Constants (alongside the existing `DBLCLICK_DEBOUNCE_MS` / `WHEEL_ZOOM_VELOCITY`):
```ts
const TAP_MOVE_TOLERANCE_PX = 10;
const LONG_PRESS_MS = 500;
```

Register `{ passive: false }` in `setupEventHandlers` (alongside wheel/mousedown); mirror in `teardownEventHandlers`:
```
canvas: touchstart, touchmove, touchend, touchcancel
```
(`touchend` and `touchcancel` share the same handler.)

**`handleTouchStart(e)`:**
- `e.preventDefault()`.
- Recompute `rect = canvas.getBoundingClientRect()`.
- `const mapped = mapTouchesToCanvasX(e, rect.left)`.
- **If `this.pin.pinned`** → `handleUnpinningTooltip()`, reset `touch.tapStart = null`, return. (Mirrors
  the mouse "click-while-pinned dismisses but does not select" guard at `handleCanvasClick`.)
- **2 touches (pinch start):** `setNewMultitouch(touch.multitouch, mapped)`, `startTouchZoom(this.zoomPan)`,
  `markDragStartPosition(this.zoomPan, touchMidpoint(mapped))`; cancel `longPressTimer` (if pending);
  `this.flywheelActive = false`; clear `clickTimer`; `updateHover(null)`.
- **1 touch (tap / long-press / drag candidate):** `easeZoom = false`, `flywheelActive = false`,
  `updateHover(null)`; `markDragStartPosition(this.zoomPan, x)`;  set `dragStartY` /
  `dragStartScrollOffset`; set `touch.tapStart = {x, y}`, `touch.moved = false`, `touch.longPressFired =
  false`; start `longPressTimer = setTimeout(() => { if (!touch.moved) { pinAt(x, y); touch.longPressFired = true; } }, LONG_PRESS_MS)`.

**`handleTouchMove(e)`:**
- `e.preventDefault()`.
- `const mapped = mapTouchesToCanvasX(e, rect.left)`.
- **2 touches (pinch — mirrors `touchUpdate:149-164` in timeslip_render.ts):**
  `const ratio = pinchRatio(touch.multitouch, mapped)`;
  `doZoomAroundPosition(this.zoomPan, {innerSize: plotWidth, innerLeading: plotLeft}, touchMidpoint(mapped), multiplierToZoom(ratio), 0, true)`;
  clamp `focus.zoom` with `computeZoomMax(domain.max - domain.min)` (same clamp as `handleWheel`);
  `setNewMultitouch(touch.multitouch, mapped)`; `scheduleRender()`. **No `doPanFromPosition`** during
  pinch — zoom-only (see ADR 0021 Decision 2).
- **1 touch (pan):** if distance from `tapStart` > `TAP_MOVE_TOLERANCE_PX` → `touch.moved = true`,
  cancel `longPressTimer`; `doPanFromPosition(this.zoomPan, plotWidth, x)` (horizontal); clamp
  `scrollOffset` via `computeMaxScroll(spans.length, style.laneHeight, plotHeight)` (vertical);
  `scheduleRender()`.

**`handleTouchEnd(e)` (also `touchcancel`):**
- `clearTimeout(longPressTimer)`.
- **End of pinch** (prior `multitouch.length === 2`, now < 2): `eraseMultitouch(touch.multitouch)`;
  `resetTouchZoom(this.zoomPan)`; if one finger remains, `markDragStartPosition` that finger so a
  lingering finger continues to pan.
- **`touch.longPressFired`** → pin already shown; reset `touch.longPressFired = false`, `touch.tapStart =
  null`; return.
- **Single-finger, `!touch.moved`** → **tap:** `result = pickRegion(tapStart.x, tapStart.y, this.hover.lastGeom)`;
  if `result && result.index >= 0` fire `onElementClick([buildTraceEvent(span)])` immediately (same
  as mouse — `onElementClick` fires per tap, so a double-tap fires it twice, matching click/click/dblclick
  on mouse); **double-tap disambiguation:** if `this.clickTimer !== null` → `clearTimeout(clickTimer)`,
  `this.clickTimer = null`, `commitSpanSelection(result, geomSnapshot, 'replace')`; else
  `this.clickTimer = setTimeout(() => commitSegmentSelection(result, geomSnapshot, 'replace'), DBLCLICK_DEBOUNCE_MS)`.
  (Mode is always `'replace'` — touch has no modifier keys.)
- **Single-finger, `touch.moved`** → drag ended: `endDrag(this.zoomPan)`, `flywheelActive = true`,
  `scheduleRender()` (inherits the kinetic coast exactly as `handleMouseUp`).
- Reset `touch.tapStart = null`.

## Storybook

No new story required. The existing `07_tooltip_events.story.tsx` and `01_intro.story.tsx` exercise all
five gestures via Chrome DevTools device-toolbar touch emulation. Optionally add a one-line note to one
of these stories' descriptions pointing to touch-gesture support.

## Tests

- **`render/interaction.test.ts`:**
  - `mapTouchesToCanvasX` — 0 touches → `[]`; 1 touch → single entry; 2 touches unsorted in `TouchList`
    → sorted output; `rectLeft` is subtracted correctly.
  - `pinchRatio` — fingers spread `[100,300]→[120,280]` ⇒ `200/160 = 1.25` (regression guard against
    the timeslip bug where the same inputs incorrectly yield `1.875`); fingers converge (zoom-out) ⇒ ratio < 1.
- **`trace_chart.test.tsx`** (jsdom `TouchEvent` dispatch, follow existing mouse-dispatch patterns):
  - Single tap over a segment → `onSelectionChange` fires a segment ref after `DBLCLICK_DEBOUNCE_MS`.
  - Two taps in rapid succession → span ref fires, the pending segment-select commit is cancelled.
  - Single-finger drag → no selection (`moved` guard); `scrollOffset` and `zoomPan.focus.pan` change.
  - Two-finger pinch → `focus.zoom` increases and is clamped below `computeZoomMax(domain.max - domain.min)`.
  - Long-press (advance fake timer 500 ms, finger stationary) → `pinTooltip` pinned; subsequent tap →
    tooltip unpinned and no selection fired.

## Review (`/review-claudio`)

Tap/double-tap disambiguation timing edge cases (timer cleared correctly in all branches); kinetic coast
after a touch drag (endDrag path); correct use of `touch=true` flag in `doZoomAroundPosition` (must use
`focusStart.zoom`, seeded by `startTouchZoom`); zoom clamp on both pinch and wheel paths; no double-pin
(long-press while already pinned should be guarded); `rectLeft` recomputed per handler (not stale from
`setupEventHandlers`).

## Acceptance

All five gestures behave per the contract table on a real touch device (or DevTools touch emulation):
pinch changes the Focus domain about the midpoint, floored at the minimum visible extent; single-finger
drag pans time and lanes with a kinetic coast on release; tap selects a segment; double-tap selects the
whole span; long-press pins the tooltip, dismissed by the next tap or Escape. Mouse/wheel/keyboard/brush
paths are unchanged. `pinchRatio` is position-independent (verified by the regression test).
