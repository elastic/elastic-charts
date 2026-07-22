# Spec 27 — Partial-trace recovery and orphan reparenting

**Status:** Proposed

**Goal:** restore a readable Kibana-style execution flow for partial traces. Missing-parent spans are
disclosed as orphans and receive a synthetic display parent without changing their recorded
`parentId` or source datum. Visible lanes follow Kibana's elected-root reachability rules; malformed
or unreachable input may be omitted or invalidate the selected waterfall as specified below.

See [ADR 0028](../0028-partial-trace-synthetic-parentage.md) for the source-vs-display topology
decision and the deliberate differences from Kibana.

**Depends on:**

- [Spec 1](./spec-1-normalization.md) — trace selection, finite-input filtering, and normalization.
- [Spec 2](./spec-2-self-time.md) — source-topology self-time derivation.
- [Spec 12](./spec-12-accessibility.md) — screen-reader table and keyboard announcements.
- [Spec 15](./spec-15-lane-ordering.md) — tree/forest lane assignment.
- [Spec 21](./spec-21-collapsible-nesting.md) — display-subtree collapse and rollups.
- [Spec 24](./spec-24-clock-skew.md) — corrected placement against the synthetic display parent.
- [ADR 0027](../0027-span-id-uniqueness.md) — unique-ID contract and malformed-input boundary.

## Kibana behavior captured by this spec

The reference implementation is the current `@kbn/apm-ui-shared` TraceWaterfall in the local Kibana
checkout, with the behavior introduced and amended by commits `c96a8839e018`, `36c31d600a371`, and
`3843218ee070`:

1. Empty input has no root and no waterfall.
2. A complete trace uses its recorded root and has no partial warning.
3. A trace with a root and missing-parent spans is partial; genuine orphans are cloned beneath the
   root and marked `isOrphan`.
4. If no root document exists, the first orphan becomes the fallback root and the remaining orphans
   are attached beneath it.
5. Reparented spans participate in normal child sorting and clock-skew correction against the
   synthetic parent.
6. A partial trace remains visible beneath a trace-level warning, and each reparented item exposes an
   orphan explanation.
7. In a focused waterfall, an orphan ancestor of the selected root is not attached beneath that root,
   because doing so would create a cycle; non-ancestor orphans are still attached.

Elastic Charts adopts items 1–6 and records item 7 as a mandatory constraint for any future focused-
subtree API. Kibana removes the fallback root from its orphan list and therefore shows no per-item
orphan marker on it. Elastic Charts deliberately retains `orphaned` source provenance on the fallback
root and uses internal fallback disposition for accurate presentation. Unlike Kibana, the Trace
component does not render the trace-level warning. A dedicated follow-up spec will define aggregate
diagnostics for consuming applications. Spec 27 itself exposes no selected-root input and preserves
source identity for spans that remain visible.

## Files

- `packages/charts/src/chart_types/trace_chart/data/types.ts` — add internal orphan provenance.
- `packages/charts/src/chart_types/trace_chart/data/normalize.ts` — add partial-trace recovery after
  filtering and before clock-skew correction.
- `packages/charts/src/chart_types/trace_chart/data/self_time.ts` — keep derived self time on recorded
  parentage; expose a display-topology children-map seam for other pipeline stages.
- `packages/charts/src/chart_types/trace_chart/data/order_lanes.ts` — use synthetic display parentage
  in tree mode.
- `packages/charts/src/chart_types/trace_chart/data/collapse.ts` — use display parentage for pruning
  and rollup membership.
- `packages/charts/src/chart_types/trace_chart/render/tooltip.ts` — disclose orphan and reparenting
  provenance.
- `packages/charts/src/chart_types/trace_chart/state/selectors/get_screen_reader_data.ts` — identify
  missing recorded parents and synthetic display parents.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — include provenance in keyboard
  announcements; do not render a warning callout.
