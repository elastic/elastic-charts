# Spec 24 — Clock-skew correction (Kibana-compatible placement)

**Goal:** match Kibana APM TraceWaterfall coordinates for valid finite trace trees. Each completed
span whose recorded `start` precedes its corrected parent's start is placed independently at
`correctedParentStart + max(parentDuration − childDuration, 0) / 2`. Corrected spans carry a
`skewCorrected` flag so tooltip, events, selection detail, and screen-reader surfaces disclose that
the rendered timestamps differ from the source record.

See [ADR 0022](../0022-clock-skew-heuristic.md) for the rationale and the explicit boundary between
Kibana-compatible valid-tree coordinates and Elastic-specific malformed-input, ordering, provenance,
running-span, and orphan policies.

**Depends on:**
- [Spec 1](./spec-1-normalization.md) — the `normalize` pipeline, `parseSimple`, `dropNonFinite`,
  `project`; the `parentId` field on `NormalizedSpan`.
- [Spec 2](./spec-2-self-time.md) — `buildChildrenMap` (reused without change); `gapSegments`
  (stays as a defensive fallback for any residual out-of-range child).
- [ADR 0022](../0022-clock-skew-heuristic.md) — all non-obvious decisions are recorded there.
- [ADR 0027](../0027-span-id-uniqueness.md) — span IDs are unique within one supplied dataset;
  Spec 24's direct correction seam retains no-crash/no-mutation guarantees, while Spec 27 governs
  visible-output invalidation and omission for malformed duplicates.

**Ordering with Spec 25 (running spans):** the clock-skew stage runs **before** running-span
end-synthesis (`project`). An edge involving a running child or parent cannot originate correction
because it has no meaningful duration. The running span remains structurally attached, stays at its
recorded start, and carries no `skewCorrected` marker; it is not treated as a missing parent or
reparented. A deeper completed edge may be evaluated independently. See
[Spec 25](./spec-25-running-spans.md).

Spec 24 lands before the public running-span model exists. Its correction stage therefore uses
finite-end guards so it is compatible with Spec 25's pre-projection sentinel, but observable
running-span behavior and its end-to-end tests land with Spec 25 rather than pulling a partial
running-span API into this spec.

## Files

- `packages/charts/src/chart_types/trace_chart/data/types.ts` — add `skewCorrected?: true` (optional
  `true`, absent on uncorrected spans) to `NormalizedSpan`. Recorded times remain on `span.meta`
  (the untouched `TraceDatum`).
- `packages/charts/src/specs/settings.tsx` — add `skewCorrected?: true` to `TraceElementEvent`, emitted
  by both `onElementClick` and `onElementOver` when their timing fields were adjusted.
- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — add `skewCorrected?: true` to
  `TraceSelectionDetail`; document the dataset-wide uniqueness requirement on `TraceDatum.id`; do
  not add the marker to `TraceDatum` or `TraceSegmentRef`.
- `packages/charts/src/chart_types/trace_chart/data/normalize.ts` — insert a new `correctClockSkew`
  stage between `dropNonFinite` and `project`; translate each corrected span's critical intervals by
  the same offset before the existing re-zero and clamp operations.
- `packages/charts/src/chart_types/trace_chart/data/self_time.ts` — reuse exported `buildChildrenMap`
  without logic changes; update the `gapSegments` fallback comment to describe residual out-of-range
  or malformed data after active correction.
- `packages/charts/src/chart_types/trace_chart/render/tooltip.ts` — when `span.skewCorrected`, add a
  "time adjusted for clock skew" note and copy the marker into trace element/selection payloads.
- `packages/charts/src/chart_types/trace_chart/state/selectors/get_screen_reader_data.ts` — when
  `span.skewCorrected`, annotate the SR row to note the adjustment.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — include the same note in the
  keyboard lane-focus aria-live announcement.
- `storybook/stories/trace/26_clock_skew.story.tsx` — new story (24 and 25 are already occupied);
  register in `trace.stories.tsx`.

## Contract

