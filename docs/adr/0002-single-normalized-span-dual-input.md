# Trace chart accepts two input formats, normalized to one internal span shape

**Status:** accepted

`<Trace>` accepts either a simple `TraceDatum[]` or an OpenTelemetry OTLP payload (JSON envelope or a
flat span array), selected explicitly via a `format: 'simple' | 'otel'` prop rather than auto-detected
from shape. Both are converted, once, by `normalize()` into the same internal `NormalizedSpan[]`, so
every downstream stage (self-time derivation, geometry, rendering, picking) is format-agnostic and only
has to be written and tested once. OTLP support exists because traces most commonly arrive in that
format from APM/observability pipelines; requiring an explicit `format` avoids fragile shape-sniffing
and keeps the parse path simple to reason about and extend (a third format is one more branch in
`normalize()`, not a new pipeline).
