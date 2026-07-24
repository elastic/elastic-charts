# ADR 0008 — Scroll-to-span uses controlProviderCallback + TraceSearchProvider

Programmatic scroll-to-span uses an imperative registration pattern (as in the Flame chart): the
`Trace` spec accepts `controlProviderCallback?: (callbacks: TraceControlCallbacks) => void`. On
mount (and whenever the prop reference changes), the chart calls this function with its live
`TraceControlCallbacks` object. The caller stores whatever callbacks it needs and calls them later.
This is an imperative registration, not a prop command, so re-triggering the same span id works
without workarounds.

Note on the Flame chart's shape: Flame uses a per-control inversion-of-control shape
(`Partial<ControlReceiverCallbacks>`) where each member receives one control function. Trace uses
the simpler *bundle* shape where the chart hands the whole `TraceControlCallbacks` object at once.
Trace has a single control (`scrollToSpan`), so the per-control indirection would be pure ceremony.

A `TraceSearchProvider` React context and `useTraceSearch()` hook wrap this mechanism for convenience:
the provider holds the ref to `scrollToSpan` and exposes it to any descendant (e.g. an external search
box) without prop threading. This is the pattern demonstrated in the scroll-to-lane story.

A `focusSpanId` prop was considered and rejected: prop diffing means the same id passed twice does
not re-trigger the scroll. A ref method on the `Chart` component was also considered but rejected
because elastic-charts does not expose chart-type-specific methods on the generic `Chart` ref.
