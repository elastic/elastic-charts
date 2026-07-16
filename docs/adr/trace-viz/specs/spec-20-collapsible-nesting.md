# Spec 20 — Collapsible nesting (design exploration)

> **Status: Design stub — not an executable spec.**
>
> This document enumerates options, open questions, and reusable pieces for adding collapsible
> parent-child subtrees to the trace waterfall. No implementation approach is committed here. The next
> step is for the team to pick an option (A, B, or C), at which point this stub is promoted to a full
> spec and the deferred lane-ordering ADR is written.

## Goal (exploratory)

Allow users to collapse a parent span so that its descendant lanes are hidden, reducing visual noise
in large traces. Constrained to **single-trace mode** only (`traceId` set): multi-trace has multiple
roots and interleaved spans from different traces; that case is out of scope.

**Depends on:** [Spec 1](./spec-1-normalization.md) — `parentId` on `NormalizedSpan` exists.
Would also interact with [Spec 16](./spec-16-accessibility.md) (keyboard nav) and
[Spec 12](./spec-12-segment-selection.md) (selection on collapsed subtrees).

## The tension

The current lane model is **flat, sorted ascending by `start`, no indentation or tree structure**.
Collapse of "nested parent-children" implies some form of tree traversal and visibility filtering —
a departure from the flat model. The severity of the departure depends on which option is chosen.

The `parentId → children` map already computed in `resolveActive`
([self_time.ts:22](../../../packages/charts/src/chart_types/trace_chart/data/self_time.ts#L22))
is the reusable starting point for any option.

## Options

### Option A — Tree-order (DFS) + gutter indentation + chevrons

Reorder lanes into depth-first tree order (root → children → grandchildren) for single-trace mode.
Draw a depth-proportional left indent in the gutter and a chevron (`▶`/`▼`) next to each parent.
Collapsing a parent hides all its descendants (the lane-render loop skips their indices); expanding
restores them.

**Pros:** truest visual nesting; depth is immediately legible; the collapsed/expanded state is
unambiguous.

**Cons:** biggest blast radius — changes lane ordering (currently start-sort, which users and
downstream tools may rely on); requires passing tree-order indices through geometry, the gutter
renderer, `pickLane`/`pickRegion`, `computeMaxScroll` (must use visible lane count, not total), the
viewport culling loop, the a11y screen-reader table, and `scrollOffset` math.

### Option B — Hide-only, keep start-order + chevrons on parents

Keep the start-time sort; chevrons appear in the gutter for any span that has children. Collapsing a
parent hides its descendants (visibility filter over the sorted lane list). No reordering; no indent.

**Pros:** smaller scope; geometry, culling, and scroll math only need to account for the *visible* lane
count (no reordering).

**Cons:** the "nesting" relationship is less visually obvious because sibling spans of a collapsed
parent remain interleaved by start time; a parent may appear after its children in the lane list if
a child starts earlier.

### Option C — Hybrid: depth indent without reordering

Keep start-time sort; add a depth-proportional gutter indent (proportional to how deep in the tree the
span is, based on the `parentId` chain) without reordering. Chevrons on spans with children; collapse
hides descendants as in B.

**Pros:** depth is hinted without full reordering; smaller scope than A.

**Cons:** depth indent can be misleading if the ordering doesn't follow the tree — a deeply-indented
span may appear next to shallower ones because of start-time interleaving.

## Open questions (must be resolved before promotion to full spec)

1. **Lane ordering:** which option (A/B/C)? This choice cascades into all subsequent decisions.

2. **Chevron affordance:** the gutter is currently a pure text-label canvas region, not interactive.
   Options: (a) extend `pickLane`/`pickRegion` to detect a chevron hit-zone in the gutter x-range;
   (b) overlay a DOM layer with hit-zone `<div>`s; (c) draw a clickable region in the existing canvas
   event handler and test x < `gutterWidth`. Which approach is consistent with ADR 0001 (Canvas2D +
   minimal DOM) and ADR 0009 (CSS div for brush overlay)?

3. **Collapsed active time rollup:** when a parent is collapsed, should its bar show the rolled-up
   active time of its hidden descendants, or only its own self-time (the current default)? Rollup
   requires a new aggregation pass; self-time-only is the current behavior with no changes.

4. **Scroll math:** `computeMaxScroll` uses `spans.length` (total lane count). It must be updated to
   use the **visible** lane count (total minus hidden descendants of collapsed parents). How does the
   caller know the visible count efficiently? A pre-computed array of visible lane indices is one
   approach.

5. **Viewport culling:** the current `firstLane`/`lastLane` loop is contiguous (O(1) bounds). With
   hidden lanes, culling becomes non-contiguous — iterate only visible indices. A `visibleLanes:
   number[]` array (pre-filtered list of lane indices in render order) would replace the
   `[firstLane, lastLane]` bounds. How does this interact with the scroll math?

6. **Controlled vs uncontrolled collapse state:** the `collapsedSpanIds: Set<string>` state follows
   the same two options as selection (Spec 12): uncontrolled instance field, or controlled prop +
   `onCollapseChange` callback. Which model, and does the `focusDomain` perform-and-fire pattern (ADR
   0007) apply here too?

7. **Selection interaction with collapsed subtrees (Spec 12):** a `TraceSegmentRef` for a span whose
   lane is hidden. Should selecting a hidden span auto-expand its parent? Should the controlled
   `selection` prop silently prune refs to hidden spans? Or is selection into a collapsed subtree a
   no-op?

8. **A11y screen-reader table (Spec 16):** the hidden paginated table currently lists all spans. With
   collapse, collapsed descendants may be hidden from the table too, or always listed regardless of
   visual collapse. The two are independent affordances; what does AT expect?

9. **Multi-trace guard:** when `traceId` is not set, the lane list is spans from multiple traces
   interleaved. The parent-child map in `resolveActive` still applies, but roots are ambiguous.
   Collapse is disabled in this mode — add a dev-mode warning if collapse state is supplied without
   `traceId`.

## Reusable pieces (independent of option)

- `parentId → children` Map from `resolveActive` ([self_time.ts:22](../../../packages/charts/src/chart_types/trace_chart/data/self_time.ts#L22)).
- `waitingSegments` from Spec 12 — unchanged by collapse.
- Span `id` and `parentId` on `NormalizedSpan` — the tree structure is already in the data.
- Controlled-prop + perform-and-fire pattern from ADR 0007 — applicable to `onCollapseChange`.

## Next step

Team picks **A**, **B**, or **C** and resolves the open questions above. The stub is then promoted to a
full executable spec with:
- Goal / Depends on / Files / Contract / Steps / Storybook / Tests / Review / Acceptance sections.
- A dedicated ADR for the lane-ordering decision (hard to reverse, non-obvious, result of a real
  trade-off — the three criteria from the ADR policy).
