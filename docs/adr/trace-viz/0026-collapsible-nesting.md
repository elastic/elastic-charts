# ADR 0026 — Collapsible nesting: rolled-up semantics, tree-gating, and disclosure gutter

**Status:** Accepted; display-topology input amended by ADR 0028 / Spec 26
**Implements:** [Spec 21 — Collapsible nesting](./specs/spec-21-collapsible-nesting.md)  
**Supersedes open questions:** Spec 21 stub open questions #2–#9 (resolved here in full).  
**Cites:** [ADR 0018](./0018-lane-ordering-tree-default.md) — lane-ordering seam; [ADR 0011](./0011-segment-selection-model.md) — controlled perform-and-fire pattern; [ADR 0007](./0007-focus-domain-perform-and-fire.md) — perform-and-fire precedent.

## Context

Spec 21 was originally a design stub with nine open questions. Questions #2–#9 were resolved in a
team session (2026-07-21); this ADR records the three hardest decisions — the ones that are hard
to reverse, non-obvious, and the result of genuine trade-offs. Question #1 (lane ordering) was
already resolved by [ADR 0018](./0018-lane-ordering-tree-default.md).

Several decisions interact: the seam chosen for hiding lanes (post-`orderLanes` prune) makes the
rolled-up semantics the only viable option for the collapsed bar; that in turn drives what the
disclosure gutter must reserve; and the tree-gating decision determines where the feature guard
lives.

## Decision 1: Rolled-up active segments for the collapsed bar

When a parent is collapsed, its bar shows the **rolled-up** union of every span's active segments in
the hidden subtree — the parent's own active segments **plus** every descendant's active segments —
merged/deduped with the same interval-merge pass used by `gapSegments`, and clamped to the parent's
own `[start, end]` extent.

**Why this over self-time-only:**

