# ADR 0006 — `colorBy` is a function; no string shorthand

`TraceSpec.colorBy` accepts only a function `(datum: TraceDatum) => string | undefined`.
A `string | function` union was considered and rejected: a string key (e.g. `"service.name"`)
would need to resolve against `TraceDatum.meta`, but `meta` is typed `unknown` and resource
attributes require an explicit cast to `OtelSpan`, which varies by OTel vs simple format in
non-obvious ways. Common cases are instead covered by named helper functions
(`colorByOtelAttribute`, `colorByOtelKind`) that are explicit about where they look.
