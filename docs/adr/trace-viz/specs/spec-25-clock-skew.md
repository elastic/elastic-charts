# Spec 25 — Clock-skew correction (active centering heuristic)

**Goal:** actively correct child spans whose recorded `start` precedes their parent's, repositioning
each offending child (and its entire descendant subtree) so the child is centered within its parent —
using the symmetric-latency heuristic `delay = (parentDuration − childDuration) / 2`. Corrected
spans carry a `skewCorrected` flag so the tooltip and screen-reader surface can note the adjustment.

See [ADR 0022](../0022-clock-skew-heuristic.md) for the rationale: why always-on (vs opt-in), why
the centering heuristic (vs snap-to-start), why the whole subtree shifts (vs child-only), and why
corrected spans are flagged transparently.

**Depends on:**
- [Spec 1](./spec-1-normalization.md) — the `normalize` pipeline, `parseSimple`, `dropNonFinite`,
  `project`; the `parentId` field on `NormalizedSpan`.
- [Spec 2](./spec-2-self-time.md) — `buildChildrenMap` (reused without change); `gapSegments`
  (stays as a defensive fallback for any residual out-of-range child).
- [ADR 0022](../0022-clock-skew-heuristic.md) — all non-obvious decisions are recorded there.

**Ordering with Spec 26 (running spans):** the clock-skew stage runs **before** running-span
end-synthesis (`project`). Running spans have no meaningful duration (`end == null`), so the
heuristic is skipped for any child or parent that is running. See [Spec 26](./spec-26-running-spans.md).

## Files

- `packages/charts/src/chart_types/trace_chart/data/types.ts` — add `skewCorrected?: true` (optional
  `true`, absent on uncorrected spans) to `NormalizedSpan`. Recorded times remain on `span.meta`
  (the untouched `TraceDatum`).
- `packages/charts/src/chart_types/trace_chart/data/normalize.ts` — insert a new `correctClockSkew`
  stage between `dropNonFinite` (currently L59) and `project` (currently L60). No other changes to the
  existing stages.
- `packages/charts/src/chart_types/trace_chart/data/self_time.ts` — reuse exported `buildChildrenMap`
  (no change to that file).
- `packages/charts/src/chart_types/trace_chart/render/tooltip.ts` — when `span.skewCorrected`, add a
  "time adjusted for clock skew" note; surface the recorded start from `span.meta.start` if useful.
- `packages/charts/src/chart_types/trace_chart/state/selectors/get_screen_reader_data.ts` — when
  `span.skewCorrected`, annotate the SR row to note the adjustment.
- `storybook/stories/trace/24_clock_skew.story.tsx` — new story; register in `trace.stories.tsx`.

## Contract

`correctClockSkew` is a **pure** `NormalizedSpan[] → NormalizedSpan[]` transform:
- Never mutates input objects.
- Never drops or reorders spans.
- Only shifts times (and sets `skewCorrected`); durations (`end − start`) are always preserved.
- Unskewed spans pass by reference (no allocation).
- Runs in absolute coordinates, before `project` re-zeros to the domain minimum.

The correction is always-on: every `child.start < parent.start` edge triggers it, evaluated
top-down so each child is compared against its parent's *already-corrected* start.

## Steps

### 1. Extend `NormalizedSpan` in `data/types.ts`

Add one optional field:
```ts
/**
 * Present (as `true`) when the normalization pipeline shifted this span's timestamps to correct
 * a detected clock skew (child started before its parent). The original recorded times are
 * reachable via `span.meta.start` / `span.meta.end`. Absent on uncorrected spans.
 */
skewCorrected?: true;
```

Using `?: true` (rather than `boolean`) keeps the field absent (not `false`) on the common case,
preserving structural ergonomics for callers that do `if (span.skewCorrected)`.

### 2. Implement `correctClockSkew` in `data/normalize.ts`

Insert the call in `normalize()`:
```ts
const finite = dropNonFinite(selected);
const corrected = correctClockSkew(finite);   // <-- new stage
const result = project(corrected, xScaleType);
```