- `packages/charts/src/specs/settings.tsx` and
  `packages/charts/src/chart_types/trace_chart/trace_api.ts` — expose provenance in element and rich
  selection payloads without changing `TraceDatum` or `TraceSegmentRef`.
- `storybook/stories/trace/29_partial_trace_reparenting.story.tsx` — visual conformance matrix;
  register as `partialTraceReparenting`.

## Public API

No configuration prop is added. Recovery and disclosure are always on for partial traces.

Add these optional-`true`/optional-ID fields to both `TraceElementEvent` and
`TraceSelectionDetail`:

```ts
/** The recorded parent is absent from the selected trace data. */
orphaned?: true;

/** Synthetic display parent used to place this orphan in the waterfall. */
reparentedToSpanId?: string;
```

`parentId` in both payloads remains the recorded source `parentId`. `datum` remains the untouched
`TraceDatum`. Do not add either marker to `TraceDatum`, `TooltipValue`, or `TraceSegmentRef`.
Fallback-root disposition is internal presentation state and is not added to any public payload.

No canvas-indicator prop is committed by this spec. See **Open question: visual ownership** below.

## Contract

### Partial trace and orphan span

Detection runs after `traceId` selection and non-finite span removal, because parentage is meaningful
only within the dataset that can actually render. Spans are partitioned by `traceId`; `undefined` is
one group. Within each group:

- a **recorded root** has no `parentId`;
- an **orphan span** has a `parentId` absent from that group's ID set;
- a group is **partial** when it contains at least one orphan span;
- a supplied running span with a present parent is not an orphan, regardless of its unfinished end.

The overall chart is partial when any group is partial. A parent ID in a different `traceId` group
never satisfies a parent reference; spans without a `traceId` necessarily share one unknown group.
This trace-local boundary applies to every structural parent lookup, including source-topology self
time—not only to orphan detection and display reparenting.

### Root election and visible reachability

Apply Kibana's root-election and reachability behavior independently to every selected `traceId`
group, including the single unknown group for spans without `traceId`:

| Recorded roots | Elected-root behavior |
|---|---|
| Exactly one | Use that recorded root. |
| None, at least one orphan | Use the first orphan in normalized input order as the fallback root. It remains `orphaned` but has no `reparentedToSpanId`. |
| More than one | Use the last recorded root in normalized input order. Earlier roots and anything reachable only from them are omitted from visible lanes. |
| None and no orphan | The group has only malformed/disconnected topology (for example a rootless cycle); render no lanes for that group. |

After attaching genuine orphans to the elected root, traverse depth-first to validate the tree and
compute its reachable ID set. Disconnected cycles, non-elected roots, and their otherwise unreachable
descendants are omitted, matching Kibana. The recovery-stage array retains normalized input order
among surviving spans; it does not expose traversal order as lane order. Reordering the input can
still change which root is elected when a group has multiple roots, and the diagnostics follow-up
must report this condition. This visible-membership decision precedes lane ordering and is invariant
under `laneOrder`: tree mode DFS-orders the surviving per-trace trees, while chronological mode
globally sorts the same surviving spans by corrected start.

Traversal detects duplicate IDs by ID, matching Kibana. If a duplicate ID is encountered within one
group's elected reachable tree, that group is invalid and contributes no visible lanes; other valid
trace groups still render. If the same span ID occurs in more than one selected `traceId` group, the
entire combined result is invalid because selection, collapse, critical intervals, connections, and
scroll commands use chart-global span IDs. Validation occurs after `traceId` filtering, so malformed
groups excluded by an explicit filter do not invalidate the selected trace.

