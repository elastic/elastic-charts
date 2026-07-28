# ADR 0012 — Trace accessibility architecture: `role="application"` on the canvas, SR data via a second selector, keyboard focus badge as a DOM sibling

**Status:** Accepted (Spec 12)

> Consolidates former ADR 0013 (screen-reader span data re-derived in a second redux selector) and
> ADR 0014 (keyboard focus badge is a DOM sibling `<div>`, not a canvas draw).

## Context

The trace canvas is a keyboard-interactive widget that also exposes a screen-reader (SR) surface for
non-interactive AT users: a `<ScreenReaderSummary>` (`<figcaption>`), a paginated
`<ScreenReaderTraceTable>`, and a `<div aria-live>` announcement region. Three related decisions —
how ARIA roles are scoped, how the SR surface gets its data, and how the sighted focus cue is drawn —
are each non-obvious and load-bearing.

## Decision 1 — `role="application"` on the `<canvas>` element only; SR content as browsable siblings

ARIA requires `role="application"` to signal to assistive technology (AT) that the subtree is a custom
application widget — not a browsable document region — so the AT passes raw keypresses through to the
element rather than intercepting them as virtual-cursor navigation.

`role="application"` is applied **only to the `<canvas>` element**, not to any ancestor (`<figure>`,
`<div>`, etc.). The SR surface elements (`<ScreenReaderSummary>`, `<ScreenReaderTraceTable>`,
`<div aria-live>`) are rendered as **siblings of the `<canvas>` inside the `<figure>`**, not as
descendants of it.

**Why this matters.** `role="application"` makes the **entire subtree** opaque to the AT virtual
cursor. A screen-reader user in browse mode cannot navigate into children of an application element.
If the SR table or `aria-live` div were placed inside the canvas (or any ancestor with
`role="application"`), they would be unreachable to AT users who are not interacting with the keyboard
widget. By scoping `role="application"` to the `<canvas>` only and keeping SR content as siblings, the
AT can traverse the `<figure>` in browse mode (reaching the summary and table) while still receiving
raw keypresses when the canvas itself is focused.

**Considered alternatives.**

- **`role="application"` on the `<figure>`** — rejected: the entire `<figure>` subtree would become a
  non-browsable application region, blocking access to the SR summary, table, and aria-live elements.
- **`role="application"` on a wrapper `<div>` containing only the canvas** — functionally identical to
  applying it to the canvas; adds an extra DOM node for no reason.
- **No `role="application"` at all** — rejected: without it, AT in browse mode intercepts arrow keys as
  virtual-cursor navigation instead of forwarding them to the canvas, breaking keyboard lane
  navigation.

The `<canvas>` is the *only* element in the trace chart DOM with `role="application"`. All other
elements — SR summary, SR table, brush overlay, tooltip, keyboard focus badge — are siblings, never
placed inside the canvas element. The `eslint-disable jsx-a11y/interactive-supports-focus` comment
that previously suppressed a lint warning on the canvas was removed — the lint rule now passes without
suppression.

## Decision 2 — Screen-reader span data re-derived in a second redux selector

`ScreenReaderSummary` and `ScreenReaderTraceTable` are redux-`connect`ed components with no props.
They follow the same pattern used by partition and goal charts: they read their data from a redux
selector override registered in the chart type's `chart_selectors.ts`, so they can be dropped into
`render()` without threading any component-local data through props.

The trace chart's normalized spans (`NormalizedSpan[]`) and domain are *not* stored in redux state.
They are derived in the component's memoized `getPipeline()` — a `(spec, vizColors) → { spans, domain }`
cache held as an instance field — because normalization is a pre-render computation owned by the
component's RAF lifecycle (ADR 0004 Decision 1).

A second memoized selector (`getTraceTableRowsSelector`, via `createCustomCachedSelector`) re-derives
normalized spans from the redux store. It reads the `TraceSpec` from `getSpecsFromStore` and the theme
`vizColors`, then calls `normalize()` + `resolveActive()` — the same functions used by `getPipeline()`.
The selector is registered as an override in `chart_selectors.ts` alongside `getScreenReaderData`.

