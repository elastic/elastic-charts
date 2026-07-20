# ADR 0022 — Clock-skew correction: active centering heuristic

**Status:** Accepted (Spec 25)

## Context

Distributed traces are collected by separate processes (services, clients, intermediaries), each with
its own system clock. When those clocks are not synchronized, a child span's recorded `start` can
precede its parent's `start` — a temporal impossibility (a child cannot start before its parent calls
it). The effect on the waterfall is a child bar that extends to the **left** of its parent.

Before this ADR, the chart handled skew only **passively**:
- `gapSegments` in `data/self_time.ts` clamps child intervals to `[parentStart, parentEnd]` when
  computing self-time gaps, and falls back to the whole-parent interval when all children are outside
  the parent (code comment: "clock skew / bad data").
- `orderLanes` treats orphans (spans whose `parentId` is absent from the span set) as roots; orphaning
  is not triggered by skew alone (the `parentId` is valid).

Neither mechanism repositions the child — it still renders in the wrong place, and the waterfall's
promise that visual position equals relative start time is violated.

## Decision 1 — Active correction; always-on (no opt-in flag)

The correction runs **unconditionally**: whenever a child's recorded `start` precedes its parent's
(after the parent's own correction), the normalization pipeline shifts the child.

**Alternative considered — opt-in `clockSkewCorrection: boolean` flag:**
- Opt-in would preserve existing behavior for charts that have been running in production (no
  positional change for skewed data unless the prop is set).
- Rejected because: (1) skewed data always renders incorrectly without correction — there is no
  useful "leave the child outside its parent" behavior; (2) the user explicitly chose always-on;
  (3) opt-in creates two modes of truth that must both be tested and documented.

**Backward-compatibility note:** existing traces with clock-skewed children will render differently
after this change — corrected positions rather than skewed ones. This is intentional: the old
rendering was incorrect.

## Decision 2 — Centering heuristic: `delay = (parentDuration − childDuration) / 2`

The canonical heuristic for clock-skew correction is to assume that the **propagation latency** from
parent to child (the time the parent took to invoke the child) is symmetric: half of the "slack"
(the portion of the parent's duration that the child doesn't account for) is spent before the child
starts, and half after it ends.

```
delay = (parentDuration − childDuration) / 2
targetChildStart = parentStart + delay
offset = targetChildStart − childStart
```

This centers the child within the parent — the most conservative assumption when the true latency
is unknown.

**Alternative considered — snap-to-parent-start:**
`targetChildStart = parentStart` (zero delay assumed).
Rejected: snap-to-start assumes zero propagation latency, which is never true for a real RPC. The
centering heuristic is the established convention (used by Jaeger, Zipkin, and Kibana APM's clock-skew
correction) and was the user's explicit choice.

**Known limitation — `childDuration > parentDuration`:** when the child is longer than the parent
(also a data anomaly), `delay < 0`, and the corrected child still starts before the parent, overhanging
symmetrically on both sides. The heuristic is applied as-is; `gapSegments` continues to clamp the
overhang for self-time derivation. This case is documented in Spec 25 as an inherent limitation of the
formula.

## Decision 3 — Shift the entire subtree by one offset, preserving durations

The same `offset` computed for the offending child is applied to every node in its descendant subtree:
`node.start += offset; node.end += offset` for the child and all its descendants (and their
`activeSegments`). Durations (`end − start`) are never changed.

**Alternative considered — shift child only:**
Shift the offending child but leave its own children at their recorded positions. Rejected: shifting
the child without shifting its descendants detaches them — a grandchild whose recorded `start` was
inside the original (skewed) child's interval is now outside the corrected child's interval. The
whole-subtree shift is the only choice that keeps intra-subtree relative structure intact.

**Multi-level skew:** after the child's subtree is shifted, the DFS continues into the now-shifted
child and evaluates each grandchild against the corrected child. A grandchild that is still skewed
relative to its (now-corrected) parent gets its own `offset` computed independently. This is correct:
each parent-child edge is evaluated against the parent's *already-corrected* start.

## Decision 4 — Correction is a `normalize` pipeline stage, before `project`; reuses the `orderLanes` DFS pattern

The correction stage (`correctClockSkew`) is inserted between `dropNonFinite` and `project` in
`data/normalize.ts`. This means:

- It operates on **absolute timestamps** (before re-zeroing). Arithmetic is straightforward:
  `offset = parentStart + delay − childStart` (all in the same epoch-ms or raw-ms units).
- The corrected domain min/max are computed by `project` **after** correction, so shifts are
  reflected in the rendered extent.
- Running-span end synthesis (Spec 26) happens inside `project`, **after** `correctClockSkew`, so
  running spans have no finite `end` at correction time and are skipped by the heuristic.

**DFS structure** mirrors `orderLanes` ([order_lanes.ts:42-63](../../../packages/charts/src/chart_types/trace_chart/data/order_lanes.ts#L42-L63)):
- Roots: spans whose `parentId` is absent or not in the id set (orphans-as-roots — ADR 0018).
- Cycle guard: **visited-set by object identity** (not span id) — prevents infinite recursion on
  malformed `parentId` graphs, matches the settled house pattern.
- Safety pass: any span not reached by the DFS (e.g. in a true cycle) is appended unchanged.

`buildChildrenMap` from `data/self_time.ts` is reused without modification.

## Decision 5 — Corrected spans are flagged, not silently repositioned

Any span shifted by `correctClockSkew` receives `skewCorrected: true` on its `NormalizedSpan` object.
The recorded (pre-correction) times remain reachable via `span.meta` (the untouched `TraceDatum`).
The tooltip and screen-reader surface add a **"time adjusted for clock skew"** note for corrected spans.

**Alternative considered — silent correction:**
Move the span; display the corrected times without any indication that they differ from the source
data. Rejected: the waterfall is a tool for debugging distributed systems. A user comparing the chart
against raw telemetry (trace IDs, export logs) would see timestamps that don't match, with no
explanation. Silent repositioning erodes trust in the visualization more than the original skewed
rendering does.

**Alternative considered — internal flag only (no user-visible note):**
Set `skewCorrected` for testability but render no tooltip/SR change. A middle ground — consumers
could detect corrections via `datum.skewCorrected` in element callbacks — but the end-user has no
way to know the position is estimated rather than exact. Rejected for the same trust reason.

## Consequences

- `gapSegments`' out-of-range clamp (the defensive "clock skew / bad data" fallback) is now the
  fallback for cases the active correction does not cover (right-side overhang, running spans). Its
  comment should be updated to note that active correction happens upstream.
- **Critical intervals** ([ADR 0015](./0015-critical-path-consumer-supplied-intervals.md)) are
  consumer-supplied in the same absolute time coordinates as `TraceDatum.start/end`. A corrected
  span's intervals no longer align with the corrected position. This is a **known limitation**;
  future work could expose a callback with the computed `offset` so callers can apply the same shift
  to their interval data.
- The domain (min/max) can shift as a result of correction — a deeply skewed child pulled toward the
  right may no longer extend the domain leftward. This is correct: the domain should reflect the
  corrected positions.
- Callers who relied on `span.meta.start` matching `span.start` (after normalization + re-zeroing)
  can no longer make that assumption when `span.skewCorrected` is true.