Implementation:
```ts
/**
 * Shifts each span (and its entire descendant subtree) that starts before its parent, centering
 * it within the parent using the symmetric-latency heuristic:
 *   delay = (parentDuration − childDuration) / 2
 * Spans whose end is null (running — Spec 26) are skipped both as parents and as children.
 * See ADR 0022.
 */
function correctClockSkew(spans: NormalizedSpan[]): NormalizedSpan[] {
  if (spans.length === 0) return spans;

  const childrenMap = buildChildrenMap(spans);
  const ids = new Set(spans.map((s) => s.id));
  const roots = spans.filter((s) => s.parentId === undefined || !ids.has(s.parentId));

  // Work map: spanId → the corrected copy of the span (spans not yet visited hold original refs).
  const corrected = new Map<string, NormalizedSpan>(spans.map((s) => [s.id, s]));

  // Cycle guard by object identity — mirrors orderLanes.
  const visited = new Set<NormalizedSpan>();

  function shiftSubtree(span: NormalizedSpan, offset: number): NormalizedSpan {
    const shifted: NormalizedSpan = {
      ...span,
      start: span.start + offset,
      end: span.end + offset,
      activeSegments: span.activeSegments.map((seg) => ({
        ...seg,
        start: seg.start + offset,
        end: seg.end + offset,
      })),
      skewCorrected: true,
    };
    corrected.set(shifted.id, shifted);
    // Shift children by the same offset (they are already in the corrected map from DFS entry).
    for (const child of childrenMap.get(span.id) ?? []) {
      if (!visited.has(child)) shiftSubtree(child, offset);
    }
    return shifted;
  }

  function dfs(span: NormalizedSpan, parent: NormalizedSpan | null): void {
    if (visited.has(span)) return;
    visited.add(span);

    let current = corrected.get(span.id)!;

    if (
      parent !== null &&
      current.end != null &&           // skip running spans (Spec 26)
      parent.end != null &&
      current.start < parent.start
    ) {
      const parentDur = parent.end - parent.start;
      const childDur = current.end - current.start;
      const delay = (parentDur - childDur) / 2;
      const targetStart = parent.start + delay;
      const offset = targetStart - current.start;
      current = shiftSubtree(current, offset);
    }

    for (const child of childrenMap.get(span.id) ?? []) {
      dfs(child, current);
    }
  }

  roots.forEach((root) => dfs(root, null));

  // Safety: spans not reached by the DFS (e.g. in a cycle via orphaned non-root nodes) are
  // appended unchanged — mirrors the orderLanes safety pass.
  return spans.map((s) => corrected.get(s.id) ?? s);
}
```

**Notes on the implementation:**
- `shiftSubtree` recurses **down** from the corrected child to shift all descendants by the same
  offset in one pass, so the DFS continuation sees already-corrected children.
- The `visited` guard in `dfs` prevents double-processing the same object; the `visited` guard in
  `shiftSubtree` prevents an infinite loop if `childrenMap` is cyclic (malformed data).
- `corrected.get(s.id)` in the final `spans.map` preserves input order (lane reindexing is safe).

### 3. Tooltip note in `render/tooltip.ts`

When the resolved span has `skewCorrected`:
- Add a secondary line (or annotation row) to the span tooltip: "⚠ start adjusted for clock skew".
- Optionally: format `span.meta.start` (the recorded original) and note it alongside.

The exact visual treatment (icon, placement) is left to the implementation; the spec requires *some*
user-visible note. The warning must not appear for uncorrected spans.

### 4. SR annotation in `state/selectors/get_screen_reader_data.ts`

When `span.skewCorrected`, append "(clock skew adjusted)" to the span's name cell in the SR table.

### 5. Story in `24_clock_skew.story.tsx`

Dataset: a trace of three spans —
- `root` (parent): 0–200 ms.
- `http` (child of `root`): recorded at −20–80 ms (starts 20 ms before the parent — skewed).
  After correction: centered at `delay = (200 − 100) / 2 = 50` ms → rendered at 50–150 ms.