**Why this is a second call site, not duplicated logic.** The selector reuses the existing `normalize`
and `resolveActive` functions verbatim. No new normalization algorithm exists. The selector is keyed
on `(spec, vizColors)` — the same key as `getPipeline()` — so both caches hold the same result after
the first call in each lifecycle. The alternative of reading from `lastGeom.spans` (the frame-time
geometry object) was rejected because `lastGeom` is a component instance field, inaccessible to redux
selectors.

**Considered alternatives.**

- **Put normalized spans in redux state** — rejected: would require dispatching an action on every
  data change and wiring a reducer, making the trace chart stateful in redux in a way no other
  self-managed canvas chart (Flame, Timeslip) is.
- **Pass spans as props to the SR components** — rejected: `ScreenReaderSummary` and
  `ScreenReaderTraceTable` are self-connected by design; prop-threading would couple the parent
  component to the SR components' data needs.
- **Share the single `getPipeline` cache** — not possible: the redux selector runs before the
  component instance exists and has no access to instance fields.

Two cache entries hold the same normalized spans after the first call (instance-field pipeline cache
and redux selector cache). The overhead is one extra call on mount; subsequent renders hit the
memoized result. The two caches are independently evicted but both derive from the same source inputs,
so this is harmless.

## Decision 3 — Keyboard focus badge is a DOM sibling `<div>`, not a canvas draw

When the trace canvas has keyboard focus, sighted users need a visible indicator (WCAG 2.4.7 "Focus
Visible"). The canvas renders with `outline: none` (a browser focus ring would be clipped by
`.echContainer`'s `overflow: hidden`), and the focused-lane highlight only appears after the first
arrow keypress — leaving a gap between Tab-focus and the first visible response. The indicator must
appear synchronously when the canvas receives focus, with no dependence on the next animation frame.

A small "keyboard active" badge (`<div aria-hidden>` with an inline keyboard SVG and label text) is
rendered as a **DOM sibling of the `<canvas>` inside the `<figure>`** when `this.hasFocus` is `true`.
It is shown/hidden via `this.setState({})` in `handleFocus` / `handleBlur`. The badge is `aria-hidden`
— the SR surface already conveys focus state — so the badge is purely a sighted focus-visible cue.
Opt-out: `TraceSpec.showKeyboardFocusBadge = false` suppresses the badge.

**Why DOM, not canvas.** Drawing on canvas would require the RAF loop to keep running solely to
repaint the badge, coupling a purely visual affordance to the animation pipeline. This is the same
rationale as [ADR 0009](./0009-brush-overlay-css-div.md) (brush rubber-band as a CSS `<div>`), applied
to a different overlay. `setState` is synchronous in the React update cycle: the badge appears in the
same paint as the focus event, with no RAF delay. On-canvas drawing fires at the next
`scheduleRender()` tick — potentially one RAF frame (~16 ms) later.

**Considered alternatives.**

- **Draw the badge on canvas** — rejected: RAF coupling, 16 ms latency, and renderer/geometry changes
  required (new field in `TraceGeometry`, new draw pass, new theme token).
- **Restore the browser `outline`** — rejected: `.echContainer` is `overflow: hidden`; the ring is
  clipped and invisible regardless of CSS value.
- **Focused-lane highlight as the sole focus indicator** — rejected: the highlight only appears after
  the first arrow keypress, not immediately on focus.
- **`aria-label` on the canvas** — rejected: this addresses SR discoverability (already handled by
  `role="application"` and the SR summary), not sighted focus visibility.

The badge follows the Decision 1 sibling rule: it is outside the `<canvas>` element so it is never
inside the `role="application"` subtree. `pointerEvents: none` ensures it doesn't intercept clicks
intended for the canvas below it; `zIndex: 1` keeps it above the canvas's `absolute` stacking context.
If `showKeyboardFocusBadge` is `false`, focus feedback falls entirely to the focused-lane highlight
(visible after the first arrow press) and the aria-live announcement — acceptable for controlled
embedding contexts that supply their own focus indicator.
