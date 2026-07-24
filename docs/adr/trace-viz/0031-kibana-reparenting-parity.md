# ADR 0031 — Kibana reparenting parity: intentional divergences, cycle-safety, and a ported regression suite

**Status:** Accepted (Spec 26); refines [ADR 0028](./0028-partial-trace-synthetic-parentage.md)

## Context

[ADR 0028](./0028-partial-trace-synthetic-parentage.md) records *what* partial-trace recovery does.
Our recovery stage is a prose-level port of Kibana APM's `TraceWaterfall`
(`@kbn/apm-ui-shared` → `components/trace_waterfall/use_trace_waterfall.ts`: `getTraceParentChildrenMap`,
`getRootItemOrFallback`, `reparentOrphansToRoot`, `getTraceWaterfall`). Verifying that port against
Kibana's own unit tests surfaced three decisions that ADR 0028 either left implicit or stated
imprecisely, and which are easy to get wrong or silently regress:

1. Kibana guards reparenting with `hasPathToTarget` so an orphan *ancestor* of a focus-selected root
   is not reparented beneath it (would create a cycle). We do not carry that guard, and it is not
   obvious from the code why that is safe.
2. Kibana has **two** distinct no-root fallbacks. ADR 0028's phrase "matching Kibana's fallback rule"
   does not say which one we adopt.
3. Because our port and Kibana's source evolve independently, prose parity is not self-enforcing.

## Decision

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
preorder traversal, while keeping ordering owned by one stage (per ADR 0018 / ADR 0028).

## Consequences

- Divergence from Kibana is allowed only when intentional, and must be reflected both here and in the
  parity suite; an unplanned divergence is a failing test.
- Duplicate-id semantics stay aligned: our per-`traceId` group invalidation equals Kibana's
  whole-waterfall invalidation for single-trace input, and is a strict superset for combined
  multi-trace input (ADR 0028).
- A future focus-root feature must revisit two things this ADR pins as currently unnecessary: the
  ancestor-path cycle guard, and possibly Kibana's earliest-timestamp fallback election.
- The parity suite intentionally does not mirror Kibana's color/legend or React-hook tests; those are
  outside reparenting and are covered by our own colour and component tests.

## Kibana reference

- Source: `src/platform/packages/shared/kbn-apm-ui-shared/src/components/trace_waterfall/use_trace_waterfall.ts`.
- Ported cases: `getTraceWaterfall`, `getTraceParentChildrenMap`, `getRootItemOrFallback` (and the
  focus-trace cases, adapted to our non-goal set) from the adjacent `use_trace_watefall.test.ts`.
- Commit lineage for the underlying behavior is recorded in [ADR 0028](./0028-partial-trace-synthetic-parentage.md).