Until the diagnostics follow-up is implemented, every recovery-driven omission or invalidation emits
one aggregated developer warning per normalization call through `Logger.warn`. This includes
non-elected roots and their descendants, disconnected/rootless components, duplicates confined to
unreachable components, group-local invalidation, and chart-wide cross-trace duplicate invalidation.
The warning reports outcome/reason counts and identifies affected `traceId` groups (`undefined` is
reported as the unknown group); group/ID examples are bounded to five plus the number of additional
examples, following the existing malformed-data warning convention. Group-local failures still allow
valid groups to render, while chart-wide failure produces no lanes. Ordinary orphan reparenting that
loses no selected span does not warn. These warnings are temporary developer observability, not DOM
presentation or a substitute application API; the future diagnostics snapshot must report the same
conditions.

When selected input yields no visible lanes because a group is rootless or the combined result is
invalidated, `NormalizeResult.emptyReason` remains undefined. The canvas and time bar stay mounted,
the plot is blank, and neither `no-data` nor `trace-not-found` presentation is reused. This amends
[ADR 0019](../0019-empty-state-ownership.md) without adding a third public empty-state message.

### Source parent versus display parent

`NormalizedSpan.parentId` and `span.meta.parentId` remain recorded source identity. Add:

```ts
/** Present on every span whose recorded parent is absent from its selected trace group. */
orphaned?: true;

/** Synthetic parent used only by display-topology operations. */
reparentedToSpanId?: string;

/** Internal-only: this orphan was elected as its trace group's display root. */
fallbackRoot?: true;
```

The canonical display-parent accessor is:

```ts
const displayParentId = span.reparentedToSpanId ?? span.parentId;
```

`fallbackRoot` never changes parent resolution. It identifies why an orphan with no synthetic parent
is at depth zero and lets presentation distinguish the elected fallback root from synthetically
reparented orphans.

Use display parentage for:

- tree lane ordering and depth;
- collapse/disclosure topology and active/critical rollup membership;
- clock-skew comparison and placement;
- screen-reader indentation and the displayed-parent explanation.

Use recorded `parentId` for:

- self-time derivation within the same `traceId` group, so neither a synthetic child nor a
  cross-trace parent reference reduces measured root activity;
- `TraceDatum`, tooltip `datum`, `TraceElementEvent.parentId`, and
  `TraceSelectionDetail.parentId`;
- explicit connections, whose endpoints are consumer-supplied and independent of parentage.

### Transform guarantees

The recovery stage is pure. It never mutates a `TraceDatum` or rewrites recorded `parentId`, and it
allocates only orphan spans whose provenance or display parent changes. A valid complete trace keeps
the recovery-stage input-array reference.

Visible output cardinality may be lower than selected input cardinality because Kibana reachability
omits non-elected roots, disconnected components, and invalid groups. Traversal must terminate for
cycles and duplicate IDs. Recovery preserves the relative normalized input order of surviving spans;
`orderLanes` remains the single owner of final tree or chronological lane order. This preserves the
existing stable input-order tie break for equal corrected starts.

### Pipeline order

```text
parse → trace selection → non-finite filtering → partial-trace recovery
      → clock-skew correction → projection → lane ordering / collapse
```

Clock-skew correction traverses display parentage. A reparented span is therefore evaluated against
the corrected elected root exactly as in Kibana; it receives `skewCorrected` only if its own
coordinates move. `orphaned`, `reparentedToSpanId`, and `skewCorrected` are independent provenance.

## Implementation steps

1. Add `orphaned`, `reparentedToSpanId`, and internal `fallbackRoot` to `NormalizedSpan`. Add one
   internal `displayParentId(span)` accessor; do not scatter `reparentedToSpanId ?? parentId` across
   consumers.
2. Make shared parent/children topology trace-local. Refactor `buildChildrenMap` to group first by
   `traceId` (including the `undefined` group) and then by parent ID, and accept either recorded or
   display-parent access. Update callers to query children with both the parent's `traceId` and ID so
   an ID found only in another group never forms an edge.