`correctClockSkew` is a **pure** `NormalizedSpan[] → NormalizedSpan[]` transform:
- Never mutates input objects.
- Never drops or reorders spans.
- Only shifts times (and sets `skewCorrected`); durations (`end − start`) are always preserved.
- Unskewed spans pass by reference (no allocation).
- Runs in absolute coordinates, before `project` re-zeros to the domain minimum.

Consumer-supplied critical intervals stay attached to their span regions: before projection and
clamping, each interval receives `correctedAbsoluteStart − span.meta.start`, the same total offset as
its owning span. This does not change the public `TraceCriticalPath` input contract.

Normalization preserves input array order, but downstream lane ordering uses corrected starts.
Chronological mode therefore follows the rendered timeline; tree mode sorts roots and siblings by
their corrected starts while preserving its parent-before-descendant structure.

Any public payload that exposes corrected timing fields also exposes `skewCorrected?: true`:
`TraceElementEvent` for `onElementClick` / `onElementOver`, and `TraceSelectionDetail` for
`onSelectionChange`. `TraceDatum` remains the untouched source record, `TooltipValue.datum` remains
that same object, and `TraceSegmentRef` remains a thin identity value.

The correction is always-on: every valid completed edge is evaluated top-down using the child's
recorded coordinates and its parent's *already-corrected* start. No ancestor offset is inherited.
`skewCorrected` is present only when that span's own timestamps changed.

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
const result = project(corrected, xScaleType, criticalPath);
```

Implementation:
```ts
/**
 * Places each valid completed span independently against its corrected parent using Kibana's rule:
 *   latency = max(parentDuration − childDuration, 0) / 2
 * Edges involving negative-duration or running spans are ignored.
 * See ADR 0022.
 * @internal Exported from this module as a direct unit-test seam; not part of the package API.
 */
