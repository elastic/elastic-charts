# Spec 15 — Lane ordering mode (tree default + chronological)

**Goal:** add a `laneOrder` prop to the Trace chart that controls the order in which spans are
assigned to lanes. The default (`'tree'`) produces depth-first `parentId` nesting, matching the
Kibana APM trace view. The opt-in (`'chronological'`) preserves the prior start-time order, matching
the Chrome DevTools Network panel.

**Motivating bug:** the `Kibana Traces` story (`12_kibana_trace.story.tsx`), when pointed at the
real Kibana APM dataset, rendered in a layout substantially different from Kibana's own trace view
because the prior behavior sorted all spans by `start` time, interleaving spans from different
subtrees. Tree order groups each subtree together, matching the reference.

**Depends on:** [Spec 1](./spec-1-normalization.md) — `parentId` on `NormalizedSpan` exists.

**See also:** [ADR 0018](../0018-lane-ordering-tree-default.md) — the lane-ordering decision record.
[Spec 21 (collapsible nesting)](./spec-21-collapsible-nesting.md) — open question #1 resolved here;
collapse will build on `laneOrder: 'tree'`.

> **Spec 26 amendment:** root election and reachable membership now run before lane ordering. The
> contracts below apply to that surviving array: `tree` follows trace-local display parentage and
> `chronological` sorts the identical visible membership. Spec 26 supersedes the original
> orphan-as-root, append-unreached, and output-length-equals-input guarantees.

## Files

- `packages/charts/src/chart_types/trace_chart/data/self_time.ts` — extract `buildChildrenMap`
  helper; `resolveActive` now calls it (behaviour-preserving refactor).
- `packages/charts/src/chart_types/trace_chart/data/order_lanes.ts` *(new)* — `orderLanes(spans,
  mode)` function.
- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — add `laneOrder?:
  'tree' | 'chronological'` to `TraceSpec`; add `laneOrder` to `PipelineCache`.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — replace inline `.sort(...)` with
  `orderLanes(resolved, spec.laneOrder ?? 'tree')`; add `laneOrder` to pipeline-cache key.
- `packages/charts/src/chart_types/trace_chart/state/selectors/get_screen_reader_data.ts` — replace
  mirrored `.sort(...)` with `orderLanes`; add `laneOrder` to selector comment (spec object change
  already invalidates the reselect cache).
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — update contract comment.
- `storybook/stories/trace/11_chrome_network.story.tsx` — add `laneOrder="chronological"` to
  document its Chrome DevTools intent.
- `storybook/stories/trace/20_lane_order.story.tsx` *(new)* — comparison story with a radio toggle.

## Contract

```ts
/**
 * Controls the order in which spans are assigned to lanes (top → bottom).
 *
 * - `'tree'` (default): depth-first `parentId` nesting — each parent is immediately followed by
 *   its descendants, recursively; siblings and roots ordered by `start` ascending, stable ties.
 *   Works as a forest of elected visible trees in multi-trace mode. Synthetic display parentage is
 *   used for recovered orphans.
 * - `'chronological'`: ascending by span `start` (Chrome DevTools Network panel style).
 *
 * See ADR 0018.
 * @defaultValue 'tree'
 */
laneOrder?: 'tree' | 'chronological';
```

**`orderLanes(spans, mode)` contract:**

- Input: `NormalizedSpan[]` (post-`resolveActive`), mode.
- Output: new flat array in lane order. The caller's array is not mutated.
- Both modes are O(N log N).
- `'tree'` cycle guard: a `visited` Set prevents infinite recursion. Spec 26's preceding recovery
  stage owns cycle/duplicate invalidation and omission, so `orderLanes` receives only elected
  reachable trees and its output length equals that visible input length.
- Downstream contract: `buildGeometry`, the canvas renderer, `pickLane`, and scroll math are
  order-agnostic and require no changes — lane index is position in the output array.

## Steps

1. Extract `buildChildrenMap` from `resolveActive` in `self_time.ts`; export it. Verify
   `resolveActive` output is unchanged.
2. Create `data/order_lanes.ts` with `orderLanes`; use `buildChildrenMap` from step 1.
3. Update `trace_api.ts`: add `laneOrder` prop. Update `PipelineCache` interface in
   `trace_chart.tsx`: add `laneOrder` field. Replace the inline sort with `orderLanes`; add
   `cache.laneOrder === spec.laneOrder` to the cache-hit check.
4. Update `get_screen_reader_data.ts`: replace inline sort with `orderLanes`.
5. Update `geometry.ts` contract comment.
6. Add `laneOrder="chronological"` to `11_chrome_network.story.tsx`.
7. Author `20_lane_order.story.tsx`.

## Storybook

`20_lane_order.story.tsx`:
- Uses the `FRONTEND_WEB_OTLP_ENVELOPE` Kibana APM dataset (same as `12_kibana_trace`).
- Radio buttons switch `laneOrder` between `'tree'` and `'chronological'` live.
- `'tree'` matches the Kibana reference screenshot; `'chronological'` shows prior behavior.

`12_kibana_trace.story.tsx`:
- No change needed — adopts tree order by default, matching the Kibana reference.

`11_chrome_network.story.tsx`:
- Gets `laneOrder="chronological"` added explicitly. Visually unchanged (its data is single-root
  one-level, so tree == chronological for this specific dataset), but the prop documents intent.

## Tests

- `data/order_lanes.test.ts` (new):
  - `'chronological'` produces ascending start order and does not mutate input.
  - `'tree'`: parent before descendants; siblings by start; equal-start siblings preserve data order
    (stable); the original orphan-as-root/multi-root/cycle safety cases remain historical unit
    coverage for the standalone helper. Spec 26 adds end-to-end coverage for display-parent orphans,
    elected roots, and omitted/invalid topology; flat data still matches `'chronological'`.
  - Regression: Kibana APM dataset tree order matches the reference DFS sequence.
- `data/self_time.test.ts` (extended):
  - `buildChildrenMap`: empty map for no-parentId spans; correct grouping; `resolveActive` output
    unchanged by the refactor.
- `trace_chart.test.tsx` (extended, tracked in Spec 15 story):
  - Default (omitted) = tree; `'chronological'` reproduces prior order; changing `laneOrder`
    invalidates the pipeline cache.

## Review (`/review-claudio`)

- Verify `orderLanes` does not mutate the input array in either mode (`.slice()` or fresh result).
- Verify the standalone cycle guard terminates; at the integrated Spec 26 boundary, verify lane order
  receives only the recovered visible array and does not restore omitted spans.
- Verify `laneOrder` is in both the `PipelineCache` invalidation check and the SR selector's
  invalidation key, so changing `laneOrder` triggers a full recompute in both places.
- Verify `buildChildrenMap` is called exactly once per `orderLanes` call (not per DFS node).
- Verify chronological mode result is identical to the prior `resolved.slice().sort(...)` behavior.

## Acceptance

- `12_kibana_trace` renders in tree order matching the Kibana reference screenshot: root `GET
  /products` (frontend-web) → `GET /recommendations` (frontend-web) → subtree recursively.
- `11_chrome_network` is visually unchanged and carries `laneOrder="chronological"`.
- `20_lane_order` story toggles cleanly; switching modes re-renders without error.
- `yarn jest order_lanes self_time` green (34+ tests).
- `yarn typecheck` green.
- Post-renumber grep: all spec cross-references resolve.
