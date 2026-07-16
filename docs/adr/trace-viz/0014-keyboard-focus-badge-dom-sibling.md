# 0014 — Keyboard focus badge is a DOM sibling `<div>`, not a canvas draw

**Status:** Accepted (Spec 12)

## Context

When the trace canvas has keyboard focus, sighted users need a visible indicator (WCAG 2.4.7 "Focus
Visible"). The canvas renders with `outline: none` (a browser focus ring would be clipped by
`.echContainer`'s `overflow: hidden`), and the focused-lane highlight only appears after the first
arrow keypress — leaving a gap between Tab-focus and the first visible response.

The indicator must appear synchronously when the canvas receives focus, with no dependence on the next
animation frame.

## Decision

A small "keyboard active" badge (`<div aria-hidden>` with an inline keyboard SVG and label text) is
rendered as a **DOM sibling of the `<canvas>` inside the `<figure>`** when `this.hasFocus` is `true`.
It is shown/hidden via `this.setState({})` in `handleFocus` / `handleBlur`.

The badge is `aria-hidden` — the screen-reader surface (summary, table, aria-live) already conveys
focus state. The badge is purely a sighted focus-visible cue.

Opt-out: `TraceSpec.showKeyboardFocusBadge = false` suppresses the badge (e.g. in design mockups or
when a custom external indicator is provided).

## Why DOM, not canvas

Drawing on canvas would require the RAF loop to keep running solely to repaint the badge, coupling a
purely visual affordance to the animation pipeline. This is the same rationale as ADR 0009 (brush
rubber-band as a CSS `<div>`), applied to a different overlay.

`setState` is synchronous in the React update cycle: the badge appears in the same paint as the focus
event, with no RAF delay. On-canvas drawing fires at the next `scheduleRender()` tick — potentially
one RAF frame (~16 ms) later.

## Considered alternatives

**Draw the badge on canvas** — rejected: RAF coupling, 16 ms latency, and renderer/geometry changes
required (new field in `TraceGeometry`, new draw pass in `canvas2d_renderer.ts`, new theme token).

**Restore the browser `outline`** — rejected: `.echContainer` is `overflow: hidden`; the ring is
clipped and invisible regardless of CSS value.

**Focused-lane highlight as the sole focus indicator** — rejected: the highlight only appears after
the first arrow keypress, not immediately on focus. A user who has Tab-focused the chart but not yet
pressed an arrow key has no visual confirmation that focus landed.

**`aria-label` on the canvas** — rejected: this addresses SR discoverability (already handled by
`role="application"` and the SR summary), not sighted focus visibility.

## Consequences

The badge follows the ADR 0012 sibling rule: it is outside the `<canvas>` element so it is never
inside the `role="application"` subtree. `pointerEvents: none` ensures it doesn't intercept clicks
intended for the canvas below it. `zIndex: 1` keeps it above the canvas's `absolute` stacking context.

If `showKeyboardFocusBadge` is `false`, focus feedback falls entirely to the focused-lane highlight
(visible after the first arrow press) and the aria-live announcement — acceptable for controlled
embedding contexts that supply their own focus indicator.
