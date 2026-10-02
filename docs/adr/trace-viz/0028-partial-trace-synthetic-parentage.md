# ADR 0028 — Partial traces use source-preserving synthetic parentage (with Kibana reparenting parity)

**Status:** Accepted (Spec 26)

> Consolidates former ADR 0031 (Kibana reparenting parity: intentional divergences, cycle-safety, and
> a ported regression suite) — see the "Kibana reparenting parity" section below.

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
Kibana's filtered earliest-timestamp election — see the "Kibana reparenting parity" section below).
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
render an aggregate warning callout. Spec 26 adds no aggregate diagnostics callback; recovery-driven
omissions and invalidations are reported through the Trace data diagnostics report ([ADR 0032](./0032-trace-data-diagnostics-report.md)).
No recovery opt-in flag is added: an incomplete relationship is always detected, and the synthetic
relationship is confined to display semantics.

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
feature must add it back before it can use synthetic parentage (rationale in the "Kibana reparenting
parity" section below).

## Kibana reparenting parity: intentional divergences, cycle-safety, and a ported regression suite

Our recovery stage is a prose-level port of Kibana APM's `TraceWaterfall`
(`@kbn/apm-ui-shared` → `components/trace_waterfall/use_trace_waterfall.ts`: `getTraceParentChildrenMap`,
`getRootItemOrFallback`, `reparentOrphansToRoot`, `getTraceWaterfall`). Verifying that port against
Kibana's own unit tests surfaced three decisions that the recovery rules above either left implicit or
stated imprecisely, and which are easy to get wrong or silently regress:

1. Kibana guards reparenting with `hasPathToTarget` so an orphan *ancestor* of a focus-selected root
   is not reparented beneath it (would create a cycle). We do not carry that guard, and it is not
   obvious from the code why that is safe.
2. Kibana has **two** distinct no-root fallbacks; the recovery rules must say which one we adopt.
3. Because our port and Kibana's source evolve independently, prose parity is not self-enforcing.

**Ported parity suite is the anti-drift mechanism.** `kibana_waterfall_parity.test.ts` (colocated with
the recovery stage) translates Kibana's reparenting test cases onto our public shapes
(`recoverPartialTraces`, and `normalize` + `orderLanes` for order/depth). Each intentional divergence
is encoded and commented in that suite so a behavioral drift on either side fails a test rather than
passing silently. The suite — not this prose — is the executable contract for parity.

**Cycle-safety: we intentionally omit the ancestor-path guard.** Our elected display root is always
parentless *within its trace group*: a recorded root has no `parentId`, and a fallback root is the
first orphan, whose recorded parent is by definition absent from the group. No reparented orphan can
therefore be an ancestor of the elected root, so attaching orphans beneath it cannot form a cycle.
The depth-first reachability walk additionally guards by object identity. Kibana needs
`hasPathToTarget` only because its focus-trace feature can elect a *descendant* as the visible root;
that feature is a Spec 26 non-goal. **If a focus-root / `entryTransaction` selection is ever added,
the ancestor-path guard becomes mandatory before synthetic parentage may be applied.**

**Fallback-election scope is deliberately narrow.** Kibana elects a no-root fallback two ways:
`getRootItemOrFallback` takes the first orphan in input order; `getTraceParentChildrenMap` (only when
its trace is *filtered*) elects the earliest-`timestamp` item. We adopt the input-order rule only and
do **not** implement the filtered earliest-timestamp election, because Elastic Charts has no
focused/filtered-trace concept. Our fallback root additionally retains orphan/`fallbackRoot`
provenance where Kibana drops the item from its orphan list.

**Ordering parity is achieved by composition, not by sorting inside recovery.** Recovery preserves
survivor input order and never sorts; `orderLanes` (tree) reproduces Kibana's preorder-by-start with
identical per-node depths. `recoverPartialTraces` + `orderLanes` together equal Kibana's single-pass
preorder traversal, while keeping ordering owned by one stage (per ADR 0018).

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
- Omitted or invalid output is reported through the data diagnostics report; aggregate user-facing
  presentation remains outside the Trace component.
- Divergence from Kibana is allowed only when intentional, and must be reflected both here and in the
  parity suite; an unplanned divergence is a failing test.
- Duplicate-id semantics stay aligned: our per-`traceId` group invalidation equals Kibana's
  whole-waterfall invalidation for single-trace input, and is a strict superset for combined
  multi-trace input.
- A future focus-root feature must revisit two things this ADR pins as currently unnecessary: the
  ancestor-path cycle guard, and possibly Kibana's earliest-timestamp fallback election.
- The parity suite intentionally does not mirror Kibana's color/legend or React-hook tests; those are
  outside reparenting and are covered by our own colour and component tests.

## Kibana reference

- Source: `src/platform/packages/shared/kbn-apm-ui-shared/src/components/trace_waterfall/use_trace_waterfall.ts`.
- Ported cases: `getTraceWaterfall`, `getTraceParentChildrenMap`, `getRootItemOrFallback` (and the
  focus-trace cases, adapted to our non-goal set) from the adjacent `use_trace_watefall.test.ts`.
- Commit lineage for the underlying behavior: `c96a8839e018`, `36c31d600a371`, `3843218ee070`.
