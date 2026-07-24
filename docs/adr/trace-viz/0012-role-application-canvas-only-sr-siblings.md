# 0012 — `role="application"` on the `<canvas>` element only; SR content as browsable siblings

**Status:** Accepted (Spec 12)

## Context

The trace canvas is a keyboard-interactive widget. ARIA requires `role="application"` to signal to
assistive technology (AT) that the subtree is a custom application widget — not a browsable document
region — so the AT passes raw keypresses through to the element rather than intercepting them as
virtual-cursor navigation.

The chart also exposes a screen-reader surface for non-interactive AT users: a `<ScreenReaderSummary>`
(`<figcaption>`), a paginated `<ScreenReaderTraceTable>`, and a `<div aria-live>` announcement region.

## Decision

`role="application"` is applied **only to the `<canvas>` element**, not to any ancestor (`<figure>`,
`<div>`, etc.).

The SR surface elements (`<ScreenReaderSummary>`, `<ScreenReaderTraceTable>`, `<div aria-live>`) are
rendered as **siblings of the `<canvas>` inside the `<figure>`**, not as descendants of it.

## Why this matters

`role="application"` makes the **entire subtree** opaque to the AT virtual cursor. A screen-reader
user in browse mode cannot navigate into children of an application element. If the SR table or
`aria-live` div were placed inside the canvas (or any ancestor with `role="application"`), they would
be unreachable to AT users who are not interacting with the keyboard widget.

By scoping `role="application"` to the `<canvas>` only and keeping SR content as siblings, the AT can
traverse the `<figure>` in browse mode (reaching the summary and table) while still receiving raw
keypresses when the canvas itself is focused.

## Considered alternatives

**`role="application"` on the `<figure>`** — rejected: the entire `<figure>` subtree would become a
non-browsable application region, blocking access to the SR summary, table, and aria-live elements.

**`role="application"` on a wrapper `<div>` containing only the canvas** — functionally identical to
applying it to the canvas; adds an extra DOM node for no reason.

**No `role="application"` at all** — rejected: without it, AT in browse mode intercepts arrow keys as
virtual-cursor navigation instead of forwarding them to the canvas, breaking keyboard lane navigation.

## Consequences

The `<canvas>` is the *only* element in the trace chart DOM with `role="application"`. All other
elements — SR summary, SR table, brush overlay, tooltip — must not be placed inside the canvas element
(which is not possible anyway, but reinforces the sibling requirement at the `<figure>` level).

The `eslint-disable jsx-a11y/interactive-supports-focus` comment that previously suppressed a lint
warning on the canvas (`role="presentation"` was non-interactive; `role="application"` is inherently
interactive) was removed — the lint rule now passes without suppression.

Keyboard focus badge (`hasFocus` div) is also a sibling of the canvas, consistent with this pattern
(see ADR 0014).
