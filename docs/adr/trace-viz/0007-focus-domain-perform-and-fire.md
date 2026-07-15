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
