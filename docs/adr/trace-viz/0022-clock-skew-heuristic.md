# ADR 0022 — Clock-skew correction: Kibana-compatible placement

**Status:** Accepted (implemented by Spec 24)

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

## Reconciliation amendment — Kibana coordinate parity

For valid, finite trace trees with unique span IDs, Kibana APM's `TraceWaterfall` is the authoritative
coordinate oracle. Given equivalent timestamps and durations, the Trace chart must produce the same
clock-skew-adjusted span positions. Elastic Charts retains its own normalized timestamp representation,
`skewCorrected` provenance, and public interaction payloads; those API differences are outside the
parity boundary.

This amendment supersedes the original signed-latency, whole-subtree behavior. The decisions below
state the reconciled contract.

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

## Decision 2 — Kibana-compatible non-negative propagation latency

The correction estimates the propagation latency from parent to child as half of the non-negative
duration slack:

```
latency = max(parentDuration − childDuration, 0) / 2
targetChildStart = correctedParentStart + latency
offset = targetChildStart − recordedChildStart
```

When the child is no longer than its parent, this centers the child within the parent. When the child
is longer, latency is zero: the corrected child begins at the corrected parent start and may overhang
only on the right. The span is still marked because its coordinates changed.

**Rejected alternative — signed slack:** allowing a negative latency symmetrically centers a longer
child around its parent and can translate a detected left-skewed child farther left. That behavior
does not match Kibana APM.

**Rejected alternative — always snap to parent start:** zero latency for every child discards the
symmetric propagation estimate for the normal case where the child is shorter than its parent.

**Elastic-specific malformed-duration policy:** a span with `end < start` is retained, but every
clock-skew edge involving it is excluded because propagation latency is not meaningful for a negative
duration. Normalization emits one development-only warning per call, aggregated by malformed span:
the warning reports the total count, lists at most the first five span IDs, and reports any remaining
count. It does not emit once per edge. Production output remains silent through the existing
`Logger.warn` contract.

## Decision 3 — Correct every span independently against its corrected parent

Correction does not automatically translate a span's descendant subtree. Each child keeps its
recorded coordinates as the input to its own decision and is compared directly with its parent's
corrected start. When that comparison detects skew, the child receives its own complete translation;
otherwise it remains at its recorded coordinates even if its parent moved.

This matches Kibana APM and means that moving a parent does not promise preservation of the raw
parent/descendant distance. A descendant that records after the corrected parent start may remain
unchanged; one that records before it is independently placed relative to that corrected parent.
`skewCorrected` therefore means that the marked span itself moved, not merely that an ancestor moved.

**Rejected alternative — automatic subtree translation:** carrying an ancestor offset through every
descendant preserves raw intra-subtree distances, but disagrees with Kibana whenever a descendant
starts between its parent's recorded and corrected starts or after the corrected start.

**Orphans remain outside the parity boundary:** Kibana reparents missing-parent spans under its
elected visible root and marks the trace partial. Elastic Charts retains its established forest model,
where a span whose `parentId` is absent from the supplied dataset is a root. Proposed
[Spec 27](./specs/spec-27-partial-trace-reparenting.md) defines source-preserving reparenting,
provenance, warnings, interaction payloads, and accessibility; it remains outside clock-skew
reconciliation until implemented.

## Decision 4 — Correction is a `normalize` pipeline stage, before `project`; reuses the `orderLanes` DFS pattern

The correction stage (`correctClockSkew`) is inserted between `dropNonFinite` and `project` in
`data/normalize.ts`. This means:

- It operates on **absolute timestamps** (before re-zeroing). Arithmetic is straightforward:
  `offset = parentStart + latency − childStart` (all in the same epoch-ms or raw-ms units).
- The corrected domain min/max are computed by `project` **after** correction, so shifts are
  reflected in the rendered extent.
- `orderLanes` runs after correction. Chronological order and tree-mode root/sibling order therefore
  use corrected starts and remain consistent with the rendered positions; the correction transform
  itself still preserves the normalization array's input order.
- Consumer-supplied critical intervals receive their owning span's own correction offset before
  the existing projection and clamp, so interval precision remains attached to the corrected span.
