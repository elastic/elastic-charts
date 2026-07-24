---
status: accepted
domain: trace-viz
owners: []
supersedes: []
---

# Spec 30 — Running spans (in-progress visualization)

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

## Summary

A Trace chart may include **running spans** — spans that have started but not yet finished. A running
span is expressed by omitting `TraceDatum.end` (or passing `null`); it renders from its `start` to
the trace's latest known finite boundary with a dashed total-duration line, and its tooltip and
screen-reader surface report a **"running"** state with no duration number. The chart gains no
wall-clock dependency: the running edge is a deterministic function of the supplied data, not of the
current time.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `TraceDatum.end` | prop | Optional end time in the same units as `start`; omit or pass `null` to mark the span as running. |
| `TraceSelectionDetail.duration` | field | `number \| null`; `null` for a running span (its extent is provisional, not a measurement). |
| `TraceElementEvent.duration` | field | `number \| null`; `null` for a running span. |
| `theme.trace.runningLineDash` | theme token | Dash pattern for a running span's total-duration line. |

## Behavior & acceptance

- A span supplied without an `end` (or with `end: null`) is a running span. It renders from its
  `start` to the trace's latest known finite boundary using a dashed total-duration line, alongside
  completed sibling spans. {story:runningSpans}
- The running edge is the trace's domain max: the latest of completed-span ends, running-span starts,
  and the ends of explicitly supplied active segments on running spans. It never depends on the wall
  clock. {test:packages/charts/src/chart_types/trace_chart/data/normalize.test.ts#"running span extends to the latest known finite boundary"}
- A finite active-segment end on a running span extends the domain so confirmed activity is never
  clipped by a boundary derived only from siblings.
  {test:packages/charts/src/chart_types/trace_chart/data/normalize.test.ts#"running active segment end extends the domain"}
- `end: 0` is a completed span ending at the Unix epoch, not a running span; only omitted or `null`
  ends are running. {test:packages/charts/src/chart_types/trace_chart/data/normalize.test.ts#"end of zero is not treated as running"}
- When every span is running, the edge is the latest span start (or latest explicit active-segment
  end). The latest-starting span renders as a zero-width point marker when no later confirmed
  activity extends the boundary; the marker changes no domain value and implies no duration.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"zero-width running span renders a point marker"}
- A running span never fabricates self-time up to its provisional edge; any explicitly supplied
  active segments are preserved and drawn solid as confirmed execution.
  {test:packages/charts/src/chart_types/trace_chart/data/self_time.test.ts#"running span does not fabricate self-time"}
- OpenTelemetry input signals a running span with a semantic-zero `endTimeUnixNano` (`0`, `'0'`, or
  `0n`); `fromOtlp` maps it to a running span, while a positive `endTimeUnixNano` yields a completed
  span. {test:packages/charts/src/chart_types/trace_chart/data/otel_adapter.test.ts#"semantic-zero end maps to running"}
- The tooltip for a running span shows **Status: Running** in place of a numeric total duration, and
  never a provisional elapsed-time value. Durations for explicitly supplied active segments remain
  visible. {test:packages/charts/src/chart_types/trace_chart/render/tooltip.test.ts#"running span shows running status without duration"}
- The part of a running span's extent not covered by an explicit active segment is a **Provisional
  region**, not waiting time. It reports **State: Provisional** with no segment duration or offset,
  and selecting it selects the whole span.
  {test:packages/charts/src/chart_types/trace_chart/render/picking.test.ts#"uncovered running extent is provisional"}
- A collapsed running parent keeps whole-span collapsed semantics: it reports **State: Collapsed**
  while **Status: Running** still communicates lifecycle.
  {test:packages/charts/src/chart_types/trace_chart/render/picking.test.ts#"collapsed running parent keeps collapsed region"}
- The screen-reader surface announces a running span as "running" — in its total-duration cell and in
  keyboard/search aria-live announcements — instead of a formatted millisecond value.
  {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"announces running spans as running"}
- Selection and element events for a running span emit `duration: null`; the reported numeric `end`
  is the provisional domain boundary rather than a completion timestamp.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"running span events report null duration"}
- Clock-skew correction runs before the running edge is synthesized. An edge involving a running
  participant cannot originate correction: the running span keeps its recorded start, is not
  translated, is not marked as skew-corrected, and its structural children are not reparented. A
  deeper edge whose participants are both completed is evaluated independently.
  {test:packages/charts/src/chart_types/trace_chart/data/normalize.test.ts#"running span does not originate clock-skew correction"}
- Traces with no running spans render identically to today; adding running spans introduces no
  continuous animation loop and no wall-clock read.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"completed spans render without dashed lines"}

## Decisions

- [ADR 0023 — Running-span model: optional end, domain-max provisional edge, dashed visual](../0023-running-span-model.md)
- [ADR 0004 — Self-managed RAF render loop & the zoom-eases / pan-1:1 interaction model](../0004-raf-render-loop-and-interaction-model.md): the running edge stays clock-free so the RAF loop keeps self-terminating for static data.

## Non-goals

- **Wall-clock / live-updating bar:** a `now` prop or `Date.now()` edge would add a public field and
  a continuous RAF loop; the deterministic domain-max edge keeps rendering repeatable.
- **Public provisional-segment identity:** the uncovered running extent selects the whole span
  because it has no measured segment boundaries to address.
- **Aggregate self-time semantics for running spans:** this spec only prevents fabricated self-time;
  it does not widen existing public self-time fields.
- **Partial-trace recovery membership:** running-end synthesis stays compatible with Spec 26 but does
  not implement recovery here.
- **Elapsed-time readouts for running spans:** the provisional extent is not a measurement, so it is
  never surfaced as a duration in the tooltip, screen reader, or events.