export function correctClockSkew(spans: NormalizedSpan[]): NormalizedSpan[] {
  if (spans.length === 0) return spans;

  const childrenMap = buildChildrenMap(spans);
  const ids = new Set(spans.map((s) => s.id));
  const roots = spans.filter((s) => s.parentId === undefined || !ids.has(s.parentId));
  const corrected = new Map<NormalizedSpan, NormalizedSpan>();
  const visited = new Set<NormalizedSpan>();
  let correctionTriggered = false;

  const negativeDurationSpans = spans.filter(
    (span) => Number.isFinite(span.end) && span.end < span.start,
  );
  if (negativeDurationSpans.length > 0) {
    const shownIds = negativeDurationSpans.slice(0, 5).map(({ id }) => `"${id}"`).join(', ');
    const remaining = negativeDurationSpans.length - 5;
    Logger.warn(
      `Trace chart: ignored clock-skew correction for ${negativeDurationSpans.length} ` +
        `negative-duration span${negativeDurationSpans.length === 1 ? '' : 's'} ` +
        `(${shownIds}${remaining > 0 ? `, and ${remaining} more` : ''}).`,
    );
  }

  function shiftSpan(span: NormalizedSpan, offset: number): NormalizedSpan {
    return {
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
  }

  function dfs(span: NormalizedSpan, parent: NormalizedSpan | null): void {
    if (visited.has(span)) return;
    visited.add(span);

    const validEdge =
      parent !== null &&
      Number.isFinite(span.end) &&
      Number.isFinite(parent.end) &&
      span.end >= span.start &&
      parent.end >= parent.start &&
      span.start < parent.start;

    let current = span;
    if (validEdge) {
      const parentDur = parent.end - parent.start;
      const childDur = span.end - span.start;
      const latency = Math.max(parentDur - childDur, 0) / 2;
      const offset = parent.start + latency - span.start;
      if (offset !== 0) {
        current = shiftSpan(span, offset);
        correctionTriggered = true;
      }
    }

    corrected.set(span, current);
    for (const child of childrenMap.get(span.id) ?? []) {
      dfs(child, current);
    }
  }

  roots.forEach((root) => dfs(root, null));

  if (!correctionTriggered) return spans;
  return spans.map((span) => corrected.get(span) ?? span);
}
```

**Notes on the implementation:**
- Every child decision starts from that child's recorded coordinates. The corrected parent object is
  passed down only as the comparison reference; its offset is never added to the child automatically.
- The non-negative latency clamp exactly matches Kibana: a longer left-skewed child starts at the
  corrected parent start and may overhang to the right.
- The `visited` guard and `corrected` map use object identity, matching `orderLanes` and avoiding
  accidental overwrite when malformed input contains duplicate span IDs.
- Negative-duration spans are retained unchanged. Every edge involving one is ignored, and the
  stage emits one aggregated `Logger.warn` per normalization call with the count, at most five IDs,
  and a remaining-count suffix. `Logger.warn` is already development-only.
- A running span is not translated and does not receive `skewCorrected`. Its non-finite end sentinel
  is synthesized by Spec 25's `project` stage. Its structural children remain attached; a deeper
  completed edge may be evaluated independently.
- The final `spans.map` preserves input order; the no-correction fast path returns the original array.

In `projectCriticalIntervals`, translate raw interval bounds by the owning span's total correction
before the existing scale projection and clamp:
```ts
const skewOffset = span.skewCorrected ? span.start + projectionOffset - span.meta.start : 0;
const start = Math.max(rawStart + skewOffset - projectionOffset, span.start);
const end = Math.min(rawEnd + skewOffset - projectionOffset, span.end);
```
Here `span.start + projectionOffset` reconstructs the corrected absolute start in linear mode;
`projectionOffset` is zero in time mode. Unknown spans and empty intervals keep the existing behavior.

### 3. Tooltip note in `render/tooltip.ts`

When the resolved span has `skewCorrected`:
- Add an annotation row with label `Clock skew` and value `Time adjusted for clock skew`.

The row must not appear for uncorrected spans. Do not add the recorded `span.meta.start` to the
default tooltip: source data may use epoch or relative coordinates, while the existing `Start` row is
a rendered-domain offset. Custom tooltips can still inspect the original `TraceDatum` via `datum`.

### 4. Event and selection provenance

Add `skewCorrected?: true` to `TraceElementEvent` and `TraceSelectionDetail`. In `buildTraceEvent`
and `buildTraceSelectionDetail`, include the field only when the normalized span is corrected:
```ts
...(span.skewCorrected && { skewCorrected: true }),
```
This marker explains why the payload's normalized timing fields differ from its original `datum`.
Do not add the marker to `TraceDatum`, `TooltipValue`, or `TraceSegmentRef`.

### 5. SR annotation in `state/selectors/get_screen_reader_data.ts`

When `span.skewCorrected`, append "(clock skew adjusted)" to the span's name cell in the SR table.
When keyboard navigation focuses a corrected lane, append "time adjusted for clock skew" to the
existing name-and-duration aria-live announcement. Uncorrected announcements remain byte-identical.

### 6. Story in `26_clock_skew.story.tsx`

Provide a `Dataset` select knob that loads one of the visual test datasets below. Keep correction
always-on: the knob chooses source data, not whether correction runs. Also provide `xScaleType` and
`laneOrder` select knobs so projection and corrected ordering can be inspected without separate
stories.

| Dataset | Contents and expected result |
|---|---|
| **Kibana baseline cases** | Present the four reference cases in separate small trees: a root has zero skew; a child recorded after its parent is unchanged; under a 0–100 ms parent, a −20–20 ms child moves to 30–70 ms; under another 0–100 ms parent, a longer −30–120 ms child moves to 0–150 ms. Only the two moved children expose the correction note and `skewCorrected` interaction payload. These are the visual counterparts of Kibana commit `36c31d600a371`'s `getClockSkew` cases. |
| **Nested independent correction** (default) | `root` 0–200 ms; `http` recorded −20–80 ms moves to 50–150 ms. Its three 20 ms children distinguish the decision thresholds: one begins before `http`'s recorded start, one at 0 ms between its recorded and corrected starts, and one at 100 ms after its corrected start. The first two independently move to 90–110 ms; the third remains 100–120 ms and unmarked. `http` has a −10–30 ms active segment rendered at 60–100 ms, and the middle child has a 5–15 ms segment rendered at 95–105 ms. This proves that descendants receive their own offsets rather than inheriting `http`'s translation. |
| **Long-child clamp** | Parent 0–100 ms and child −30–120 ms. The 150 ms child moves to 0–150 ms: latency clamps to zero, its left edge equals the corrected parent start, and its overhang remains entirely on the right. Hover and click must report the correction. |
| **No-op and malformed durations** | One 0–100 ms root has an unskewed 10–30 ms child, a right-overhanging 80–120 ms child, a zero-duration −10…−10 ms child that moves to 50…50 ms, and a negative-duration −10…−20 ms child retained unchanged. Add a negative-duration parent with a finite child to prove both incident edges are ignored. Corrected provenance appears only on the zero-duration child; the browser console receives one aggregated warning naming no more than five malformed IDs. |
| **Projection and integrations** | Root 0–200 ms; skewed child A −20–80 ms moves to 50–150 ms; sibling B remains 10–30 ms. A's raw critical interval 0–20 ms moves by A's own `+70 ms` offset and renders at 70–90 ms. In chronological mode B precedes A; in tree mode sibling order is also B then A. Toggle `xScaleType` to verify domain and interval alignment, and use hover/click/selection plus the screen-reader table to compare provenance on A and B. |
| **Malformed topology** | Include a missing-parent orphan, a two-span `parentId` cycle, and two root spans sharing a malformed duplicate ID. At Spec 24's original boundary the fixture proved termination without coordinate parity. After Spec 27, the orphan follows elected-root recovery, unreachable cycles are omitted, and reachable duplicate IDs invalidate their trace group; the Spec 27 story is authoritative for visible lanes and warnings. |

Keep each fixture as a small module-level `TraceDatum[]` (and optional `criticalPath`) entry in a
typed dataset configuration map. The selected entry supplies the chart data and any case-specific
critical intervals. Names should include the expected behavior so retained but non-drawable malformed
lanes remain identifiable from the gutter and screen-reader table.

Document every dataset, source coordinate, expected rendered coordinate, marker expectation, and
manual interaction check in `Example.parameters.markdown`. Prompt the reader to hover and click
corrected and uncorrected spans, inspect selection details and the screen-reader table, switch lane
order, switch scale type, and inspect the warning in the malformed-duration case. Multiple cases may
share a dataset when the documentation identifies them individually. Do not simulate an uncorrected
mode by removing `parentId`, and do not hand-render a second waterfall that duplicates chart logic.

Running-child, running-parent, and completed-edge-below-running-parent datasets are deliberately
excluded until Spec 25 makes running spans valid public input. Add those cases to the running-span
story when Spec 25 lands rather than weakening the Spec 24 build boundary.

### Follow-up — missing-parent reparenting

[Spec 27](./spec-27-partial-trace-reparenting.md) now defines root election, source-preserving
synthetic parentage, visible reachability, malformed-group invalidation, developer warnings,
provenance, interaction/accessibility wording, and focused-subtree boundaries. Those rules supersede
Spec 24's orphan-as-root/all-lanes-visible malformed-input baseline when Spec 27 is implemented;
Spec 24 remains authoritative for clock-skew coordinates on the recovered visible tree.

## Edge cases

| Case | Behavior |
|---|---|
| `childDur > parentDur` | Latency clamps to zero. A left-skewed child moves to the corrected parent start and may overhang to the right. |
| Zero-duration child | Valid duration. If left-skewed, it moves to the parent's temporal midpoint and carries `skewCorrected`. |
| Negative-duration child or parent (`end < start`) | The malformed span is retained unchanged, every incident correction edge is ignored, and one normalization-call warning aggregates all such spans (count, first five IDs, and remaining count). |
| Running child or parent (non-finite pre-projection end) | An edge involving either cannot originate correction. The running span remains structurally attached, is not translated or marked, and is not reparented. A deeper completed edge may still be evaluated independently. Cross-ref Spec 25. |
| Right-side overhang (starts in parent, ends after) | **Out of scope.** The existing `gapSegments` clamp bounds children to the parent for self-time derivation. |
| Missing parent | At the Spec 24 boundary the span remains an orphan root. Spec 27 supersedes this with source-preserving fallback/reparenting before correction. |
| Cyclic `parentId` graph | The direct correction seam terminates via its `visited` guard. Spec 27 omits cycles unreachable from the elected root before correction. |
| Multi-level skew | Grandchild's edge is evaluated against the *corrected* parent, so nested skew resolves independently at each level. |
| Critical intervals ([ADR 0015](../0015-critical-path-consumer-supplied-intervals.md)) | Each interval receives its owning span's own correction offset before projection and clamping, preserving its position within the corrected span. |

## Tests

- `data/normalize.test.ts` imports the internal `correctClockSkew` test seam for transform-contract
  tests and continues to exercise the full pipeline through `normalize()` for projection behavior:
  - **Kibana parity baseline:** port the four explicit `getClockSkew` cases from Kibana commit
    `36c31d600a371` as table-driven coordinate expectations. Keep the expected results local; do not
    import a Kibana checkout or duplicate its helper in test code.
  - **Nested parity:** cover a child recorded before its parent's recorded start, between the
    parent's recorded and corrected starts, and after the corrected parent start. These cases lock
    independent per-span placement and the absence of automatic subtree translation.
  - **Purity/no-op:** empty and unskewed inputs return the original array; unshifted span objects pass
    by reference; input objects and active segments are not mutated.
  - **Identity/order:** corrected output keeps input order and preserves distinct objects with
    malformed duplicate IDs rather than overwriting them in an ID-keyed work map. Assert only
    termination, cardinality, and order; relationship semantics are unspecified for duplicate IDs.
  - **Kibana placement:** child starting before parent →
    `childStart === parentStart + max(parentDur − childDur, 0) / 2` and
    `skewCorrected === true`; parent unchanged.
  - **Independent descendants:** a grandchild uses its recorded coordinates against the corrected
    parent and does not inherit the parent's offset. Assert moved and unmoved nested examples.
  - **Unskewed pass-through:** `child.start >= parent.start` → neither span has `skewCorrected`.
  - **Right-side overhang not corrected:** `child.start >= parent.start, child.end > parent.end` → no change.
  - **Running child edge skipped (Spec 25):** a running child with `child.start < parent.start` does not originate a correction.
  - **Running parent edge skipped (Spec 25):** a running parent does not originate a correction for its children.
  - **Running span remains unchanged (Spec 25):** an edge involving a running participant is skipped; the running span retains its start, explicit active segments, and end sentinel, and carries no `skewCorrected` marker.
  - **Completed edge below running span (Spec 25):** structural descendants are not reparented; a deeper edge whose parent and child are both completed is evaluated independently.
  - **`childDur > parentDur` clamp:** a left-skewed longer child starts exactly at the corrected
    parent start, overhangs right, and carries `skewCorrected`.
  - **Zero duration:** a left-skewed zero-duration child moves to the parent's midpoint.
  - **Negative duration:** malformed spans retain their coordinates and references; all incident
    edges are skipped. Assert exactly one `Logger.warn` per call, singular/plural grammar, the total
    count, at most the first five IDs in input order, and the remaining-count suffix. No warning is
    emitted when all durations are non-negative.
  - **Multi-level cascade:** three-level skew; each level corrected independently against its now-corrected parent.
  - **Cyclic `parentId`:** the direct `correctClockSkew` seam terminates cleanly without mutating or
    losing its input; Spec 27 owns end-to-end visible omission.
  - **Domain shift:** rightward correction can remove a formerly leftmost child from the domain min;
    `project()` recomputes a valid domain from corrected coordinates.
  - **Critical-interval alignment:** corrected-span intervals receive the same total offset in both
    `time` and `linear` modes, retain their duration, and are then clamped normally.
  - **Lane ordering:** correction can reverse two spans' recorded start order; chronological lanes
    and tree-mode sibling ordering follow corrected starts while `correctClockSkew` itself keeps
    input array order.
- `render/tooltip.test.ts`:
  - Corrected spans add the exact `Clock skew: Time adjusted for clock skew` row; uncorrected tooltip
    row count and ordering stay unchanged.
  - `buildTraceEvent` and `buildTraceSelectionDetail` include `skewCorrected: true` only for corrected
    spans while retaining the original `TraceDatum` as `datum`.
- API report: regenerate and verify the optional marker on `TraceElementEvent` and
  `TraceSelectionDetail`, with no change to `TraceDatum` or `TraceSegmentRef`.
- Accessibility integration: the hidden table name and keyboard aria-live announcement mention the
  adjustment only for corrected spans.

## Review (`/review-claudio`)

- Verify each descendant starts its decision from recorded coordinates and receives no automatic
  ancestor translation; only the corrected parent start flows down the DFS.
- Verify the non-negative latency clamp matches the local Kibana golden cases, including a longer
  child that begins at the parent start and overhangs right.
- Verify `skewCorrected` denotes a translation of that individual span and is absent from unchanged
  descendants even when an ancestor moved.
- Verify negative-duration spans and their incident edges pass through without correction; emit one
  bounded, aggregated development warning without turning this stage into a general validator.
- Verify both the `visited` set and corrected-span map are keyed by object reference so the direct
  correction transform terminates and preserves malformed duplicate-ID inputs; do not infer the
  post-Spec-27 visible-output contract from this lower-level guarantee.
- Verify the final `spans.map` preserves input order (not DFS order); lane reindexing and downstream
  callers assume the normalized-span array is in the same order as the pipeline input.
- Verify the tooltip/SR note appears only when `span.skewCorrected`; no change for uncorrected spans.
- Verify both SR paths are covered: the hidden table row and the keyboard aria-live announcement.
- Verify public event and selection-detail payloads expose the optional marker whenever they expose
  corrected timings; their `datum` reference must remain the original `TraceDatum`.
- Verify that `activeSegments` on a shifted span have correct absolute offsets (each `seg.start` and
  `seg.end` incremented by `offset`, not re-zeroed).
- Verify critical intervals use the owning span's own correction offset before re-zeroing and
  clamping.
- Verify that a running edge cannot originate correction, that the running span remains structurally
  attached and unmarked, and that a deeper completed edge can resume independent evaluation.

## Acceptance

- A valid finite trace tree produces the same span coordinates as the Kibana APM TraceWaterfall
  baseline identified in ADR 0022.
- A shorter left-skewed child is centered by non-negative half slack; a longer one starts at its
  corrected parent start and may overhang right.
- Descendants are corrected independently from their recorded coordinates; ancestor translation is
  never inherited automatically.
- The tooltip / SR surface for a corrected span notes "time adjusted for clock skew."
- Click, hover, and rich selection-detail payloads for corrected spans carry `skewCorrected: true`;
  their `datum` remains the original source object.
- Critical intervals remain aligned with their corrected owning spans.
- Chronological and tree sibling ordering reflect corrected rendered starts, not stale recorded starts.
- Unskewed traces render byte-identically to today (no `skewCorrected`, no domain change).
- Negative-duration spans are retained unchanged, their incident correction edges are ignored, and
  a single bounded development warning explains the omission.
- Running spans never originate correction, are not translated or reparented, and carry no
  `skewCorrected`; completed edges below them may be evaluated independently.
- `yarn test trace_chart --runInBand`, `yarn typecheck:src`, and `yarn typecheck:storybook` are green.
- `yarn api:check:local` refreshes the API report for the two public optional markers, followed by a
  clean `yarn api:check`.
- The Storybook dataset knob loads all six documented suites and its markdown describes every case.
  Manual checks confirm expected coordinates, provenance across tooltip/click/hover/selection/SR,
  critical-interval alignment, corrected lane ordering, warning behavior, and the Spec 27 recovery/
  invalidation outcome for malformed topology.
