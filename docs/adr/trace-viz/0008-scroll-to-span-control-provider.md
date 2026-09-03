# ADR 0008 — Scroll-to-span uses controlProviderCallback

**Status:** Accepted (amended — the `TraceSearchProvider` / `useTraceSearch` context sugar was removed before release).

Programmatic scroll-to-span uses an imperative registration pattern (as in the Flame chart): the
`Trace` spec accepts `controlProviderCallback?: (callbacks: TraceControlCallbacks) => void`. On
mount (and whenever the prop reference changes), the chart calls this function with its live
`TraceControlCallbacks` object. The caller stores whatever callbacks it needs and calls them later.
This is an imperative registration, not a prop command, so re-triggering the same span id works
without workarounds. `controlProviderCallback` stays because the spec/render split (the `<Trace>`
element is a spec, not the rendering component) makes a conventional imperative `<Trace>` ref
impossible — consistent with Flame.

Note on the Flame chart's shape: Flame uses a per-control inversion-of-control shape
(`Partial<ControlReceiverCallbacks>`) where each member receives one control function. Trace uses
the simpler *bundle* shape where the chart hands the whole `TraceControlCallbacks` object at once.
Trace has a single control (`scrollToSpan`), so the per-control indirection would be pure ceremony.

## Amendment: the `TraceSearchProvider` context sugar was removed

The original decision also shipped a `TraceSearchProvider` React context and a `useTraceSearch()`
hook that wrapped this mechanism, holding the ref to `scrollToSpan` and exposing it to descendants
without prop threading. It was removed from the public API before release: it is a five-line
`useRef` wrapper that every app can (and, in its shapes, would) write differently, it added two
public exports (and an `ae-forgotten-export` for its context value type) for no capability the raw
`controlProviderCallback` lacks, and holding chart controls is idiomatic React that needs no library
primitive. The scroll-to-lane story now stores the callbacks in a plain `useRef`. Consumers wanting
the old ergonomics can reintroduce an identical provider in their own code in a few lines.

A `focusSpanId` prop was considered and rejected: prop diffing means the same id passed twice does
not re-trigger the scroll. A ref method on the `Chart` component was also considered but rejected
because elastic-charts does not expose chart-type-specific methods on the generic `Chart` ref.
