# ADR 0039 — Tree guides draw from a per-lane guide mask

**Status:** Accepted  
**Implements:** [Spec 33 (harvested) — Tree guides](./trace-chart.md#tree-guides)  
**Cites:** [ADR 0018](./0018-lane-ordering-tree-default.md) — DFS lane order; [ADR 0026](./0026-collapsible-nesting.md) — disclosure gutter; [ADR 0037](./0037-disclosure-column-measured-widths.md) — published sub-widths; [ADR 0001](./0001-renderer-canvas2d-with-webgl-seam.md) — frozen `draw(ctx, geom, style)` contract.

## Context

Spec 33 adds a `showTreeGuides` prop that draws a spine + elbow in the disclosure gutter connecting
each expanded parent to its visible display children. Implementing this in the existing
`draw(ctx, geom, style)` contract means the guide data must travel on `geom` — no new argument to
`draw`, per ADR 0001.

The question is: what shape does that guide data take? A natural first framing is a
**parent-anchored spine**: for each parent lane, store the lane indices of its visible children and
draw a single multi-segment spine from the parent down to the last child. That framing mirrors the
visual result but leads to its own culling and clipping problem: once the parent scrolls above
`firstLane`, its spine object must be filtered, clipped, or specially dispatched — none of which
is free.

A second natural shape is **`spineLevels: number[]` per non-root lane**: for each lane, store the
depth levels at which its ancestors are not the last child, so the draw pass knows which ancestor
verticals to extend through that lane. This is O(N²) memory on a pathological deep chain and
materializes 10,000 arrays to read 25 visible ones at the default 5,000-span story size.

## Decision: `TraceGeometry.treeGuidesByLane` — three scalars per non-root visible lane

`TraceGeometry.treeGuidesByLane` is a `ReadonlyMap<lane, { depth, isLastChild, parentLane }>`. The
draw pass iterates visible lanes, reads the entry for each, and walks `parentLane` upward (≈ 8 hops
on real data — `buildLargeTrace` caps depth at 7) to find ancestor passthroughs without any stored
ancestor list.

This is the classic `tree(1)` formulation: **draw a vertical at ancestor A's level iff A is not the
last child of its parent.** Three scalars per lane is the minimum needed to answer that question on
the fly.

**Why this over alternatives:**

- **Parent-anchored spine objects:** need their own culling/clipping once the parent scrolls above
  `firstLane`. Per-lane segments ride the existing lane-area `ctx.clip()` for free; no custom culling
  logic is required.
- **`spineLevels: number[]` per lane:** materializes O(N²) memory on a deep chain and allocates
  ~10,000 arrays at the default story size to read ~25 visible ones. Three scalars per lane scale
  with the number of non-root lanes, not with their depth.
- **Three scalars per lane (chosen):** the `parentLane` walk is bounded by actual display depth (~7
  hops on real traces); the map is populated by a single forward pass over `visibleSpans` with a
  `parentLaneByDepth` stack; and the draw pass re-uses the same per-lane coordinate helpers
  (`barMidY`, `laneTop`) already used in the hot lane loop.

## Decision 2: single forward pass with `parentLaneByDepth` stack

The map is built in `buildTreeGuideMap` (in `data/collapse.ts`) over the DFS-ordered `visibleSpans`
array. A `parentLaneByDepth[d]` stack records the most recent lane at each depth. For each non-root
lane: emit `{ depth, isLastChild: true, parentLane: parentLaneByDepth[d - 1] }`, then flip the
*previous sibling's* `isLastChild` to `false` when a new sibling appears at the same depth under the
same parent. No backward scan, no scope-clearing bookkeeping.

Three spec criteria hold **by construction** rather than by special-casing:

- *Forest roots have no spine* — depth-0 lanes get no entry; nothing can bridge two trace groups.
- *Collapsed parent draws no spine* — a collapsed parent's children are absent from `visibleSpans`;
  no entry is emitted, no guide is drawn.
- *Spine draws when its parent is scrolled out of view* — `parentLane` is a plain index; the parent's
  `barMidY` is computable whether or not the parent is inside `[firstLane, lastLane]`; the existing
  `ctx.clip()` trims the overhang at the time bar.

The sibling-flip guard (`prevEntry.parentLane === parentLane`) ensures a stale `parentLaneByDepth[d]`
from a prior forest group with a different parent does not incorrectly flip the current sibling. This
property holds because lane order is DFS (ADR 0018): a parent's first child is always the immediately
following lane, and parent/descendant lanes are contiguous.

## Consequences

- The two DFS-order properties (ADR 0018) this design depends on: *a parent's first child is the
  immediately following lane* (used by the spine-start rule: the first child's spine begins at
  `barMidY(parentLane) + clearance` rather than at `laneTop`, joining the caret ink cleanly); and
  *parent/descendant lane contiguity* (used by the sibling-flip guard — no cross-group corruption
  without explicit clearing). **Changing lane order away from DFS would break both.**
- `treeGuidesByLane` is populated by `getCollapseOutput` alongside `disclosureByLane`, keyed on the
  same `(pipelineSpans, collapsed, criticalIntervals, withTreeGuides)` cache key.
- The draw pass (`drawTreeGuides`) runs as a single `beginPath`/`stroke` call before the per-lane
  loop, inside the existing `ctx.clip()`. It is early-return-guarded on `treeGuidesByLane.size === 0`
  so the prop-off path is a cheap size check.
- Callers that hand-roll a `TraceGeometry` in tests must add `treeGuidesByLane: new Map()` — the
  same `new Map()` pattern already required for `disclosureByLane` (ADR 0037 Consequences).
