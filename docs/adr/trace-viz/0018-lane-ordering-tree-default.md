# ADR 0018 — Lane ordering: tree (DFS) default, chronological optional

**Status:** Accepted  
**Implements:** [Spec 15 — Lane ordering mode](./specs/spec-15-lane-ordering.md)  
**Resolves:** the deferred lane-ordering question from [Spec 21 (collapsible nesting stub)](./specs/spec-21-collapsible-nesting.md) and the README build-order note.

## Context

The Trace waterfall assigns each span to a lane (horizontal row). The question of *which lane* a span
occupies — i.e. the ordering rule — was deliberately deferred in the original design (Spec 20/21 open
question #1, README note). Two ordering rules exist in practice:

- **Depth-first tree order (Kibana APM style):** each parent is immediately followed by its
  descendants, recursively; siblings and multiple roots ordered by `start` ascending. Reads as a
  tree, making nesting immediately legible without indentation.
- **Chronological order (Chrome DevTools Network style):** all spans ordered by `start` ascending,
  regardless of the parent-child tree. Familiar for network waterfalls and flat span lists where
  nesting is less relevant.

The Kibana APM trace viewer — the primary consumer of this component — uses tree order. When the
`Kibana Traces` story was pointed at the real Kibana APM dataset, the Trace chart's chronological
ordering produced a substantially different and less legible layout: spans from different subtrees
interleaved, breaking the visual hierarchy.

## Decision

**The default lane order is `'tree'`** (depth-first, as described above).

Both modes are available via the `laneOrder?: 'tree' | 'chronological'` prop on `TraceSpec`.
`'tree'` is the default because:

1. It matches the target consumer (Kibana APM trace view) out of the box — no prop required.
2. It exposes the parent-child relationship already present in `parentId`, making span hierarchy
   legible without indentation or collapse.
3. Chronological order is a deliberate opt-in, documented at the prop site, so users building
   Chrome DevTools-style views can still get it.

## Non-obvious semantics

### Forest (multi-trace mode)

When `traceId` is not set, `'tree'` still applies — the result is a **forest**: root spans (those
with no `parentId`, or whose `parentId` is absent from the span set) are sorted by `start`
ascending; each root's subtree is DFS'd in full before the next root begins. This groups each
trace's spans together instead of interleaving them across traces, which is more readable in the
combined-waterfall case.

### Orphan spans treated as roots

A span whose `parentId` is not present in the span set (e.g. clock-skew, partial trace, or
malformed data) is treated as a root in the forest. This ensures no span is ever dropped from the
lane list, and the span appears at the top level rather than being silently hidden.

### Sibling and root sort: start ascending, stable

Within any parent (including the implicit root set), children are ordered by `start` ascending.
Equal-start ties are broken by original data order (Array.sort is stable in ES2019+), which is
deterministic for a given `data` array but should not be relied on across different data orderings.
Lane ordering runs after normalization: when clock-skew correction moves a span (ADR 0022), this is
the corrected rendered `start`, not the recorded source start. Chronological mode uses the same
corrected-start rule for its whole list.

### Cycle guard

If `parentId` references form a cycle (malformed data), the DFS `visited` set terminates traversal
and any unreached spans are appended at the end (sorted by start), so no span is dropped.

## Consequences

- `orderLanes` (`data/order_lanes.ts`) is the single function responsible for lane assignment;
  both the visual pipeline and the screen-reader table call it with the same `laneOrder` value so
  lane indices are always consistent.
- `buildGeometry`, the canvas renderer, pick/hit-test, scroll math, and selection are
  **order-agnostic** — they operate on position-in-array; only `orderLanes` assigns meaning to
  those positions.
- Existing stories that use nested span data visually reorder to tree layout by default. Stories
  intentionally demonstrating chronological behavior (e.g. `11_chrome_network`) should set
  `laneOrder="chronological"` explicitly to document intent and remain stable across data changes.
- The `PipelineCache` in `TraceChart` and the `getNormalizedSpans` selector include `laneOrder` in
  their invalidation keys so the pipeline recomputes when the mode changes.
