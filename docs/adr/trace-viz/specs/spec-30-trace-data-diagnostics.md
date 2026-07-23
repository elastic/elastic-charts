---
status: provisional
domain: trace-viz
owners: []
supersedes: []
---

# Trace data diagnostics — behavioral spec

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

## Summary

A Trace chart may report a structured diagnostics snapshot for the prepared trace data it is about to
render. The report lets applications explain malformed, corrected, omitted, or invalid trace input
without scraping developer warnings or inferring from blank output.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `TraceDataDiagnostics` | type | Structured report describing trace data issues found while preparing visible Trace output. |
| `TraceDataDiagnosticIssue` | type | One issue with kind, severity, scope, count, bounded examples, and related span or trace metadata. |
| `TraceDataDiagnosticKind` | type | Closed exported union of supported diagnostic issue kinds. |
| `TraceDataDiagnosticSeverity` | type | `'info' | 'warning' | 'error'`; distinguishes corrections, recoverable omissions, and invalidating issues. |
| `TraceDataDiagnosticScope` | type | `'chart' | 'trace' | 'span' | 'badge' | 'annotation' | 'reference'`; identifies the level affected by one issue. |
| `TraceDataDiagnosticSummary` | type | Derived issue counts by kind and severity for callouts and telemetry. |
| `TraceSpec.onDataDiagnosticsChange` | prop | Receives the latest diagnostics report when prepared trace-data diagnostics change. |

## Behavior & acceptance

- Charts computes `TraceDataDiagnostics` from the same prepared trace data that drives visible output,
  tooltip metadata, screen-reader rows, and interaction metadata. The report describes the data
  Charts actually considered for rendering, not a separate best-effort parse.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"reports diagnostics from prepared trace data"}
- `onDataDiagnosticsChange` is data-change driven, not frame driven. Charts calls it after trace data
  preparation and before committing visual output for that prepared data, but only when the
  diagnostic report's content changes. Zooming, panning, and animation frames do not re-emit an
  unchanged report. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"does not emit diagnostics on every frame"}
- `onDataDiagnosticsChange` is not invoked as a React render-phase side effect. Consumers may update
  application state from the callback without triggering render-phase update warnings.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"does not emit diagnostics during render"}
- Clean prepared data emits an empty diagnostics report. This lets consumers clear previously shown
  diagnostics without inferring from absence of a callback.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"emits an empty diagnostics report for clean data"}
- The report includes issues owned by existing Trace preparation behavior: clock-skew corrections,
  invalid or omitted trace groups, duplicate span ids, root election, disconnected or rootless
  components, cycles, discarded non-finite spans or intervals, unresolved span references, Span
  badge structural issues, and Trace annotation structural issues. {story:traceDataDiagnostics}
- Diagnostics include non-fatal corrections as well as invalid or omitted data. `info` describes
  successful corrections or noteworthy recoveries, `warning` describes recoverable omissions or
  degraded semantics, and `error` describes data issues that invalidate a trace group or the selected
  combined result. {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"classifies diagnostics by severity"}
- `TraceDataDiagnostics.issues` is the canonical diagnostics surface. Each issue carries a kind,
  severity, stable issue identity, bounded examples, and any related trace or span metadata. The
  report may also expose a `summary` with derived counts by kind and severity, but consumers should
  not need separate top-level arrays for each issue kind.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"returns a canonical flat diagnostics issue list"}
- Diagnostic issues expose stable machine-readable fields for application presentation. V1 does not
  include localized or user-facing prose messages; applications own user-visible copy, grouping, and
  remediation text. {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"diagnostics contain machine-readable issue fields"}
- `TraceDataDiagnosticKind` is a closed exported union. New diagnostic kinds may be added
  deliberately as the Trace diagnostics surface expands, but arbitrary string kinds are not accepted
  in v1. {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"diagnostic kind is a closed union"}
- Every diagnostic issue declares a `scope` of `'chart'`, `'trace'`, `'span'`, `'badge'`,
  `'annotation'`, or `'reference'`. Scope tells consumers what level the issue affects without
  requiring them to decode the issue kind. {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"diagnostics declare issue scope"}
- Diagnostic issues report total occurrence `count` and bounded stable `examples`, not exhaustive
  occurrence lists. The report gives applications enough detail to explain and debug issues without
  becoming a second copy of large trace input.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"diagnostics bound occurrence examples"}
- The number of examples retained per issue is a library-defined bound, not public configuration in
  v1. Consumers can rely on examples being present when available and bounded for large malformed
  input, but cannot request an exhaustive diagnostic payload.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"uses a library-defined diagnostics example cap"}
- Span badge diagnostics are part of the same report as core trace-data diagnostics. Consumers do not
  receive a badge-specific diagnostics callback. {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"includes badge issues in the trace diagnostics report"}
- Diagnostics are the default application-facing channel for trace-data issues. Developer logs remain
  scenario-owned: each diagnostic scenario must decide whether an additional bounded developer log is
  still useful for debugging, rather than treating logs as the primary reporting contract.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"diagnostics are the primary data issue channel"}
- Badge image loading failures are asynchronous resource failures, not prepared trace-data
  diagnostics. They stay out of `TraceDataDiagnostics`; the badge renders its failed-image
  placeholder and Charts emits a deduplicated developer warning for the failed image source.
  {test:packages/charts/src/chart_types/trace_chart/render/badge_images.test.ts#"image failures are not trace data diagnostics"}
- Duplicate span id issues are reported through diagnostics only. Once `TraceDataDiagnostics` exists,
  duplicate span ids do not also emit developer logs.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"duplicate span ids are diagnostics only"}
- Invalid or omitted trace groups from malformed topology are reported through diagnostics only.
  Their issue entries identify the affected scope, counts, and bounded examples; they do not also
  emit developer logs once `TraceDataDiagnostics` exists.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"invalid trace groups are diagnostics only"}
- Clock skew corrections are reported through diagnostics only. Tooltip and screen-reader surfaces
  may still expose per-span correction notes, but the correction does not emit a developer log.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"clock skew corrections are diagnostics only"}
- Unresolved caller-supplied references, such as critical-path intervals or connections that point
  to missing span ids, are reported through diagnostics only. Issue examples identify the reference
  source category and bounded missing ids.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"unresolved caller references are diagnostics only"}
- Invalid Span badge structure from `badgeAccessor`, including duplicate badge ids, empty badges,
  non-string text, invalid visibility values, and image-only badges without `ariaLabel`, is reported
  through diagnostics only. Badge image loading failures are the separate asynchronous resource case.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"invalid badge structure is diagnostics only"}
- Invalid Trace annotation structure, including duplicate annotation ids or references to missing
  spans, is reported through diagnostics only.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"invalid trace annotation structure is diagnostics only"}

## Decisions

- No ADR yet. Create one only if report timing, shape, or ownership requires a hard-to-reverse trade-off.

## Non-goals

- **Per-frame diagnostics:** diagnostics explain prepared data, not transient viewport frames.
- **Kind-specific top-level buckets:** the canonical report is a flat issue list so new diagnostic
  kinds can be added without expanding the public shape sideways.
- **User-facing diagnostic prose:** applications own localized text and remediation guidance because
  the chart can expose facts but cannot know product-specific wording.
- **Exhaustive occurrence lists:** diagnostics use counts plus bounded examples so malformed large
  traces cannot turn the callback payload into another trace-sized data structure.
- **Image loading diagnostics:** badge image loading failures are not included in
  `TraceDataDiagnostics` because they are asynchronous resource failures rather than prepared
  trace-data issues.
