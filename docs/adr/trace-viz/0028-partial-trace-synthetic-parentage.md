# ADR 0028 — Partial traces use source-preserving synthetic parentage

**Status:** Proposed (Spec 26); parity divergences and regression strategy refined by [ADR 0031](./0031-kibana-reparenting-parity.md)

## Context

A supplied trace can be incomplete: a span may reference a `parentId` whose span is absent from the
visible dataset. Treating every such orphan as an unrelated root preserves data but fragments the
execution flow. Kibana APM instead marks the trace partial and displays genuine orphans beneath an
elected visible root. Kibana performs that repair on cloned waterfall items, warns the user, and
marks reparented items as orphans.

Directly replacing Elastic Charts' normalized `parentId` would make a presentation repair look like
source truth. It would also cause synthetic children to reduce the root's derived self time and would
leak the invented parent through click and selection payloads.

## Decision

Partial-trace recovery is always on when a trace group has an elected display root. A span whose
recorded parent is missing remains an **orphan span** and keeps its recorded `parentId`; when it can be
recovered safely, normalization assigns a separate synthetic display parent pointing to the elected
root. The original `TraceDatum` is never mutated.

Display topology drives tree lane order, collapse/rollup membership, screen-reader indentation, and
clock-skew correction. Source topology continues to drive derived self time. Public payload
`parentId` remains the recorded value and optional orphan provenance identifies both the missing
relationship and any synthetic root used for display.

Recovery is grouped by `traceId` so a span is never attached across distinct trace-ID values
(`undefined` is one group because no finer identity exists). A group with exactly one recorded root
uses it. A group with no recorded root elects its first orphan in normalized input order as a fallback
root, matching Kibana's non-filtered `getRootItemOrFallback` rule (we deliberately do not adopt
Kibana's filtered earliest-timestamp election — see [ADR 0031](./0031-kibana-reparenting-parity.md)).
A group with multiple recorded roots elects the last root in
normalized input order. Only the elected root's reachable tree is visible: non-elected roots,
disconnected cycles, and their unreachable components are omitted, matching Kibana even in a
combined waterfall.

A duplicate ID reached while traversing one elected tree invalidates only that trace group; other
groups remain visible. A duplicate ID occurring across selected trace groups invalidates the entire
combined result because Elastic Charts' interaction and reference APIs use chart-global span IDs.
The unknown-`traceId` group follows the same last-root/reachability behavior; callers are responsible
for supplying trace identity when multiple logical traces would otherwise be indistinguishable.
These rules determine visible membership before lane ordering and therefore apply identically to
tree and chronological modes. Recovery traverses depth-first to validate and identify reachable
spans but preserves their normalized input order in its output; the existing `orderLanes` stage alone
owns final lane order.

All structural parent resolution is trace-local, including recorded source parentage used for
self-time derivation. Kibana obtains this boundary by querying one `trace.id` before constructing its
parent-child map; Elastic Charts enforces the equivalent boundary internally because its combined
waterfall accepts multiple traces at once. An ID found only in another trace therefore cannot satisfy
a parent reference or reduce that other trace's derived self time.

The Trace component continues to render while tooltip, interaction, and screen-reader surfaces
identify each orphan. The consuming application—not the chart component—owns whether and how to
render an aggregate warning callout. Spec 26 adds no aggregate diagnostics callback; a dedicated
cross-feature follow-up will consider partial-trace and clock-skew diagnostics together. No recovery
opt-in flag is added: an incomplete relationship is always detected, and the synthetic relationship
is confined to display semantics.

Until that diagnostics API exists, any recovery-driven omission or invalidation emits one bounded,
aggregated developer warning per normalization call. This includes non-elected roots, unreachable or
rootless components, and duplicate-driven group/chart invalidation; lossless orphan reparenting does
not warn. This prevents silent blank or partial output without making the warning a user-facing chart
feature; the future diagnostics snapshot supersedes the warning as the application integration seam.

When an orphan is elected as the fallback display root, it retains `orphaned` provenance and receives
an internal-only fallback disposition so presentation can distinguish it from synthetically
reparented orphans. Public events expose the missing-parent fact but no separate fallback-root marker.

## Kibana reference boundary

The baseline is Kibana APM's `TraceWaterfall` behavior in `@kbn/apm-ui-shared`:

- commit `c96a8839e018` introduced partial-trace root fallback, trace-level warnings, and per-orphan
  disclosure;
- commit `36c31d600a371` applies focused-trace reparenting and clock-skew placement to cloned items;
- commit `3843218ee070` prevents reparenting an orphan ancestor beneath a selected descendant root.

Elastic deliberately differs by not overwriting recorded parent identity, by retaining missing-parent
provenance on an elected fallback root even though Kibana removes that item from its orphan list, and
by leaving trace-level warning presentation to the consuming application rather than rendering
Kibana's built-in callout. Its multi-trace extension isolates invalid same-trace groups but treats an
ID duplicated across groups as a chart-wide identity failure. Focused-subtree selection is not
introduced by Spec 26; because our elected root is always parentless within its group, reparenting
cannot form a cycle and Kibana's ancestor-path cycle guard is unnecessary here — a future focus-root
feature must add it back before it can use synthetic parentage
(rationale in [ADR 0031](./0031-kibana-reparenting-parity.md)).

## Consequences

- ADR 0018's orphan-as-root forest is superseded for Spec 26 output: orphan fallback/election and
  visible reachability now follow the rules above.
- Recovery does not introduce a second ordering policy: it preserves survivor input order and leaves
  tree DFS or chronological sorting to `orderLanes`.
- `skewCorrected` and orphan provenance are independent: a reparented span may have either, both, or
  neither timing marker depending on whether its coordinates moved.
- Collapsing an elected display root includes reparented orphan subtrees in the visual rollup, while
  the root's derived self time still excludes them from causal child subtraction.
- Duplicate IDs and cycles retain termination and no-mutation guarantees, but not visible
  cardinality: invalid groups and unreachable components are intentionally omitted.
- Omitted or invalid output is temporarily observable through one aggregated developer warning;
  aggregate user-facing presentation remains outside the Trace component.
