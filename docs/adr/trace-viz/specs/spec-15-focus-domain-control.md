# Spec 15 — Focus-domain control + overview composition

**Goal:** let an external chart drive and reflect the detail Trace's visible time window — the
Chrome DevTools Performance / stock-market composition pattern — via a controlled `focusDomain` prop
and an `onFocusDomainChange` callback.

**Depends on:** [Spec 11](./spec-11-brush-zoom.md) — `domainToZoomPan` helper in `render/interaction.ts`
is required. [ADR 0007](../0007-focus-domain-perform-and-fire.md) records the perform-and-fire
decision and the echo-suppression implementation.

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — add `focusDomain?: [number, number]`
  (controlled prop) and `onFocusDomainChange?: (domain: [number, number]) => void` to `TraceSpec`.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — feed controlled prop into
  `zoomPan.focus` via `domainToZoomPan`; fire callback at RAF-loop stop; implement echo-suppression
  via `lastFiredDomain` instance field.

## Contract

**Uncontrolled by default.** When `focusDomain` is not supplied the chart behaves exactly as today.

**Perform-and-fire (ADR 0007):** when `focusDomain` is supplied, local gestures (wheel-zoom, drag-pan,
brush) still execute and fire `onFocusDomainChange`; the parent decides whether to update the prop.
The chart is never fully locked in controlled mode.

**Prop → zoomPan:** in `componentDidUpdate`, if `focusDomain` changed by reference and is outside the
echo-suppression epsilon (see below), call `domainToZoomPan(focusDomain, referenceDomain)` and set
`this.zoomPan.focus`, then start the RAF loop. The existing `tween`/RAF path eases the extent (zoom);
pan snaps (ADR 0004).

**Callback fires at RAF-loop stop.** The loop keep-going condition is
`tweenOngoing || flywheelActive`. When both are false, compute the settled domain via
`getFocusDomain(this.zoomPan, …)` and, if outside epsilon, update `lastFiredDomain` then fire
`onFocusDomainChange`.

**Echo-suppression (ADR 0007 §Echo-suppression):** hold `lastFiredDomain: [number, number] | null`
as an instance field. On RAF-loop stop:

```ts
const settled = getFocusDomain(this.zoomPan, refFrom, refTo);
const epsilon = 0.001; // TWEEN_DONE_EPSILON — extent-ratio, scale-invariant
const ratio = Math.abs(1 - (settled[1] - settled[0]) / (lastFiredDomain[1] - lastFiredDomain[0]));
if (ratio > epsilon || positionDiffers(settled, lastFiredDomain)) {
  this.lastFiredDomain = settled;          // update BEFORE firing (re-entrant safety)
  onFocusDomainChange(settled);
}
```

Incoming `focusDomain` prop in `componentDidUpdate`: if the incoming range matches `lastFiredDomain`
within epsilon, treat it as an echo of our own emission and skip re-arming the tween.

## Steps

1. Add `focusDomain` prop and `onFocusDomainChange` callback to `TraceSpec`.
2. Add `lastFiredDomain: [number, number] | null = null` instance field to `TraceChart`.
3. In `componentDidUpdate`: if `focusDomain` changed and differs from `lastFiredDomain` by more than
   epsilon, call `domainToZoomPan` and start the loop.
4. At the RAF-loop stop point (after the keep-going check returns false): compute settled domain, apply
   echo-suppression logic, fire `onFocusDomainChange` if applicable.
5. Author `19_overview_sync.story.tsx`.

## Storybook

`19_overview_sync.story.tsx` — an XY area chart ("span density over time") rendered above a `<Trace>`
detail panel:
- Overview `onBrushEnd` → updates `focusDomain` state → flows into `<Trace focusDomain={…}>`.
- `<Trace onFocusDomainChange={…}>` → updates a brush annotation on the overview to mirror the
  Trace's visible window.

Model: `storybook/stories/interactions/19_multi_chart_cursor_sync.story.tsx`. Use
`onPointerUpdate`/`dispatchExternalPointerEvent` for cursor sync if desired.

## Tests

- Uncontrolled: no prop → `lastFiredDomain` is null; `onFocusDomainChange` is never called.
- Controlled: supplying `focusDomain` sets `zoomPan.focus` (verify via `getFocusDomain` after update).
- Echo-suppression: callback fires once at settle; feeding the emitted domain back as a prop does not
  re-arm the tween (simulate by calling `componentDidUpdate` with the last-fired domain — no new loop).
- Perform-and-fire: a wheel-zoom gesture fires the callback at loop stop even when `focusDomain` is
  not supplied.

## Review (`/review-claudio`)

- Verify no jitter loop: use the story in isolation and confirm the overview ↔ detail cycle stabilizes
  after a single brush gesture (no repeated micro-updates).
- Verify `lastFiredDomain` is reset when `data` changes (`viewKey` reset path) so a fresh dataset
  doesn't suppress the first legitimate fire.
- Verify `componentDidUpdate` prop comparison guards against `undefined` (no prop → no-op).

## Acceptance

- Brushing the XY overview zooms the Trace detail to the brushed range.
- Zooming/panning the Trace detail updates the overview brush annotation.
- The story is smooth with no jitter loop between the two charts.
- `yarn jest trace_chart` and `yarn typecheck` are green.