3. Add a pure `recoverPartialTraces(spans)` stage after finite filtering. It must:
   - partition by `traceId` without changing global normalized input order;
   - pre-scan selected IDs and return no spans for a cross-group duplicate;
   - classify recorded roots/orphans within each group, elect the sole/last/fallback root, and clone
     only orphans receiving provenance or synthetic placement;
   - build the group-local display children map, DFS the elected root with an ID-based visitor, and
     invalidate only a group whose reachable traversal encounters a duplicate;
   - retain only object occurrences reached from valid elected roots, but materialize survivors back
     in normalized input order using their clone when one exists;
   - return the original array when no provenance, omission, or invalidation occurred; and
   - aggregate every recovery-driven omission/invalidation into the single bounded `Logger.warn`
     specified above.
4. Run `correctClockSkew` on the recovered array using display topology. Keep source-topology
   `resolveActive` trace-local and recorded-parent-only. Preserve the existing `project()` boundary so
   domain, running-end synthesis, and critical-interval lookup see only surviving spans.
5. Switch `orderLanes`, `collapsibleParentIds`, `collapseLanes`, disclosure counts, and critical
   rollups to trace-local display topology. Do not add a second sorter in recovery; tree/chronological
   order stays in `orderLanes`.
6. Add tooltip, keyboard, and screen-reader wording for reparented and fallback-root orphans. Extend
   click, hover, and rich-selection builders with the two public optional provenance fields while
   retaining recorded `parentId` and source `datum`.
7. Add the Storybook dataset knob and Actions-panel wiring below. Update the existing clock-skew,
   lane-order, collapse, accessibility, and API documentation wording where their original
   all-spans-visible/orphan-as-root contracts are superseded.
8. Add transform, integration, presentation, warning, and API-report coverage from the test matrix
   below; run focused tests first, then source/Storybook type checks, lint, and API checks.

### Per-span disclosure

The Trace component renders no aggregate warning or callout. The consuming application owns wording,
severity, placement, accessibility role, and whether to render aggregate status at all. Spec 27 adds
no aggregate callback; the required diagnostics follow-up below will define a cross-feature seam.

For every orphan span:

- tooltip adds `Trace context: Missing parent`;
- a reparented tooltip also adds `Displayed under: <root span name>`;
- a fallback-root tooltip also adds `Display placement: Used as display root`;
- the screen-reader name/parent description says either `orphan; displayed under <root>` or `orphan;
  used as display root`;
- keyboard focus announces the same provenance;
- element and rich selection payloads expose `orphaned` and, when applicable,
  `reparentedToSpanId`.

The recorded missing parent ID remains inspectable through `parentId`/`datum`; no tooltip claims that
the synthetic root was the measured caller.

## Focused and filtered datasets

`traceId` filtering occurs before recovery and is fully supported. Spec 27 does not introduce a
`rootSpanId`, `entryTransactionId`, or subtree-filtering prop. A consumer that supplies a prefiltered
subtree gets recovery against that supplied dataset and the root-election/reachability rules above.
Spans outside the elected root's reachable tree may be omitted exactly as they are in Kibana.

A future focused-subtree feature must specify which non-descendants remain visible and must port
Kibana's selected-root ancestor-path guard and tests before exposing a root-selection API. That guard
is not added speculatively while callers cannot select a descendant as the display root.

## Storybook

Add a `Dataset` knob with documented source and expected display parentage:

| Dataset | Expected behavior |
|---|---|
| **Complete trace** | One recorded root, no orphans and no provenance. |
| **Root with genuine orphans** (default) | Two missing-parent spans become direct display children of the root; their existing descendants remain nested below them. |
| **No recorded root** | With three orphans, the first becomes the fallback display root and the other two attach beneath it. |
| **Multiple recorded roots** | The last recorded root becomes the reparent target; earlier roots and their exclusive descendants are omitted. Reordering the source demonstrates the order-dependent elected root. |
| **Multiple traces** | Each `traceId` group elects and reparents independently; a malformed group is omitted while valid groups remain visible. A parent ID resolving only in another trace remains orphaned. A duplicate ID across selected trace groups invalidates the entire combined result. The `traceId` knob can isolate a valid group. |
| **Clock skew and collapse** | A reparented orphan is placed against the corrected display root, carries both provenance markers when moved, and joins the root's collapsed visual rollup without reducing source-derived self time. |
| **Malformed identity graph** | A reachable same-group duplicate invalidates only that trace group; a disconnected cycle is omitted; a rootless cycle yields no lanes for its group; duplicate IDs across selected trace groups invalidate the entire combined result. |

