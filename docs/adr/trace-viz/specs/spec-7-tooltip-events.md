# Spec 7 — Picking, custom tooltip & element events

**Goal:** hover/click a span → custom tooltip + `onElement*` callbacks.

**Depends on:** [Spec 6](./spec-6-connected-component.md).

## Files

- `chart_types/trace_chart/trace_chart.tsx` (event handlers, hover state).
- `chart_types/trace_chart/chart_selectors.ts` (`getPointerCursor`).

## Contract

Hover is **not** redux-selector-driven — Trace is in the self-managed canvas family (Spec 0), and
neither of its precedents (Flame, Timeslip) route hover through the store. Follow Flame's pattern:
`trace_chart.tsx` keeps the hovered span index as a plain component instance field (e.g. `hoverIndex`),
mutated in the pointer handler and forcing a re-render, mirroring Flame's `hoverIndex`/
`updateHoverIndex` (`flame_chart.tsx`). `chart_selectors.ts` exposes only `getPointerCursor(state)`
(cursor style from settings, independent of hover state). Pointer handlers map `pickLane` results to
tooltip visibility and `onElementOver/Out/Click`.

## Steps

On `mousemove`, call `pickLane` and set the hovered index on the component instance field; position the
shared `BasicTooltip` (or the caller's `customTooltip`) at the pointer; clear on pointer leave. On click, fire
`onElementClick` with a payload carrying the full `NormalizedSpan` (including `meta`). Provide sensible
default tooltip values (name, total duration, self time, start offset from trace start) while allowing
`<Tooltip customTooltip>` to fully override the rendered content — this is how OTel `attributes`/`status`
retained in `meta` become visible to callers who want them (see
[ADR 0002](../0002-single-normalized-span-dual-input.md)).

## Storybook

`storybook/stories/trace/07_tooltip_events.story.tsx` — a `<Tooltip customTooltip>` that renders span
name plus OTel attributes/status, and `onElementClick`/`onElementOver` logged via Storybook actions.

## Tests

`pickLane` → tooltip-info mapping unit test; callback payload shape test.

## Review (`/review-claudio`)

`TooltipInfo.datum` typing (no `as`), callback payload contract, hover-handling throttling/performance,
XSS safety when rendering untrusted OTel attribute strings in a custom tooltip.

## Acceptance

Hovering shows a tooltip; the custom-tooltip story renders OTel attributes; `onElementClick` fires with
the span; review findings addressed.
