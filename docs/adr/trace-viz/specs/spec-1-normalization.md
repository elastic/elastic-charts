# Spec 1 — Input normalization (simple + OTel)

**Goal:** turn either input format into `NormalizedSpan[]`, carrying an explicit `active` through
when the simple format supplies one, else empty for [Spec 2](./spec-2-self-time.md) to derive.

**Identity contract:** `TraceDatum.id` is unique across the complete input array, including combined
multi-trace data. Spec 1's base transform retains malformed duplicates defensively. From Spec 26,
reachable same-group duplicates invalidate that trace group and cross-trace duplicates invalidate
the selected combined result; duplicates in unreachable components may be omitted. See
[ADR 0027](../0027-span-id-uniqueness.md) and
[ADR 0028](../0028-partial-trace-synthetic-parentage.md).

**Depends on:** [Spec 0](./spec-0-scaffolding.md) (types), agreement on `NormalizedSpan` below.

See [ADR 0002](../0002-single-normalized-span-dual-input.md) for why two input formats normalize to one shape.

## Files

- `chart_types/trace_chart/data/types.ts` — `OtelSpan`, `OtlpEnvelope`, `OtelInput`, `NormalizedSpan`.
- `chart_types/trace_chart/data/normalize.ts` — the normalization pipeline.

## Contract

```ts
interface NormalizedSpan {
  id: string; name: string; parentId?: string; traceId?: string;
  start: number; end: number;                  // ms: epoch (time) or relative-from-t0 (linear)
  active: { start: number; end: number }[];    // copied from TraceDatum.active if supplied (simple
                                                // format only); else empty, resolved in Spec 2
  color?: Color;
  meta: TraceDatum | OtelSpan;                 // original datum, for custom tooltip / element callbacks
}

function normalize(
  data: TraceDatum[] | OtelInput,
  format: 'simple' | 'otel',
  xScaleType: 'time' | 'linear',
  traceId?: string,
): { spans: NormalizedSpan[]; domain: { min: number; max: number } };
```

## Steps

1. **Parse** to a flat span list:
   - `'simple'` → map `TraceDatum` fields, `meta = datum`; copy `TraceDatum.active` verbatim if
     supplied (OTel spans carry no such field — Spec 2 always derives for them, per ADR 0003).
   - `'otel'` → if the OTLP envelope shape (`{ resourceSpans: [{ scopeSpans: [{ spans: OtelSpan[] }] }] }`)
     is present, flatten it; otherwise treat the input as a flat `OtelSpan[]`. Map `spanId → id`,
     `parentSpanId → parentId`, `traceId`, `name`; `startTimeUnixNano`/`endTimeUnixNano` → `start`/`end`
     via a `nanoToMs` helper accepting `string | number | bigint` (OTLP JSON emits nanos as strings);
     `meta = otelSpan` (retains `attributes`/`status`/`kind` for later use).
2. **Trace selection.** If `traceId` is given, keep only spans with that `traceId`. If omitted and more
   than one distinct `traceId` is present, emit a dev-mode `Logger.warn` and keep all spans.
3. **Domain.** Compute `{ min: minStart, max: maxEnd }` across the kept spans. For `xScaleType:'linear'`,
   subtract `min` from every `start`/`end` **and from every copied `active` segment's `start`/`end`**
   (relative elapsed ms) and re-zero the domain to `[0, max-min]`; for `'time'`, keep epoch ms.
4. Any span without a copied `active` gets `[]` — Spec 2 derives it.

## Storybook

`storybook/stories/trace/01_normalize_debug.story.tsx` — a debug/inspector story that runs `normalize`
on both a simple and an OTel fixture and renders the resulting `NormalizedSpan[]` as a table (no chart
yet); the two tables must match structurally. Superseded by visual stories once the renderer lands.

## Tests

`data/normalize.test.ts` — envelope flatten, flat OTel array, `nanoToMs` across string/number/bigint,
`parentSpanId → parentId`, `traceId` filter, multi-trace dev-warn, linear re-zero vs. time epoch, `meta`
retention, empty input; simple-format explicit `active` copied through and re-zeroed identically to its
span's own `start`/`end` under `xScaleType:'linear'`; OTel input always yields empty `active`.

## Review (`/review-claudio`)

Parser types (`satisfies` the OTLP shape, no `as`), bigint/precision handling, complete OTel fixtures
(not half-mocked), input-validation/security of untrusted payloads.

## Acceptance

Tests green; the debug story shows identical normalized output for simple vs. OTel; review findings addressed.
