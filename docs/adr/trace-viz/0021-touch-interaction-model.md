# ADR 0021 — Touch interaction model: engine reuse, pinch-zoom-only, manual tap detection, long-press pin

## Context

ADR 0004 established that the trace chart's sole zoom entry point is the mouse wheel ("no touch/pinch").
The canvas already sets `touchAction: 'none'` — the CSS prerequisite for custom gesture handling — but
no touch handlers were wired. To support touch devices, five gestures are needed: two-finger pinch
(zoom), single-finger drag (pan), tap (select segment), double-tap (select span), and long-press (pin
tooltip). This ADR records the decisions that are non-obvious from the code, hard to change later, and
the result of real trade-offs. See [Spec 23](./specs/spec-23-touch-gestures.md) for the implementation
prescription.

## Decision 1 — Reuse timeslip's zoom/pan and multitouch engine; import directly

The trace chart already imports from timeslip's `@internal` zoom/pan engine (`doZoomAroundPosition`,
`doPanFromPosition`, `markDragStartPosition`, `endDrag`, `kineticFlywheel`, `multiplierToZoom`) as
established by ADR 0004. This decision extends that reuse to timeslip's touch helpers:
`startTouchZoom`/`resetTouchZoom`/`touchOngoing` from `zoom_pan.ts`, and `touchMidpoint`, `twoTouchPinch`,
`zeroTouch`, `continuedTwoPointTouch`, `setNewMultitouch`, `eraseMultitouch`, and type `Multitouch`
from `timeslip/utils/multitouch.ts`.

Imports are added directly from the existing `@internal` paths — no new shared module is extracted,
and helpers are not copied into trace. Two consumers do not justify a shared module (premature
abstraction); copying would invite drift.

## Decision 2 — Pinch is zoom-only (no simultaneous pan)

Two-finger pinch changes the Focus domain (horizontal zoom centered on the pinch midpoint) without
simultaneously panning. The timeslip reference implementation tried both and disabled the combined path
with the comment "doing both clashes in ways" (`timeslip_render.ts`). Zoom-only pinch is the established
mobile convention (Maps, Safari) and avoids jitter from two conflicting deltas applied to the same
`zoomPan` frame.

## Decision 3 — Do not reuse timeslip's `getPinchRatio`; define a correct trace-local `pinchRatio`

`timeslip/utils/multitouch.ts`'s `getPinchRatio` is buggy due to operator-precedence:

```ts
// Buggy: ?? binds tighter than -, so the numerator is multitouch[1]?.position (an absolute x),
// not the finger spread.
(multitouch[1]?.position ?? NaN - (multitouch[0]?.position ?? NaN))
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^ this entire sub-expression is the numerator
```

Verified: fingers at `[100, 300]` moving to `[120, 280]` (spread 200 → 160, correct ratio 1.25) yield
`300 / 160 = 1.875` — wrong, and position-dependent (the result changes if the same pinch gesture
happens at a different x location on the canvas). The helper has no unit tests.

The trace-local replacement is a one-line correct formula:
```ts
export function pinchRatio(prev: Multitouch, next: Multitouch): number {
  return (prev[1].position - prev[0].position) / (next[1].position - next[0].position);
}
```

Timeslip's `getPinchRatio` is **left untouched** — changing it would alter timeslip's pinch feel in
ways that are hard to predict without a touch-emulated test harness, and that is out of scope.

**Follow-up:** timeslip's `getPinchRatio` should be fixed and unit-tested in a separate change.

## Decision 4 — Manual tap and double-tap detection; reuse `clickTimer` / `DBLCLICK_DEBOUNCE_MS`

With `touchAction: 'none'` and `preventDefault()` in all touch handlers, browsers do not reliably
synthesize `click` or `dblclick` events from taps. Relying on synthetic events would require removing
`preventDefault` from tap-ending events, which would then conflict with the `preventDefault` needed to
suppress native scroll/pinch-zoom during drag and pinch — the browser cannot distinguish intent
mid-gesture.

Instead the touch layer detects taps manually (short, stationary touch: finger lifts before the
long-press timer, without having moved beyond `TAP_MOVE_TOLERANCE_PX = 10` px) and uses the existing
`clickTimer` field and `DBLCLICK_DEBOUNCE_MS = 250` ms to disambiguate single-tap from double-tap,
reusing the same mechanism that separates mouse click from dblclick. A pending `clickTimer` on
`touchend` is the double-tap signal — it is cancelled and `commitSpanSelection` fires immediately.

## Decision 5 — Long-press → pin tooltip; dismiss on subsequent tap

Long-press (finger stationary ≥ 500 ms) is the touch equivalent of right-click → pin. The existing pin
machinery (`pinAt` / `pinTooltip` / `unpinTooltip` / scoped window listeners for Escape and
`visibilitychange`) is reused unchanged.

Mouse pin is also dismissed by a `window 'click'` listener registered at pin time. That listener never
fires on touch (touch with `touchAction:'none'` + `preventDefault` produces no synthetic click), so
the touch path adds a second dismiss path: the first tap while `pin.pinned` calls
`handleUnpinningTooltip()` and returns without selecting — mirroring the mouse contract where
"click-while-pinned dismisses but does not select" (`handleCanvasClick`'s `if (this.pin.pinned) return`
guard). The existing window-click listener stays registered (harmless on pure-touch; correct on hybrid
mouse+touch devices).

## Decision 6 — `LONG_PRESS_MS = 500`; movement tolerance separates tap/long-press from drag; no tap time-cap

The primary discriminator between tap/long-press and drag is **finger movement** (`TAP_MOVE_TOLERANCE_PX
= 10` px from `touchstart` origin). A finger that moves beyond this threshold is a drag regardless of
how long it stays down. Duration separates tap from long-press: a stationary finger that **lifts before
the 500 ms timer** is a tap; one that **stays down until the timer fires** is a long-press. There is
no upper time-cap on tap — a slow-but-stationary release at, say, 400 ms is still a tap.

500 ms matches the long-press threshold used by iOS and Android system UIs, making the gesture feel
native. 10 px tolerance accommodates natural finger tremor without accidentally suppressing taps.

## Consequences

- Touch and mouse paths share `commitSegmentSelection`, `commitSpanSelection`, and `pinAt` (extracted
  from the mouse handlers in step 1 of Spec 23) — one implementation for both input types.
- **Hover tooltip and brush are mouse-only.** Hover has no touch equivalent; span detail on touch is
  reachable via long-press pin. Brush (Shift+drag zoom-to-range) has no touch modifier; two-finger
  pinch covers narrowing the Focus domain on touch.
- The amended ADR 0004 retires its "wheel is the sole zoom entry" note; the zoom clamp
  (`computeZoomMax`) now applies to both `handleWheel` and `handleTouchMove`.