- Running-span end synthesis (Spec 25) happens inside `project`, **after** `correctClockSkew`. A
  running child or parent has no finite `end`, so an edge involving either cannot originate a
  correction. A running span remains at its recorded start and carries no `skewCorrected` marker.
  It is not reparented: Kibana's orphan recovery applies when a parent document is absent, whereas
  the Trace chart has an explicitly supplied running parent. Completed edges below a running edge may
  resume independent evaluation when both participants have finite recorded durations.

**DFS structure** mirrors `orderLanes` ([order_lanes.ts:42-63](../../../packages/charts/src/chart_types/trace_chart/data/order_lanes.ts#L42-L63)):
- Roots: spans whose `parentId` is absent or not in the id set (orphans-as-roots — ADR 0018).
- Cycle guard: **visited-set by object identity** (not span id) — prevents infinite recursion on
  malformed `parentId` graphs, matches the settled house pattern.
- Parent reference: each DFS call receives the parent's corrected span, but computes the child's
  placement from the child's recorded coordinates. No ancestor offset is accumulated or inherited.
- Safety pass: any span not reached by the DFS (e.g. in a true cycle) is appended unchanged.

`buildChildrenMap` from `data/self_time.ts` is reused without modification.

## Decision 5 — Corrected spans are flagged, not silently repositioned

Any span shifted by `correctClockSkew` receives `skewCorrected: true` on its `NormalizedSpan` object.
The recorded (pre-correction) times remain reachable via `span.meta` (the untouched `TraceDatum`).
The tooltip and screen-reader surface add a **"time adjusted for clock skew"** note for corrected spans.
Because `TraceElementEvent` and `TraceSelectionDetail` expose normalized timing fields, they also
carry the optional marker when those values were corrected. Their `datum` remains the original
`TraceDatum`; the marker is not added to source data or thin selection refs.

An uncorrected descendant carries no marker even when its parent was corrected. Provenance follows
the final translation of that individual span rather than its ancestry.

**Alternative considered — silent correction:**
Move the span; display the corrected times without any indication that they differ from the source
data. Rejected: the waterfall is a tool for debugging distributed systems. A user comparing the chart
against raw telemetry (trace IDs, export logs) would see timestamps that don't match, with no
explanation. Silent repositioning erodes trust in the visualization more than the original skewed
rendering does.

**Alternative considered — internal flag only (no user-visible or public-payload note):**
Set `skewCorrected` for testability but render no tooltip/SR change. Consumers could not recover the
internal flag through custom-tooltip or element-event `datum`, because both expose the original
`TraceDatum`, not the `NormalizedSpan`. The end-user would therefore have no indication that the
position is estimated rather than exact. Rejected for the same trust reason.

## Decision 6 — Versioned local Kibana parity contract

Elastic Charts owns local, table-driven parity tests with explicit expected coordinates. The baseline
ports Kibana's four `getClockSkew` cases and adds nested cases that distinguish independent per-span
placement from automatic subtree translation. Tests identify Kibana commit `36c31d600a371`, where the
reference behavior was introduced, but do not import code or data from a Kibana checkout.

This is a deliberate compatibility baseline, not automatic synchronization. If Kibana changes its
algorithm, maintainers must compare the new behavior, amend this ADR/spec when appropriate, and then
update the local golden cases. A duplicated test-only implementation is rejected because it could
repeat the production mistake and pass without proving expected coordinates.

## Consequences

- `gapSegments`' out-of-range clamp (the defensive "clock skew / bad data" fallback) is now the
  fallback for cases the active correction does not cover (right-side overhang and edges that cannot
  originate a correction because a participant is running). Its comment should be updated to note
  that active correction happens upstream.
- **Critical intervals** ([ADR 0015](./0015-critical-path-consumer-supplied-intervals.md)) remain
  consumer-supplied in the same raw coordinates as `TraceDatum.start/end`. The normalize pipeline
  applies each owning span's own correction offset before re-zeroing and clamping; consumers do not
  need a correction callback or a second coordinate mode.
- The domain (min/max) can shift as a result of correction — a deeply skewed child pulled toward the
  right may no longer extend the domain leftward. This is correct: the domain should reflect the
  corrected positions.
- Callers who relied on `span.meta.start` matching `span.start` (after normalization + re-zeroing)
  can no longer make that assumption when `span.skewCorrected` is true.