Each knob value must document and load these concrete cases (one dataset may render several labeled
panels when the outcomes cannot coexist in one chart):

- **Complete trace:** include an ordinary completed subtree and a running span whose recorded parent
  is present; neither receives orphan provenance or a recovery warning. Toggle `laneOrder` to show
  identical visible membership and different ordering only.
- **Root with genuine orphans:** include two direct orphans, a recorded descendant beneath one
  orphan, and a child whose apparent parent ID exists only in another trace group. Show that only the
  missing-parent spans receive provenance and that source self time does not cross groups or subtract
  the synthetic root edge.
- **No recorded root:** use three top-level missing-parent spans, each with a different start, so the
  first by source order—not earliest start—visibly becomes fallback root. Include a source reorder
  variant and document the changed fallback.
- **Multiple recorded roots:** show last-root election, an earlier root plus descendants omitted, an
  orphan attached to the elected root, and a reordered variant. Include a duplicate confined to an
  omitted root component to demonstrate non-fatal omission plus the recovery warning.
- **Multiple traces:** panel A combines valid Trace A with a reachable-duplicate malformed Trace B
  and proves only B is dropped; panel B contains a parent ID resolvable only in another group; panel C
  filters to A and proves excluded malformed groups cannot invalidate it. Include an unknown-
  `traceId` panel where logical traces coalesce into one group, last-root reachability applies, and
  omissions warn.
- **Clock skew and collapse:** include a left-skewed reparented orphan, an unchanged reparented
  orphan, a negative-duration span whose correction is ignored by Spec 24, and a collapsible elected
  root. Document corrected coordinates, independent provenance, source self time, rollup membership,
  and both recovery/negative-duration console warnings where applicable.
- **Malformed identity graph:** separate labeled panels cover a reachable same-group duplicate
  (group-local invalidation), a same-group duplicate only in an unreachable component (non-fatal
  omission), a disconnected cycle beside a valid elected tree, a rootless cycle (blank plot/time bar
  retained), and a cross-trace duplicate (whole combined result invalid). Document exact warning
  scope and which conditions are reserved for future diagnostics.

Wire click, hover, and selection callbacks to the Actions panel. Markdown documents recorded
`parentId`, synthetic target, expected lane depth, orphan dispositions, tooltip/SR wording, and correction
coordinates for every case.

The Actions panel must continue to show orphan/reparenting provenance independently of any future
visual-indicator setting.

## Required follow-up: trace data diagnostics

After Spec 27 review, write a dedicated feature spec for an application-facing diagnostics API. Do
not add a partial-trace-specific callback in this spec. Preserve these candidates for that review:

```ts
interface TraceDataDiagnostics {
  partialTrace?: {
    affectedTraceCount: number;
    orphanCount: number;
    reparentedCount: number;
    fallbackRootCount: number;
  };
  clockSkew?: {
    correctedSpanCount: number;
    ignoredNegativeDurationSpanCount: number;
  };
  identity?: {
    /** Unique ID values that occur on more than one selected span. */
    duplicateSpanIds: string[];
    /** Duplicates whose occurrences cross selected trace groups and invalidate the whole result. */
    crossTraceDuplicateSpanIds: string[];
  };
  topology?: {
    invalidTraceCount: number;
    omittedSpanCount: number;
    multipleRootTraceCount: number;
  };
}

onDataDiagnosticsChange?: (diagnostics: TraceDataDiagnostics) => void;
```

