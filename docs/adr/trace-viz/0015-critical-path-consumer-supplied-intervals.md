# ADR 0015 — Critical path is consumer-supplied, interval-precise

**Status:** Accepted (Spec 22)

## Context

Spec 22 adds visual critical-path highlighting to the trace waterfall: a colored line along the
bottom edge of the lanes whose spans lie on the critical path. "Critical path" means the chain of
span portions that gated the trace's total duration — the concept is well-established in APM tooling
(Kibana's waterfall has a "Show critical path" toggle for it).

Three non-obvious decisions were made here.

## Decision 1: Consumer-supplied, not computed in-component

The chart does **not** compute the critical path from the span tree. The `criticalPath` prop carries
explicit `{spanId, start, end}` intervals supplied by the consumer.

**Why:** the critical-path algorithm is domain-specific. For a distributed trace the definition
depends on whether you count clock-skew corrections, network latency attribution, and concurrent
children — different APM backends answer these differently. A consumer-computed or backend-computed
path is the only authoritative source. Baking an algorithm into the chart would produce a silently
wrong result for any topology the built-in algorithm doesn't model correctly.

**Rejected: `showCriticalPath: boolean` that triggers an in-component walk.** A boolean forces the
chart to invent an algorithm and quietly disagree with the backend. Also ignores the sub-segment
precision requirement (see Decision 2).

## Decision 2: Interval-precise, not span-granular

Each `TraceCriticalInterval` carries explicit `start`/`end` times, not merely a `spanId`. A critical
portion can cover only a **sub-range of one active segment** — e.g. the last 30 ms of a 200 ms
segment if that's when the child is blocked on an external call. Span-granular marking (a boolean on
`TraceDatum`) would force the chart to highlight the full span when only part of it is on the
critical path.

## Decision 3: Re-zero lives in `project()`, not in `buildGeometry`

In `'linear'` x-scale mode, `project()` ([normalize.ts](../../packages/charts/src/chart_types/trace_chart/data/normalize.ts))
re-zeros all timestamps by `- domainMin`. By the time `buildGeometry` runs, `domain.min` is 0 and
the original offset is lost. Critical intervals carry raw consumer times (same units as
`TraceDatum.start/end`), so they **must be re-zeroed and clamped to their span's projected
`[start, end]`** inside the normalize pipeline, alongside `activeSegments`. Placing this transform in
`buildGeometry` would require threading the pre-projection `domainMin` backwards — a leaky abstraction
that touches the frozen `draw(ctx, geom, style)` contract (ADR 0001). Connections (Spec 23), by
contrast, anchor to `TraceSegmentRef` and resolve against already-projected `NormalizedSpan` data, so
they need no re-zero at all.
