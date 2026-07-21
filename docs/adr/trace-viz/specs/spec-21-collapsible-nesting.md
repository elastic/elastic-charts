# Spec 21 — Collapsible nesting

**Goal:** allow users to collapse a parent span so that its descendant lanes are hidden, reducing
visual noise in large traces. Each parent lane shows a depth-indented disclosure caret (`▶`/`▼`)
that the user can click or keyboard-toggle (`c` key). Collapsed parents show a rolled-up merged bar
(the union of the whole subtree's active segments), clamped to the parent extent. Collapse is a
`tree`-mode feature; `chronological` ignores the props and logs a dev warning.

**Depends on:**

- [Spec 1](./spec-1-normalization.md) — `parentId` on `NormalizedSpan` exists.
- [Spec 12](./spec-12-accessibility.md) — keyboard nav handler where `c` key is added; `aria-live`.
- [Spec 13](./spec-13-segment-selection.md) — `region: 'span'` ref type; `TraceSegmentRef`.
- [Spec 15](./spec-15-lane-ordering.md) — `laneOrder: 'tree'` is the seam; `orderLanes` emits
  `depthBySpan` (added here) as a free DFS byproduct.
- [Spec 17](./spec-17-responsive-labels.md) — `gutterPx(style)` extended here to accept `{ hasParents, maxDepth }` opts.

**See also:** [ADR 0026](../0026-collapsible-nesting.md) — rolled-up semantics, tree-gating, and
disclosure-gutter decisions.

## Files

- `packages/charts/src/chart_types/trace_chart/data/self_time.ts` — extract & export
  `mergeSegments(intervals): Segment[]` from the sort-and-merge block previously inlined in
  `gapSegments`; call `mergeSegments` in `gapSegments` (behaviour-preserving). Reused by the
  rollup in `collapseLanes`.
- `packages/charts/src/chart_types/trace_chart/data/order_lanes.ts` — have the tree DFS also emit
  a per-span `depth` map (root = 0) via a new `depthBySpan: Map<NormalizedSpan, number>` field on
  the return value. Chronological mode: all depths are 0.
- `packages/charts/src/chart_types/trace_chart/data/collapse.ts` *(new)* — three exports:
  - `collapseLanes(orderedSpans, collapsedSpanIds): NormalizedSpan[]` — prunes descendants of
    collapsed parents and replaces each visible collapsed parent with a spread-clone whose
    `activeSegments` is the **rolled-up** union of the whole subtree clamped to the parent extent.
    Handles nested collapse (a collapsed span under a collapsed ancestor is absorbed). Input not
    mutated; output length = visible count.
  - `collapsibleParentIds(spans): Set<string>` — set of span ids that have at least one descendant.
  - `buildDisclosureMap(pipelineSpans, visibleSpans, effectiveCollapsed, depthBySpan, parentIds)` —
    produces a `Map<laneIndex, DisclosureEntry>` for `TraceGeometry`, bridging the
    object-keyed `depthBySpan` to id-keyed lookups so spread-clones from `collapseLanes` resolve.
- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — add `collapsedSpanIds?: string[]`
  and `onCollapseChange?: (next: string[]) => void` to `TraceSpec`, beside the selection props
  (same controlled/perform-and-fire JSDoc).
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — add collapse state machinery
  mirroring the `selection` model (instance fields, `getEffectiveCollapsed()`,
  `fireCollapseChange()`, `syncCollapseLifecycle()`); memoize `getCollapseOutput` keyed on
  `[pipeline identity, effective collapsed set]`; tree-gate with a dev-warn; caret hit branch at
  the top of `handleCanvasClick` (before the select/clear path); `c` key in the keyboard handler.
- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add constants
  `CARET_GLYPH_PX = 20`, `CARET_INDENT_STEP_PX = 8`; add `DisclosureEntry` interface; extend
  `gutterPx(style, opts?)` to reserve a caret column (`CARET_GLYPH_PX + maxDepth × CARET_INDENT_STEP_PX`)
  in **all** label modes when `opts.hasParents` is true; add `disclosureByLane` to `TraceGeometry`;
  add `'span'` to `HoverRegion`.
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — accept `disclosureByLane`,
  `hasParents`, and `maxDepth` params; use extended `gutterPx`; return `disclosureByLane`.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — in the gutter pass,
  draw the `▶`/`▼` caret at `gutter.left + depth × CARET_INDENT_STEP_PX`; add
  `pickDisclosure(x, y, geom): number` (caret-zone hit-test → lane index or -1); make `pickRegion`
  return `region: 'span'` for any hit on a collapsed lane's fill.
- `packages/charts/src/chart_types/trace_chart/render/tooltip.ts` — add `'span': 'Collapsed'` to
  `REGION_LABEL`.
- `packages/charts/src/chart_types/trace_chart/state/selectors/get_screen_reader_data.ts` — apply
  `collapseLanes` using `spec.collapsedSpanIds ?? []` (controlled prop only; uncontrolled local
  state is not in redux); build `disclosure` via `buildDisclosureMap`; append `" (N descendants
  hidden)"` suffix to collapsed parent row names.

## Contract

```ts
/**
 * Controlled collapse state. When supplied, this array of span IDs is the render source of truth
 * for which parent subtrees are hidden. When omitted, collapse is managed internally (uncontrolled).
 * Only active when `laneOrder === 'tree'`; ignored (with a dev warning) in chronological mode.
 *
 * Collapse follows the perform-and-fire model (ADR 0007): gestures always execute and fire
 * `onCollapseChange` — the parent decides whether to update the prop.
 *
 * @defaultValue undefined (uncontrolled — starts fully expanded)
 */
collapsedSpanIds?: string[];

/**
 * Called after every collapse or expand gesture with the next collapsed-id array.
 * In controlled mode the parent should update `collapsedSpanIds` with the new value; in
 * uncontrolled mode this is an observe-only hook.
 */
onCollapseChange?: (next: string[]) => void;
```

**`collapseLanes` contract:**

- Input: ordered `NormalizedSpan[]` (post-`orderLanes`), `collapsedSpanIds: ReadonlySet<string>`.
- Output: new flat array with descendants pruned; collapsed parents carry rolled-up `activeSegments`
  (union of the whole subtree's segments, merged/deduped, clamped to parent extent). Input not mutated.
- Nested collapse: a collapsed span under a collapsed ancestor is absorbed (drops from the output).
- Output length = visible lane count (used directly by scroll math and culling without change).

**`pickDisclosure` contract:**

- Returns the visible lane index if `(x, y)` hits the caret zone of that lane, or `-1` otherwise.
- Must be checked **before** `pickRegion` in `handleCanvasClick` so caret clicks never fire
  `onElementClick` or mutate selection.

**`disclosureByLane` contract:**

- `Map<number, DisclosureEntry>` keyed by visible lane index. Lane absent ↔ no caret.
- Entries: `{ state: 'collapsed' | 'expanded'; depth: number; descendantCount: number }`.

## Steps

1. `data/self_time.ts`: extract & export `mergeSegments`; call it in `gapSegments`. Verify tests.
2. `data/order_lanes.ts`: emit `depthBySpan` from the tree DFS. Verify order-lanes tests.
3. `data/collapse.ts` + `collapse.test.ts`: implement the three exports. Verify collapse tests.
4. `trace_api.ts`: add `collapsedSpanIds` and `onCollapseChange`. Verify typecheck.
5. `trace_chart.tsx`: state machinery, `getCollapseOutput` memoization, tree-gate dev-warn, caret
   click branch, `c` key handler.
6. `render/types.ts` + `render/geometry.ts`: constants, `DisclosureEntry`, extended `gutterPx`,
   `disclosureByLane` in `TraceGeometry`.
7. `render/canvas2d_renderer.ts`: caret draw, `pickDisclosure`, collapsed-fill → `'span'` picking.
8. `get_screen_reader_data.ts`: apply `collapseLanes`, build `disclosure`, suffix row names.
9. `storybook/stories/trace/24_collapsible_nesting.story.tsx` + register in `trace.stories.tsx`.
10. Promote this spec doc; write `docs/adr/trace-viz/0026-collapsible-nesting.md`; update
    `docs/adr/trace-viz/README.md` and `CONTEXT.md`.

## Storybook

`24_collapsible_nesting.story.tsx`:

- Uses the `FRONTEND_WEB_OTLP_ENVELOPE` Kibana APM dataset (same as `12_kibana_trace` / `20_lane_order`).
- Renders in `laneOrder="tree"` uncontrolled mode — no `collapsedSpanIds` prop needed.
- `labelPosition` knob (gutter / inline / none) shows that the caret gutter is reserved in every mode.
- Description documents: click a caret to collapse/expand, focus a lane and press `c` to toggle,
  collapsed parent shows the rolled-up merged bar.

## Tests

- `data/self_time.test.ts` (extended): `mergeSegments` refactor leaves `gapSegments` /
  `resolveActive` / `waitingSegments` output byte-identical; `mergeSegments` merges overlapping and
  adjacent intervals correctly; disjoint intervals kept separate.
- `data/order_lanes.test.ts` (extended): `depthBySpan` correct (root = 0, child = 1,
  grandchild = 2); chronological mode: all depths are 0 (or absent).
- `data/collapse.test.ts` (new): descendants pruned; collapsed bar = merged union of whole subtree's
  active segments (overlaps deduped, clamped to parent extent); nested collapsed spans absorbed;
  collapsing a childless span is a no-op; input not mutated; output length = visible count.
- `render/geometry.test.ts` (extended): `disclosureByLane` marks parent lanes with `state` + `depth`,
  others absent; `gutterPx` reserves the caret column in inline/none when parents exist, 0 for flat data.
- `render/canvas2d_renderer.test.ts` (extended): caret drawn at depth-indented x for parent lanes
  only; `pickDisclosure` hits the caret zone, -1 elsewhere; `pickRegion` on a collapsed fill → `'span'`.
- `state/get_screen_reader_data.test.ts` (extended): collapsed descendants absent from
  `TraceTableRow[]`; collapsed-parent row name carries `" (N descendants hidden)"`.
- `trace_chart.test.tsx` (extended): uncontrolled toggle updates + redraws; controlled
  `collapsedSpanIds` is render source of truth, `onCollapseChange` still fires (perform-and-fire),
  once per toggle, echo guard; caret click toggles without clearing selection or firing
  `onElementClick`; `c` key toggles focused lane; `laneOrder="chronological"` ignores collapse +
  dev-warns; selecting a collapsed bar yields `region: 'span'`.

## Review (`/review-claudio`)

- Verify `collapseLanes` does not mutate its input array.
- Verify output length equals the visible count in all cases (collapsed, nested-collapsed, childless).
- Verify `pickDisclosure` is checked **before** `pickRegion` in `handleCanvasClick`.
- Verify `fireCollapseChange` has an echo guard (does not fire if the effective set did not change).
- Verify `gutterPx` reserves the caret column in `inline` and `none` modes, not only `gutter`.
- Verify `depthBySpan` is object-keyed and `buildDisclosureMap` bridges it via id before the loop.
- Verify the SR selector uses `spec.collapsedSpanIds ?? []` (controlled-only), not `this.collapsed`.

## Acceptance

- Open `24_collapsible_nesting` story: click a depth-indented `▶` caret — descendant lanes disappear,
  parent bar widens to the rolled-up merged active bar; scrollbar contracts.
- Click the caret again (now `▼`) — descendants reappear.
- Focus a lane (arrow keys) and press `c` — subtree toggles; `aria-live` announces.
- Switch `labelPosition` to `inline` / `none` — carets still render, gutter reserved.
- Inspect the hidden SR table DOM: collapsed descendants absent; parent row contains `N descendants hidden`.
- `yarn jest trace` green (16 suites, 445+ tests).
- `yarn typecheck` green.
