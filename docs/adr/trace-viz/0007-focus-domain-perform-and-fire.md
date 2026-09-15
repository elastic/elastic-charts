# ADR 0007 — Controlled `focusDomain` is perform-and-fire; one callback for all gesture sources

When `focusDomain` is supplied as a prop, local gestures (wheel-zoom, brush, drag-pan) still execute
and fire `onFocusDomainChange` — the parent decides whether to update the prop. The chart is never
fully locked in controlled mode; it behaves like a React controlled input where the consumer handles
the event. A "fully-controlled" alternative (prop wins, gestures ignored) was rejected because it
would make the chart inert in composition setups where the parent wants to relay but not veto gestures.

A single `onFocusDomainChange` callback covers all gesture sources (zoom, pan, brush, prop change).
Separate callbacks per gesture source were considered and rejected: the parent cares about the
resulting domain, not the cause.

## Echo-suppression implementation

Because the callback result is often fed back as the `focusDomain` prop (overview composition
pattern), a naive implementation creates an infinite micro-jitter loop: settle fires callback →
parent updates prop → prop re-arms tween → new settle → fires again. The implementation uses the
existing "caller" convention established in
`xy_chart/state/selectors/on_pointer_move_caller.ts:86-102`: hold a `lastFiredDomain` instance
field; on RAF-loop stop compute the settled domain, update `lastFiredDomain` **before** invoking the
callback (so a re-entrant prop update sees it immediately), then skip the callback if the domain is
within epsilon of `lastFiredDomain`. An incoming `focusDomain` prop within the same epsilon of
`lastFiredDomain` is treated as an echo and does not re-arm the tween. **Epsilon = extent-ratio
`0.001`**, mirroring `TWEEN_DONE_EPSILON` in `timeslip/projections/domain_tween.ts:13` — consistent
with ADR 0004's settle test and scale-invariant.

### Implementation refinements (recorded during Spec 16)

Three refinements over the original design that resolve edge-cases:

1. **Value comparison, not reference.** `syncFocusDomain` detects a real prop change by comparing
   `fd[0] !== prev[0] || fd[1] !== prev[1]`, not by reference identity. The original design said
   "by reference" but that creates an inline-literal footgun: a parent writing
   `<Trace focusDomain={[a, b]} />` generates a fresh array on every render, making every unrelated
   re-render yank the user's in-progress zoom back to the prop value.

2. **Focus-extent-relative position metric.** The echo-guard's position term is
   `|a[0] - prev[0]| / aExtent` (fraction of the **current visible window**), not a fraction of the
   full reference domain. At deep zoom the visible window is a tiny slice of the full domain; using
   the reference extent would suppress every visible pan because the pixel-significant shift is still
   sub-epsilon of the full domain. The focus-extent-relative metric scales with zoom depth.

3. **Pre-seed on prop application.** When `syncFocusDomain` applies a controlled `focusDomain`, it
   sets `lastFiredDomain = fd` **before** starting the ease animation. Without pre-seeding, the
   ease settle fires `onFocusDomainChange` with the value the parent just sent — a confirming echo
   that would trigger an immediate round-trip prop update and restart the tween.