- `db` (child of `http`): recorded at −15–40 ms (child of a skewed child).
  Corrected by the same `offset` as `http` plus its own correction against the now-corrected `http`.

Show a knob / toggle (or two separate panels) demonstrating the skewed vs corrected layout, and
note in the story title that the chart corrects clock skew automatically.

## Edge cases

| Case | Behavior |
|---|---|
| `childDur > parentDur` | `delay < 0`; child overhangs symmetrically on both sides. Rendered as-is per the heuristic — inherent to the formula. |
| Running child or parent (`end == null`) | Heuristic skipped for this edge only; the running span is not shifted (no duration available). Cross-ref Spec 26. |
| Right-side overhang (starts in parent, ends after) | **Out of scope.** The existing `gapSegments` clamp bounds children to the parent for self-time derivation. |
| Cyclic `parentId` graph | DFS terminates via the `visited` guard; unreached spans pass through unchanged. |
| Multi-level skew | Grandchild's edge is evaluated against the *corrected* parent, so nested skew resolves independently at each level. |
| Critical intervals ([ADR 0015](../0015-critical-path-consumer-supplied-intervals.md)) | Consumer-supplied intervals use the same absolute time coordinates as the source datum; after clock-skew correction the interval times no longer align with the corrected span times. **Documented limitation** — follow-up: future work could accept a `onCorrectedOffset` callback or apply the same offset to intervals. |

## Tests

- `data/normalize.test.ts` (or a companion `data/clock_skew.test.ts`):
  - **Centering:** child starting before parent → `childStart === parentStart + (parentDur − childDur) / 2`; `skewCorrected === true` on the child; parent unchanged.
  - **Subtree shift:** grandchild shifts by the same offset as the child.
  - **Both corrected:** `skewCorrected` on the shifted grandchild too.
  - **Unskewed pass-through:** `child.start >= parent.start` → neither span has `skewCorrected`.
  - **Right-side overhang not corrected:** `child.start >= parent.start, child.end > parent.end` → no change.
  - **Running child skipped:** `child.end == null` with `child.start < parent.start` → no shift.
  - **Running parent skipped:** `parent.end == null` → no shift for its children.
  - **`childDur > parentDur` overhang:** corrected start is `< parent.start`; `skewCorrected === true` (heuristic applied even with overhang).
  - **Multi-level cascade:** three-level skew; each level corrected independently against its now-corrected parent.
  - **Cyclic `parentId`:** terminates cleanly; no span lost.
  - **Domain shift:** after correction the domain min can shift leftward (a deeply skewed child pulled the domain min); `project()` still produces a valid `[0, max]` after re-zeroing.

## Review (`/review-claudio`)

- `shiftSubtree` must never be called twice on the same node (double-shift); verify the `visited`
  check inside it is by object reference (the same object-identity guard used in `orderLanes`).
- Verify `corrected.get(s.id)` in the final `spans.map` preserves input order (not DFS order); lane
  reindexing and downstream callers assume the normalized-span array is in the same order as the
  pipeline input.
- Verify the tooltip/SR note appears only when `span.skewCorrected`; no change for uncorrected spans.
- Verify that `activeSegments` on a shifted span have correct absolute offsets (each `seg.start` and
  `seg.end` incremented by `offset`, not re-zeroed).
- Verify that running spans (`end == null`) pass through untouched, and that the running-span guard
  is a strict null-check (not a falsy check that would also catch `end === 0`).

## Acceptance

- A trace with a child whose recorded `start` precedes its parent renders the child inside the parent,
  horizontally centered per `delay = (parentDuration − childDuration) / 2`.
- The child's subtree shifts by the same offset; intra-subtree relative distances are preserved.
- The tooltip / SR surface for a corrected span notes "time adjusted for clock skew."
- Unskewed traces render byte-identically to today (no `skewCorrected`, no domain change).
- Running spans are not shifted and have no `skewCorrected` marker.
- `yarn jest trace_chart` and `yarn typecheck` are green.
