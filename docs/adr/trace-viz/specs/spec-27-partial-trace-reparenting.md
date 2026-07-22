# Spec 27 — Partial-trace recovery and orphan reparenting

**Status:** Proposed

**Goal:** preserve every supplied span while restoring a readable Kibana-style execution flow for
partial traces. Missing-parent spans are disclosed as orphans; when an unambiguous visible root
exists, they receive a synthetic display parent without changing their recorded `parentId` or source
datum.

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
subtree API. Spec 27 itself exposes no selected-root input and never drops unrelated supplied roots.

## Files

- `packages/charts/src/chart_types/trace_chart/data/types.ts` — add internal orphan provenance.
- `packages/charts/src/chart_types/trace_chart/data/normalize.ts` — add partial-trace recovery after
  filtering and before clock-skew correction; return partial-trace summary data
  (`orphanCount`, `reparentedCount`, `fallbackRootCount`, `unreparentedCount`).
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
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — render the non-blocking partial-trace
  warning and include provenance in keyboard announcements.
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

### Root election

For each partial group:

| Recorded roots | Display-root behavior |
|---|---|
| Exactly one | Use that recorded root. |
| None, at least one orphan | Use the first orphan in normalized input order as the fallback root. It remains `orphaned` but has no `reparentedToSpanId`. |
| More than one | Ambiguous: elect no root, retain every orphan as a top-level lane, and report them as unreparented in the warning. |
| None and no orphan | Malformed cycle/identity graph, not a partial-trace recovery case; retain existing defensive behavior. |

Root election is performed independently per `traceId` group. A caller can therefore render multiple
traces without any synthetic edge crossing trace boundaries.

### Source parent versus display parent

`NormalizedSpan.parentId` and `span.meta.parentId` remain recorded source identity. Add:

```ts
/** Present on every span whose recorded parent is absent from its selected trace group. */
orphaned?: true;

/** Synthetic parent used only by display-topology operations. */
reparentedToSpanId?: string;
```

The canonical display-parent accessor is:

```ts
const displayParentId = span.reparentedToSpanId ?? span.parentId;
```

Use display parentage for:

- tree lane ordering and depth;
- collapse/disclosure topology and active/critical rollup membership;
- clock-skew comparison and placement;
- screen-reader indentation and the displayed-parent explanation.

Use recorded `parentId` for:

- self-time derivation, so a synthetic child does not reduce measured root activity;
- `TraceDatum`, tooltip `datum`, `TraceElementEvent.parentId`, and
  `TraceSelectionDetail.parentId`;
- explicit connections, whose endpoints are consumer-supplied and independent of parentage.

### Transform guarantees

The recovery stage is pure and preserves input cardinality and order. It never mutates a
`TraceDatum`, never rewrites recorded `parentId`, and allocates only orphan spans whose provenance or
display parent changes. An unmodified complete trace returns the original span-array reference.

Duplicate IDs and existing cycles receive no recovery semantics. Traversal remains object-identity
guarded and must terminate without dropping spans.

### Pipeline order

```text
parse → trace selection → non-finite filtering → partial-trace recovery
      → clock-skew correction → projection → lane ordering / collapse
```

Clock-skew correction traverses display parentage. A reparented span is therefore evaluated against
the corrected elected root exactly as in Kibana; it receives `skewCorrected` only if its own
coordinates move. `orphaned`, `reparentedToSpanId`, and `skewCorrected` are independent provenance.

### Warning and per-span disclosure

When any selected group is partial, render a visible DOM warning above the canvas without hiding the
waterfall:

```text
Partial trace: N spans reference missing parents; M displayed under a visible root.
```

Use singular grammar for one span. An elected fallback root contributes to `orphanCount` and
`fallbackRootCount`, but not `reparentedCount` or `unreparentedCount`. When
`unreparentedCount > 0`, append:

```text
K could not be reparented safely.
```

The warning uses `role="status"`, participates in normal layout (not a canvas overlay), and is absent
for complete traces. It is product-visible in every build, not a development-only `Logger.warn`.

For every orphan span:

- tooltip adds `Trace context: Missing parent`;
- a reparented tooltip also adds `Displayed under: <root span name>`;
- the screen-reader name/parent description says either `orphan; displayed under <root>` or
  `orphan; missing parent not reparented`;
- keyboard focus announces the same provenance;
- element and rich selection payloads expose `orphaned` and, when applicable,
  `reparentedToSpanId`.

The recorded missing parent ID remains inspectable through `parentId`/`datum`; no tooltip claims that
the synthetic root was the measured caller.

## Focused and filtered datasets

