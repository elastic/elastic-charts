# ADR 0015 — Critical path is consumer-supplied, interval-precise

**Status:** Accepted (Spec 22)

## Context

Spec 22 adds visual critical-path highlighting to the trace waterfall: a colored line along the
bottom edge of the lanes whose spans lie on the critical path. "Critical path" means the chain of
span portions that gated the trace's total duration — the concept is well-established in APM tooling
(Kibana's waterfall has a "Show critical path" toggle for it).

Six non-obvious decisions were made here.

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
portion covers a **sub-range of a span's `[start, end]` extent — it may fall in a waiting region**
(time the span was blocked on a child or external call) as well as in an active segment. For example,
the root span's "checkout waiting gap" — the time between the last child returning and the root
completing — is waiting time, not active time, yet it is still on the critical path. Span-granular
marking (a boolean on `TraceDatum`) would force the chart to highlight the full span when only part
of it is on the critical path, and would silently misplace waiting-region intervals.

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

## Decision 4: Critical intervals roll up onto collapsed parents (Spec 21 interaction)

When a parent lane is collapsed (ADR 0026), its descendant spans are removed from the visible lane
set. A critical interval whose `spanId` refers to a hidden descendant must not silently disappear —
it is part of the critical path and carries meaning about what made the collapsed subtree slow.

**Decision:** critical intervals are **rolled up onto the outermost visible collapsed ancestor**,
mirroring how `collapseLanes` rolls up active segments. The rolled-up intervals are clamped to the
ancestor's `[start, end]`, and overlapping intervals are `mergeSegments`-merged so the collapsed lane
shows the union without double-drawing. The **outermost visible collapsed ancestor** owns the rollup
(consistent with `collapseLanes` — if an inner collapse is nested inside an outer collapse, the
outer wins). Expanding the parent restores per-lane rendering (intervals revert to their original
`spanId` after `rollupCriticalIntervals` is a no-op when `collapsedSpanIds` is empty).

**Implementation:** `rollupCriticalIntervals(orderedSpans, collapsedSpanIds, criticalIntervals)` in
`data/collapse.ts` re-uses `buildChildrenMap` and `mergeSegments` from `self_time.ts`. It is called
in the same memoized collapse post-step as `collapseLanes` in `trace_chart.tsx`
(`getCollapseOutput`). The `collapseCache` key is extended with a `criticalIntervals` reference so
a change to `criticalPath` invalidates the rollup even if the spans and collapsed set are unchanged.

**Rejected alternative — drop while collapsed:** simpler (no extra function), but silently hides
critical-path information when the user collapses a subtree. The user collapsing a subtree is an
information-density choice, not a "hide the critical path" intent. A rolled-up line gives the visual
cue that the collapsed portion is on the critical path without revealing its internal structure.

**Rejected alternative — re-map spanId only, no merge:** re-keys hidden intervals to the ancestor
without merging, producing potentially many overlapping line draws over the same pixel range. Uses the
same draw calls as merge but is semantically weaker; `mergeSegments` is already available and cheap.

**Implementation subtlety — outermost-ancestor ownership under nested collapse:** when building the
`hiddenToOwner` map, the loop must skip collapsed spans that are themselves already hidden (i.e.
already in `hiddenToOwner`). Without this guard, iterating inner collapsed spans after their outer
ancestor would overwrite the grandchild mapping: `grandchild → root` becomes `grandchild → child`,
breaking the outermost-ancestor invariant.

## Decision 5: Tooltip shows total critical-path coverage for the hovered lane

When the hovered lane has critical intervals (post-rollup), the default tooltip appends a
**"Critical path"** row showing the total coverage for that lane — the sum of all critical-interval
durations attributed to the lane, formatted via `formatMs`. The row is absent when the lane has no
critical intervals (consistent with `presence-is-toggle`: if `criticalPath` is absent, no intervals
reach the tooltip).

**Why total coverage, not per-interval rows:** a collapsed lane may have many rolled-up intervals
(one per hidden descendant). Listing each would flood the tooltip. The sum gives the user a
meaningful "how much of this span is on the critical path?" answer at a glance. A `customTooltip`
can access raw `criticalIntervalsByLane` via the geometry if per-interval detail is needed.

**Implementation:** `buildTraceTooltipInfo` in `render/tooltip.ts` gains an optional
`criticalIntervals?: ReadonlyArray<{ start; end }>` parameter. The caller (`rebuildTooltip` in
`trace_chart.tsx`) looks up `this.hover.lastGeom.criticalIntervalsByLane.get(laneIndex)` and passes
it through. No new state, no new events.

**Rejected — "Yes / No" boolean row:** gives no quantitative info; not actionable for the user.

**Rejected — per-interval rows:** bloats the tooltip for collapsed lanes with many rolled-up
intervals; the sum is both shorter and more meaningful.

## Decision 6: Visual configuration via `TraceStyle` theme tokens

The critical-path line is configured by two `TraceStyle` fields:

- `criticalPathColor: Color` — the stroke color of the line. Defaults to a red accent that is
  distinct from the span fill palette and distinguishable in both light and dark modes. Separate
  theme values are set for light (`#C61E25`) and dark (`#EE4C48`) mode variants.
- `criticalPathThickness: number` — stroke width in px, default `2`.

**Why theme tokens rather than a `Trace` prop:** all other visual properties of the trace waterfall
(activeSegmentColor, totalLineColor, laneHeight, …) live on `TraceStyle`. A prop would be a special
case that mixes data-level concerns (the path itself, `criticalPath`) with presentation
(how thick/what color). Theme tokens also let consumers override the color globally from their
design-system theme without touching each chart instance.

**Why not inherit from `colorBy`:** `colorBy` groups spans by a data attribute and assigns a palette
color per group. The critical-path line is a single cross-cutting overlay that is independent of span
color; inheriting from `colorBy` would tie a presentation concern to a data concern.