The follow-up must evaluate a complete immutable snapshot versus feature-specific callbacks and cover
the eventual concern inventory: missing parents/reparenting, applied clock-skew correction, negative
durations, discarded non-finite spans/segments, duplicate IDs, parent cycles, and unresolved critical
interval or connection references. It must report group-local invalidation, whole-result invalidation
for cross-trace duplicate IDs, same-group duplicates in non-elected or otherwise unreachable
components, spans omitted by elected-root reachability, rootless/disconnected cycles, the
unknown-`traceId` group, and order-dependent last-root election for multiple-root groups.
Running spans are valid state. Command/configuration errors such as unknown scroll IDs or collapse in
chronological mode remain developer warnings only. Recovery-driven omission and malformed-data
invalidation also emit the temporary developer warning required above, but still belong in the future
application-facing diagnostics snapshot. Duplicate-ID diagnostics must report the unique duplicated
ID values, not only a count, so consumers can identify the malformed records. No candidate name,
shape, firing semantics, or implementation is accepted by Spec 27.

## Open question: visual ownership

Should successfully reparented spans receive a dedicated visual indicator, and should that indicator
belong to the Trace component or to the consuming application? Provenance delivery is not open:
`onElementOver`, `onElementClick`, and `onSelectionChange` always expose `orphaned` and, when
applicable, `reparentedToSpanId`, while tooltip and screen-reader disclosure remain available.

If the Trace component owns a built-in canvas indicator, it should default to visible with an
explicit opt-out and mark only spans with `reparentedToSpanId`. Its representation, placement, hit
target, theme tokens, and public prop name remain undecided. It must not reuse dashed total lines,
selection outlines, or critical-path lines, which already have established meanings. If visual
decoration remains an application concern, Spec 27 adds no canvas-indicator prop or renderer pass.

## Tests

### Recovery transform

Add focused table-driven tests for:

- complete trace fast path and reference preservation;
- one root plus one/multiple orphans;
- fallback-root election by normalized input order;
- fallback root retains `orphaned`, receives internal `fallbackRoot`, and has no
  `reparentedToSpanId`;
- multiple-root election uses the last normalized root, reparents orphans, and omits non-elected
  roots plus their exclusively reachable descendants in both single- and multi-trace views;
- per-`traceId` isolation, including identical-looking parent IDs in different groups;
- a parent ID that resolves only in another trace is still orphaned and does not affect that other
  trace's source-derived self time;
- source `parentId`/`meta` immutability for visible spans;
- descendant preservation beneath a reparented orphan;
- reachable same-group duplicates invalidate only that group while valid groups render;
- cross-trace duplicate IDs invalidate the entire selected combined result;
- group-local and chart-wide invalidation contribute bounded group/ID examples to the single
  aggregated recovery `Logger.warn`, and valid input emits no recovery warning;
- multiple-root, disconnected, rootless, and unreachable-duplicate omissions join the same bounded
  recovery warning; ordinary lossless orphan reparenting emits none;
- all-invalid/rootless selected input keeps `emptyReason` undefined and follows the mounted blank-
  plot path rather than either existing empty-state message;
- disconnected and rootless cycles terminate and are omitted;
- recovery uses DFS for validation/reachability but preserves normalized input order among survivors;
  tree and chronological ordering remain `orderLanes` responsibilities, including stable equal-start
  ties;
- multiple roots and omitted reachable components are documented for the future diagnostics report;
- running span with a present parent is not classified as an orphan.

Identify Kibana commits `c96a8839e018`, `36c31d600a371`, and `3843218ee070` in the parity table, but
keep expected structures local and do not import or duplicate Kibana helpers.

### Cross-feature integration

- Clock skew uses `reparentedToSpanId` as the parent relationship and can coexist with
  `skewCorrected`.