`traceId` filtering occurs before recovery and is fully supported. Spec 27 does not introduce a
`rootSpanId`, `entryTransactionId`, or subtree-filtering prop. A consumer that supplies a prefiltered
subtree gets recovery against that supplied dataset and the root-election rules above. No span that
survives the chart's existing `traceId` and finite-data filters is dropped merely because it is
outside the elected root's subtree.

A future focused-subtree feature must specify which non-descendants remain visible and must port
Kibana's selected-root ancestor-path guard and tests before exposing a root-selection API. That guard
is not added speculatively while callers cannot select a descendant as the display root.

## Storybook

Add a `Dataset` knob with documented source and expected display parentage:

| Dataset | Expected behavior |
|---|---|
| **Complete trace** | One recorded root, no orphans, no warning or provenance. |
| **Root with genuine orphans** (default) | Two missing-parent spans become direct display children of the root; their existing descendants remain nested below them. Warning reports `N=2, M=2`. |
| **No recorded root** | With three orphans, the first becomes the fallback display root and the other two attach beneath it. Warning accounting is `N=3, M=2, fallbackRootCount=1, unreparentedCount=0`. |
| **Ambiguous recorded roots** | Two recorded roots remain a forest; missing-parent spans stay top-level. Warning reports that none could be reparented safely. |
| **Multiple traces** | Each `traceId` group elects and reparents independently; no cross-trace edge. A `traceId` knob can isolate either group. |
| **Clock skew and collapse** | A reparented orphan is placed against the corrected display root, carries both provenance markers when moved, and joins the root's collapsed visual rollup without reducing source-derived self time. |
| **Malformed identity graph** | Duplicate IDs and a cycle terminate and retain every lane; no semantic reparenting assertion. |

Wire click, hover, and selection callbacks to the Actions panel. Markdown documents recorded
`parentId`, synthetic target, expected lane depth, warning counts, tooltip/SR wording, and correction
coordinates for every case.

## Tests

### Recovery transform

Add focused table-driven tests for:

- complete trace fast path and reference preservation;
- one root plus one/multiple orphans;
- fallback-root election by normalized input order;
- multiple-root ambiguity with no silent target choice;
- per-`traceId` isolation, including identical-looking parent IDs in different groups;
- source `parentId`/`meta` immutability and output order/cardinality;
- descendant preservation beneath a reparented orphan;
- duplicate/cyclic malformed inputs terminate without loss;
- running span with a present parent is not classified as an orphan.

Identify Kibana commits `c96a8839e018`, `36c31d600a371`, and `3843218ee070` in the parity table, but
keep expected structures local and do not import or duplicate Kibana helpers.

### Cross-feature integration

- Clock skew uses `reparentedToSpanId` as the parent relationship and can coexist with
  `skewCorrected`.
- Source-derived self time is unchanged by synthetic children.
- Tree ordering and depth use display parentage; chronological ordering still uses corrected starts.
- Collapse includes reparented display descendants in active and critical rollups.
- Critical intervals move only by their owning span's clock-skew offset.
- Selection, scroll-to-span, pinning, and explicit connections retain span identity.

### Presentation and API

- Complete traces render no partial warning.
- Partial warning singular/plural, fallback-root accounting, and unreparented suffix are exact and
  screen-reader discoverable.
- Tooltip, hidden table, and keyboard announcements distinguish fallback, reparented, and
  unreparented orphans.
- Click/hover and selection detail retain recorded `parentId`/`datum` and expose optional provenance.
- Regenerate the API report; `TraceDatum` and `TraceSegmentRef` remain unchanged.

## Review (`/review-claudio`)

- Verify the implementation never overwrites recorded `parentId` or mutates `TraceDatum`.
- Verify every structural consumer deliberately chooses source or display topology; search all
  `parentId` reads rather than assuming the lane-order change is sufficient.
- Verify self time does not subtract synthetic orphan children.
- Verify clock-skew correction runs after recovery and uses the synthetic display parent.
- Verify multi-trace input cannot create a cross-`traceId` synthetic edge.
- Verify ambiguous roots and malformed cycles retain spans instead of guessing or dropping.
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
- **Malformed duplicate/cycle semantics:** ADR 0027's defensive boundary remains.
- **Running-span synthesis:** Spec 25 owns missing-end behavior; present running parents are not
  orphans.

## Acceptance

- Complete traces are byte-identical and allocate no replacement spans.
- Every missing-parent span is disclosed as an orphan; safely reparented spans render beneath the
  elected root without changing recorded parent identity.
- Partial traces remain visible with an accessible warning and per-span provenance.
- Fallback, ambiguous-root, multi-trace, clock-skew, collapse, and malformed-topology cases match the
  contracts above.
- No synthetic relationship changes source-derived self time or explicit connection semantics.
- The seven documented Storybook datasets load from one knob and expose interaction payloads.
- Targeted trace tests, source/Storybook type checks, lint, API checks, and `/review-claudio` pass.