- Self-time-only (showing only the parent's own active segments) would produce a bar narrower than
  the parent's extent whenever any descendant was executing — misleading for Kibana-style waterfalls
  where `activeSegments = full span extent`. The collapsed parent would appear idle during all
  descendant execution time.
- The rolled-up union answers the question a user naturally asks when collapsing: "how much of this
  subtree's time is anyone actively executing?" Idle time on the collapsed bar is time *nobody* in
  the subtree was executing — semantically meaningful.
- The merge pass (`mergeSegments`) already exists in `gapSegments` as an inlined sort-and-merge
  block. Extracting it as an exported `mergeSegments` helper adds no new logic.

**Non-obvious invariant:** a collapsed lane is still owned by exactly one span (the parent). The
roll-up aggregates segments *visually* but does not create a new multi-owner entity — the swimlane
model (one span per lane, no swimlanes) is preserved. `TraceSegmentRef` for a clicked collapsed
bar uses `region: 'span'` (whole-span — per Decision 3 below).

**Rejected: self-time-only.** Produces a visually misleading bar for callers that set
`activeSegments = full extent` (the Kibana APM style). Not aligned with user intent.

**Rejected: descendant-union only (no parent's own segments).** Would drop the parent's own
contribution, making the bar misleadingly narrow when the parent itself has active work.

## Decision 2: Tree-gating — feature active only in `laneOrder === 'tree'`

Collapsible nesting is gated on `laneOrder === 'tree'`. In `chronological` mode, `collapsedSpanIds`
is **ignored** and a dev-mode warning fires.

**Why tree mode only:**

- In `chronological` mode, the parent span's lane is not necessarily adjacent to its descendants —
  any span that starts later appears after the parent, but siblings from other subtrees can
  interleave. Hiding descendants would create non-contiguous gaps in the lane list, breaking the
  scroll-math and culling invariants that depend on `spans.length` being the visible count.
- The `collapseLanes` prune step produces a contiguous array only because `orderLanes` in tree mode
  places each parent immediately above its descendants. This adjacency is the structural invariant
  that makes prune + re-index safe.

**Multi-trace forests:** in `laneOrder: 'tree'` without a `traceId` filter, the lane list is a
forest — each valid trace group's elected visible tree is grouped together. Collapse works in that
forest: `collapseLanes` uses Spec 26's trace-local **display parent** map, so reparented orphan
subtrees participate in pruning/rollup and an identically named parent in another trace cannot claim
them. Non-elected, unreachable, or invalid components have already been omitted. This **supersedes
Spec 21 open question #9** ("multi-trace guard: collapse disabled without `traceId`") — the guard is
still `chronological` mode, not multi-trace.

**Implementation:** a single `if (spec.laneOrder === 'chronological') { devWarn(...); return; }`
guard in `getCollapseOutput` on the `TraceChart` instance.

## Decision 3: On-by-default disclosure gutter; depth-indented carets; `'span'` picking for collapsed

Three related UI decisions bundled here because each is a direct consequence of the others.

### 3a. Disclosure gutter reserved in all label modes when parents exist

In `tree` mode with ≥1 parent span, a fixed-width caret column is reserved in the gutter **in
every label mode** (`gutter`, `inline`, `none`) by extending `gutterPx(style, opts?)`. Flat traces
(no parents → `hasParents = false`) reserve nothing, so there is no regression for non-nested data.

**Why all label modes:** users of `inline` and `none` label modes can still have nested data and
need the collapse affordance. Reserving the caret column only in `gutter` mode would silently
disable collapse for users who chose `inline` or `none` for aesthetic reasons.

**Implementation:** `gutterPx(style, { hasParents, maxDepth })` adds
`CARET_GLYPH_PX + maxDepth × CARET_INDENT_STEP_PX` to the gutter in every mode; in `gutter` mode
this widens the existing label panel; in `inline`/`none` mode it creates a new minimal left column.
Constants `CARET_GLYPH_PX = 20` and `CARET_INDENT_STEP_PX = 8` are module-level, like `LANE_PADDING`.

### 3b. Depth-indented carets; `depthBySpan` emitted by `orderLanes`

Carets are drawn at `gutter.left + depth × CARET_INDENT_STEP_PX`, where `depth` is the span's
depth in the tree (root = 0). `depth` is a free byproduct of the DFS in `orderLanes` tree mode —
the DFS already tracks recursion depth to build the lane order. Emitting it as `depthBySpan:
Map<NormalizedSpan, number>` on the `orderLanes` return value adds zero new computation.

**`depthBySpan` key type:** `Map<NormalizedSpan, number>` keyed by object reference. `collapseLanes`
creates spread-clones for visible collapsed parents (`{ ...span, activeSegments: rollup }`); these
clones are not in `depthBySpan`. `buildDisclosureMap` bridges this by building a
`depthById: Map<string, number>` from the original `pipelineSpans` references before the main loop,
so spread-clone lookups by `span.id` succeed.

### 3c. Whole-span-only picking on collapsed bars (`region: 'span'`)

`pickRegion` returns `region: 'span', segmentIndex: -1` when the picked lane is collapsed. Hovering
or clicking a collapsed bar never returns `'active'` or `'waiting'` with a sub-index.

**Why:** the rolled-up `activeSegments` on a collapsed parent are a synthetic aggregate of the
subtree — sub-indices into them have no stable meaning (they combine segments from multiple spans
with different `spanId`s). Returning a `TraceSegmentRef` with a sub-index would be a lie: the
selection ref would claim to identify a specific active segment of the parent, but the visual fill
it corresponds to may include contributions from many descendants.

**Trade-off accepted:** per-segment selection (click → highlight one active segment) is unavailable
while a parent is collapsed. It is restored on expand. Selection refs to hidden descendants are
retained in `this.selection` and re-rendered when the parent is expanded.

### 3d. On by default; keyboard toggle is `c`

Collapse is on with zero config in tree mode — no opt-in boolean. The `c` key on the focused lane
toggles its collapse state and fires an `aria-live` announcement.

**Why on by default:** an opt-in boolean adds API surface for a feature the plan positions as a
natural extension of tree order. The only cost is a layout shift (gutter widening) for existing
nested-data tree stories — accepted.

**Why `c`:** `ArrowLeft`/`Right` pan the time axis; `ArrowUp`/`Down` move focus; `Enter`/`Space`
select. `c` (for "collapse") is unambiguous and matches common convention (e.g., tree pickers).

### 3e. Caret click consumed before select/clear; no `onElementClick`

Caret zone clicks are detected by `pickDisclosure` **before** `pickRegion` in `handleCanvasClick`.
On a caret hit: toggle collapse, fire `onCollapseChange`, announce, schedule a render, and **return**
— `onElementClick` is never called and selection is unchanged.

**Why:** the caret is a disclosure affordance, not a span selection gesture. Firing both would
create a confusing double-action (collapse + select) on a small target.

## Consequences

- `collapseLanes` runs as a **memoized post-step** keyed on `[pipeline result identity, effective
  collapsed set]` stored on the `TraceChart` instance. `normalize` and `resolveActive` never re-run
  on a collapse toggle; only the prune + rollup recomputes.
- The SR selector (`get_screen_reader_data.ts`) applies `collapseLanes` using only
  `spec.collapsedSpanIds` (the controlled prop) — it has no access to the component's uncontrolled
  `this.collapsed` field (not in redux). In fully uncontrolled use the SR table may be out of sync
  with the visual. This is a known limitation: the SR path is designed for automated tooling where
  the caller uses the controlled prop.
- Scroll math and viewport culling require **no changes**: `collapseLanes` prunes the ordered array
  so `spans.length` is already the visible count; the contiguous `firstLane`/`lastLane` culling
  bounds remain valid.
- `disclosureByLane` is threaded through `buildGeometry` rather than the canvas renderer deriving it
  independently, keeping pick and draw logic consistent with a single source of truth.
