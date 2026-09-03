# Trace chart takes a single input format; OTel is consumed via a `fromOtlp` adapter

**Status:** accepted (supersedes [0002](./0002-single-normalized-span-dual-input.md))

`<Trace>` ingests exactly one shape — `data: TraceDatum[]` — with no `format` discriminant.
OpenTelemetry remains the primary real-world source, but it is treated as a *data detail at the
application edge*, not a first-class input format: a standalone, `@public` `fromOtlp(OtelInput):
TraceDatum[]` adapter converts an OTLP envelope or flat `OtelSpan[]` to `TraceDatum[]`, carrying the
original span on `datum.meta`. The chart knows nothing about OTLP; `fromOtlp` is an edge utility
that can be versioned and extended without touching the chart.

```tsx
// Before (0002):
<Trace data={otlpEnvelope} format="otel" xScaleType="time" />

// After (0005):
<Trace data={fromOtlp(otlpEnvelope)} xScaleType="time" />
// datum.meta is the OtelSpan — available in customTooltip and onElement* callbacks.
```

## Why this supersedes 0002

ADR 0002 chose an explicit `format: 'simple' | 'otel'` discriminated union to avoid shape-sniffing
and keep the internal pipeline format-agnostic. That goal is preserved — normalization still targets
one `NormalizedSpan` shape — but the *public* union proved costly in three ways:

1. **Unlike every other chart spec.** `BarSeries`, `Partition`, `Flame`, `Metric`, `Timeslip` all
   ingest via `data` + accessors over a generic `Datum`; none use a tagged union on a `format`
   literal. A consumer who knows the library had to learn a brand-new mental model.

2. **Forced a `@ts-ignore` in the public spec factory.** Spreading a discriminated union loses the
   discriminant in TypeScript's inference; the Trace constructor was the only chart factory in the
   library to carry a `@ts-ignore`. Under the new design `TraceSpec` is a plain interface and the
   suppression disappears.

3. **Pulled an external wire spec (OTLP) into the library's public types where it was only
   half-modelled.** `OtelSpan.attributes.value` was typed `unknown` but real OTLP JSON encodes
   attribute values as `AnyValue` objects (`{ stringValue }`, `{ intValue }`, …). The existing story
   faked attributes with primitive values. Moving OTLP to a dedicated adapter lets it track the OTLP
   specification independently of the chart; the `AnyValue` complexity now lives at the adapter
   boundary, where it belongs.

## Additional consequences

- **Unified tooltip/event datum.** The previous design exposed `NormalizedSpan` (an `@internal` type)
  as the tooltip `values[0].datum`, while element events exposed the original datum. Under the new
  design both expose the same `TraceDatum`, and source-specific data (e.g. OTel `attributes`) is
  reached uniformly via `datum.meta`.
- **`TraceDatum.meta?: unknown`.** An opaque passthrough field on the public datum lets any source
  carry original-record context. `fromOtlp` sets `meta: OtelSpan`; callers using the simple format
  can set `meta` to any value for their own tooltip/event handling. A fully typed generic
  `TraceDatum<Meta>` is a possible future step but was deferred — the generic would thread `Meta`
  through `TraceElementEvent` and the spec factory, a larger surface increase than the need justified.

## Trade-off accepted

Consumers with OTLP data now call `fromOtlp(...)` explicitly rather than passing `format="otel"`.
This one extra call at the boundary is the price for a smaller, more consistent, and more type-safe
public surface. Transform-at-the-edge is already the library's model; this change aligns the Trace
chart with it.
