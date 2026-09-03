# ADR 0006 — `colorBy` accepts a function or an explicit descriptor; no bare string shorthand

**Status:** Accepted (amended — a value-compared descriptor union was added before release; the bare-string shorthand is still rejected).

`TraceSpec.colorBy` accepts either a function `(datum: TraceDatum) => string | undefined`
(`TraceColorAccessor`) or an explicit declarative descriptor (`TraceColorByDescriptor`):
`{ otelAttribute: string }` or `{ otelKind: true }`.

## The bare string was, and stays, rejected

A `string | function` union (e.g. `colorBy="service.name"`) was considered and rejected: a bare
string key would need to resolve against `TraceDatum.meta`, but `meta` is typed `unknown` and
resource attributes require an explicit cast that varies by OTel vs simple format in non-obvious
ways. A bare `"service.name"` gives no hint that it means "an OTel attribute, span-level then
resource-level" rather than a field on the datum.

## Amendment: an explicit descriptor union

The descriptor form answers the ambiguity objection while removing real consumer friction. It is
**explicit** about where it looks — `{ otelAttribute: 'service.name' }` names the mechanism, unlike a
bare string — and it is **compared by value** inside the pipeline cache
(`traceColorByEqual`) and resolved to the matching helper by `resolveTraceColorBy`. That value
comparison is the key ergonomic win: an inline literal `colorBy={{ otelAttribute: 'service.name' }}`
is stable across renders and does not rebuild the color map, whereas an inline
`colorBy={colorByOtelAttribute('service.name')}` (a fresh function each render) would. Consumers no
longer need to hoist a `BY_SERVICE` module const purely to keep the reference stable — the common
OTel cases are now safe inline.

The function form (and the named `colorByOtelAttribute` / `colorByOtelKind` helpers, which return
one) remains for custom grouping logic. Functions are still compared by reference, so a **custom**
accessor must still be a stable/memoized reference.
