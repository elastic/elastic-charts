# ADR 0032 — Trace data diagnostics: component-owned report, RAF-pipeline emission, and log migration

**Status:** Accepted  
**Implements:** Spec 28 — Trace data diagnostics  
**Relates to:** [ADR 0026](./0026-collapsible-nesting.md) (RAF pipeline / memoization), [ADR 0007](./0007-focus-domain-perform-and-fire.md) (content-guarded emission), [ADR 0027](./0027-span-id-uniqueness.md) and [ADR 0028](./0028-partial-trace-synthetic-parentage.md) (the malformations being reported)

## Context

The Trace chart already recovers from and reports malformed input — cross-trace duplicate span ids
([ADR 0027](./0027-span-id-uniqueness.md)), partial-trace reparenting/omission
([ADR 0028](./0028-partial-trace-synthetic-parentage.md)), clock-skew correction
([ADR 0022](./0022-clock-skew-heuristic.md)), and non-finite drops — but until Spec 28 the only
observability channel for these was `Logger.warn`. Developer-console warnings are not an application
surface: a consuming app cannot render a "3 spans dropped" banner by scraping `console.warn`.

Spec 27 already introduced an internal `TraceDiagnosticsCollector` for Span-badge issues, kept
private. Spec 28 promotes that collector's types to a public `TraceDataDiagnostics` report, extends it
to the core trace-data malformations, and delivers it through a new `TraceSpec.onDataDiagnosticsChange`
callback.

Two questions drove the non-obvious decisions: **who computes and owns the report**, and **when is it
emitted** so it explains prepared data without becoming a per-frame side effect or a render-phase
update.

## Decision

### 1. The report is component-owned and rides the pipeline the component already runs

A report can only be produced by *running* trace-data preparation (normalize + `resolveSpanBadges`) —
the collector is filled as a side channel of that work. The component already runs this once per
prepared-data change inside its memoized `getPipeline`. So a single `TraceDiagnosticsCollector` is
created there and threaded through both `normalize` and `resolveSpanBadges`, giving one report that
covers core trace-data issues *and* badge issues.

**Rejected alternative — a Redux selector.** Modeling diagnostics as a memoized Redux selector (like
the screen-reader data selector, [ADR 0013](./0013-sr-data-second-redux-selector.md)) would require a
selector to run its own preparation pass to fill a collector. Combined with the component's
`getPipeline` and the existing SR selector, that is a **third** full `normalize` pass over the same
data. The collector-rides-the-existing-pipeline approach keeps it at two passes (component +
SR selector) and guarantees the report describes exactly the spans the component rendered.

### 2. `getPipeline` stays pure; emission happens in `frame()`, content-guarded

`getPipeline` is a pure memoizer — the report and a precomputed content key (`JSON.stringify` of the
issues, deterministic because issue order is first-occurrence) are stored on the cached result. It has
**no** side effects, so calling it from `render()`-adjacent paths (tooltip rebuild, selection pruning)
never emits.

`onDataDiagnosticsChange` fires from a content-guarded helper called in the RAF `frame()` right after
`getPipeline`, mirroring the `onFocusDomainChange` / `onSelectionChange` echo-guard pattern
([ADR 0007](./0007-focus-domain-perform-and-fire.md)): the helper compares the report's key to the
last-fired key and, when different, updates the key **before** invoking the callback (re-entrant-safe)
and calls out. This yields the Spec 28 contract:

- **Not per-frame:** trace zoom/pan/focus-domain are component-instance state, not Redux, so viewport
  frames are `getPipeline` cache hits with an unchanged key → suppressed.
- **Data-change driven:** a new prepared-data/spec input is a cache miss → new key → one emission.
- **Not a render-phase side effect:** emission is in the RAF loop, never in `render()`.
- **First clean report emits once:** the last-fired key initializes to `null`, so the first mount
  frame fires even for an empty (`{ issues: [] }`) report, letting consumers clear stale diagnostics
  UI for freshly-prepared clean data.

### 3. "Diagnostics only" developer logs are migrated; scenario-owned logs are kept

Only the logs Spec 28 marks as superseded were removed and replaced by diagnostics:

- **Removed → diagnostics:** partial-trace recovery aggregated warning and cross-trace-duplicate
  warning (`recoverPartialTraces`); clock-skew negative-duration warning (`correctClockSkew`).
- **Kept (also emits a diagnostic):** the non-finite drop `Logger.warn` in `dropNonFinite` — non-finite
  input is a data-source failure worth a console line, so the log stays *and* a
  `span_non_finite_dropped` diagnostic is added.
- **Kept (no diagnostic):** the `selectTrace` `traceId`-not-found and multi-trace-combined warnings.
  Per [CONTEXT.md](../../../CONTEXT.md), `trace-not-found` is an **Empty state** and combined
  multi-trace is a valid explicit mode — neither is a malformation, so neither becomes a diagnostic.

### 4. Deferred scope stays forward-compatible

Annotation and connection diagnostics are out of scope until those features land, but
`TraceDataDiagnosticScope` keeps `'annotation'` and `'reference'` in its union so adding those kinds
later is not a breaking change. `TraceDataDiagnostics` is issues-only in v1 (no derived summary
object); consumers derive counts from `issues`.

## Consequences

- **Known limitation — the `no-data` empty state does not emit.** When `data: []`, the trace canvas
  does not mount (`isChartEmpty` → the library `NoResults` overlay, [ADR 0019](./0019-empty-state-ownership.md)),
  so `frame()` never runs and no empty report fires. `onDataDiagnosticsChange` therefore clears only
  for *clean prepared* data (valid, non-empty, no issues), which matches "diagnostics explain prepared
  data." Consumers that need to reset UI on a switch to no-data should key off their own `data` prop.
- **Orphan reparenting is now surfaced as `info`.** Lossless reparenting was silent before Spec 28
  ([ADR 0028](./0028-partial-trace-synthetic-parentage.md)); it now emits `span_reparented` because
  Spec 28 defines `info` as "successful corrections or noteworthy recoveries." This is an intentional
  observability increase, not a behavior change to the rendered output.
- **Public callback contract.** `onDataDiagnosticsChange` and the `TraceDataDiagnostics*` types are
  now part of the public API surface (`charts.api.md` + the generated intro API table,
  [ADR 0025](./0025-api-docs-in-place-patch.md)); changing the emission timing or report shape later
  is a breaking change.
- **Two-pass cost is unchanged.** No additional preparation pass was added; the collector is a side
  channel of the pass the component already ran.