- Source-derived self time is unchanged by synthetic children.
- Tree ordering and depth use display parentage; chronological ordering globally sorts the same
  reachable spans by corrected start and cannot restore omitted or invalid spans.
- Collapse includes reparented display descendants in active and critical rollups.
- Critical intervals move only by their owning span's clock-skew offset.
- Selection, scroll-to-span, pinning, and explicit connections retain span identity.

### Presentation and API

- The Trace component renders no built-in partial-trace warning or callout.
- No aggregate diagnostics callback is introduced; that API belongs to the required follow-up spec.
- Recovery-driven omissions and invalid topology emit only the temporary bounded developer warning
  specified above.
- Tooltip, hidden table, and keyboard announcements distinguish fallback and reparented orphans
  without exposing `fallbackRoot` in public payloads.
- Click/hover and selection detail retain recorded `parentId`/`datum` and expose optional provenance.
- Interaction payload provenance is invariant under any future visual-indicator setting.
- Regenerate the API report; `TraceDatum` and `TraceSegmentRef` remain unchanged.

## Review (`/review-claudio`)

- Verify the implementation never overwrites recorded `parentId` or mutates `TraceDatum`.
- Verify every structural consumer deliberately chooses source or display topology; search all
  `parentId` reads rather than assuming the lane-order change is sufficient.
- Verify self time does not subtract synthetic orphan children.
- Verify clock-skew correction runs after recovery and uses the synthetic display parent.
- Verify multi-trace input cannot create a cross-`traceId` synthetic edge.
- Verify last-root election, reachable-only output, group-local invalidation, and whole-result
  invalidation for cross-trace duplicate IDs match the contracts above.
- Verify `laneOrder` changes ordering only: tree and chronological modes receive identical visible
  span membership and invalidation warnings.
- Verify recovery traversal order does not leak into its output array or chronological equal-start
  tie ordering.
- Verify the single recovery warning is bounded, identifies omission/invalidation scope and reasons,
  and is not emitted for valid data or lossless orphan reparenting.
- Verify global and per-span provenance agree across visual, tooltip, event, selection, keyboard, and
  screen-reader surfaces.
- Compare parity cases against the cited Kibana commits, especially the 2026 ancestor-cycle fix.

## Non-goals

- **Focused-subtree API:** no `rootSpanId`/`entryTransactionId` prop is added; visibility semantics
  require a separate feature decision.
- **Fetching missing spans:** the chart is a pure visualization and performs no data retrieval.
- **Repairing source telemetry:** source `parentId` and `TraceDatum` remain untouched.
- **Inferring parents by time/service:** only an unambiguous elected root is used; no heuristic causal
  matching is attempted.
- **Diagnostics API/UI:** application-facing reporting and presentation of omitted/invalid groups and
  cross-trace identity failures belongs to the dedicated follow-up spec; Spec 27 adds only temporary
  developer warnings for otherwise unexplained invalidation.
- **Running-span synthesis:** Spec 25 owns missing-end behavior; present running parents are not
  orphans.

## Acceptance

- Complete traces are byte-identical and allocate no replacement spans.
- Every visible missing-parent span is disclosed as an orphan; safely reparented spans render beneath
  the elected root without changing recorded parent identity.
- Reachable partial traces expose per-span provenance unless their trace group is invalidated;
  aggregate diagnostics and warning presentation are deferred to the dedicated follow-up feature.
- Group-local and chart-wide invalidation emit bounded developer warnings without adding a DOM
  callout or application callback.
- Non-fatal elected-root/reachability omissions use the same warning contract; lossless orphan
  reparenting stays quiet.
- Fallback, Kibana-style multiple-root reachability, multi-trace, clock-skew, collapse, and
  malformed-topology cases match the contracts above.
- No synthetic relationship changes source-derived self time or explicit connection semantics.
- The seven documented Storybook datasets load from one knob and expose interaction payloads.
- Targeted trace tests, source/Storybook type checks, lint, API checks, and `/review-claudio` pass.
