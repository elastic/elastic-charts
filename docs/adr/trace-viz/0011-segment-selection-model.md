# ADR 0011 — Segment selection model

**Status:** Accepted (Spec 13)

## Context

Spec 13 adds segment-level selection to the trace waterfall: left-clicking an active or waiting segment
highlights it; double-clicking selects the whole span; Shift/Ctrl/Cmd-click multi-selects; clicking
empty space clears. The feature must integrate with the existing self-managed interaction model (ADR
0004), the right-click pin tooltip (Spec 10), and the Spec 12 keyboard navigation without introducing
redux selectors or colliding with existing gestures.

Several decisions here are non-obvious, hard to reverse, and the result of genuine trade-offs.

## Decision 1: Self-managed state, not redux

A `selection` instance field on `TraceComponent` — consistent with ADR 0004 and the `hoverIndex`,
`pinnedIndex`, `focusedLaneIndex` precedents. No new selectors; selection does not pass through the
redux store. The snapshot-style redux pipeline is not compatible with sub-frame state that must be
reflected in the next canvas rAF draw.

## Decision 2: Controlled perform-and-fire (cross-reference ADR 0007)

When `selection` is supplied as a prop, it is the render source of truth (controlled mode); when
omitted, the local instance field is used (uncontrolled). In both cases, gestures **always** execute
and fire `onSelectionChange` — the parent decides whether to update the prop. This is the same model
as `focusDomain` (ADR 0007).

**Rejected: fully-controlled** (prop vetoes gestures). Same rationale as ADR 0007: a chart that goes
inert while the parent handles the event is unusable in composition setups where the parent wants to
relay without vetoing.

## Decision 3: Asymmetric API — thin refs in, rich details out

The controlled **`selection` prop** is identity-only — an array of `TraceSegmentRef`:

```ts
interface TraceSegmentRef {
  spanId: string;
  region: 'span' | 'active' | 'waiting';
  /** 0-based index into span.activeSegments or waitingSegments(); -1 when region === 'span'. */
  segmentIndex: number;
}
type TraceSelection = TraceSegmentRef[];
```

This is intentionally thin: consumers can round-trip the callback's `next` value directly back into the
prop without constructing anything. They never know lane indices.

The **`onSelectionChange` callback** is richer:

```ts
onSelectionChange?: (next: TraceSelection, details: TraceSelectionDetail[]) => void;
```

`TraceSelectionDetail` carries all the data the tooltip shows (span name, total duration, self time,
start offset, `datum` with `TraceDatum.meta`) plus `region`, `segmentIndex`, and — when
`region !== 'span'` — `segmentStart`, `segmentEnd`, `segmentDuration`, and `segmentOffset`, satisfying
the "all the details like tooltips" requirement without the consumer re-deriving durations.

**Rejected: symmetric thin-thin.** `onSelectionChange` would require the caller to look up segment
details themselves, adding boilerplate at every consumer callsite and defeating the purpose.

**Rejected: symmetric rich-rich.** Forcing consumers to construct full `TraceSelectionDetail` objects
to drive the controlled prop is awkward — they have identity, not pre-computed durations.

## Decision 4: `spanId`-keyed refs, not lane indices

Selection refs identify spans by their `id` field, not by their 0-based position in the sorted lane
array. Lane indices shift when data changes; consumers don't know them. The render layer resolves
`spanId → laneIndex` once via a `Map` built from the already-sorted span array.

This makes the prune-on-refresh algorithm cheap: filter `selection` for refs whose `spanId` still
exists in the new span array and whose `segmentIndex` is still in range. Valid refs survive streaming
data refreshes. This contrasts with the pin (cleared on any data change) — pin holds a lane index and
pixel anchor both of which become invalid; selection holds identity only.

## Decision 5: Waiting segments materialized on demand

Waiting gaps (`pickRegion` region `'waiting'`) are **not stored** on `NormalizedSpan`. They are
computed as the complement of `activeSegments` within `[start, end]` using the same interval
subtraction already in `selfTimeSegments` (see `data/self_time.ts`). A `waitingSegments(span)` helper
is exported alongside `resolveActive`. This makes waiting segments addressable and highlightable
(symmetric with active segments) without bloating the normalized form.

## Decision 6: Single-vs-double-click debounce

A short timer (~250 ms, matching the OS double-click window) defers applying the single-segment
selection so that a double-click resolves to exactly one whole-span selection and fires
`onSelectionChange` **once** per gesture (not once for the first click and then again for the pair).

`onElementClick` (Spec 7) continues to fire immediately on every raw click, unchanged. The two
channels are orthogonal: `onElementClick` is a generic element event; `onSelectionChange` is
selection-state management.

**Rejected: accept a transient double-fire (no debounce).** The double-callback noise would require
every consumer to deduplicate or guard, moving complexity outward.

## Decision 7: Independent identity-toggled refs; no auto-conversion

The selection set holds refs keyed by exact identity (`spanId` + `region` + `segmentIndex`).
Shift/Ctrl/Cmd-click adds/removes one ref. Double-click adds/replaces with the whole-span ref
(`region: 'span'`, `segmentIndex: -1`). A span-level ref and per-segment refs of the same span may
coexist in the set; the renderer deduplicates overlapping highlight outlines (the whole-span extent
subsumes its segment extents visually).

**Rejected: span ref subsumes per-segment refs.** Selecting a span would have to silently remove
per-segment refs; un-selecting the span would have to decide which per-segment refs to restore. More
rules, more edge cases; no clear user benefit over the dedup approach.

## Decision 8: Selection ≠ tooltip pin

Selection is a stroke-outline highlight and a callback — it does **not** open or hold a persistent
tooltip. Detail-on-demand is already served by hover tooltips (Spec 7) and the right-click pin (Spec
10). Wiring selection to also pin would create two competing sticky-detail affordances and conflate
"I want to note this segment" with "I want to read its full details".

Future option: the caller can observe `onSelectionChange` and call the pin API (Spec 10 `pinTooltip`)
themselves if they want pin-on-select behavior.

## Consequences

- `TraceSegmentRef` and `TraceSelectionDetail` become part of the public API; their shapes must be
  stable across minor versions.
- The render layer gains a new geometry field (resolved selection) and a new draw pass (stroke
  outlines). Both must be consistent with the frozen `draw(ctx, geom, style)` contract (ADR 0001).
- The `waitingSegments` helper is exported and tested independently; `pickRegion` is extended to
  return `segmentIndex` for `'waiting'` hits — a backward-compatible extension since the field was
  already present (`-1` for non-active) on `PickResult`.
- The debounce timer must be cancelled on `componentWillUnmount` and reset on every mousedown (so a
  rapid click-drag does not trigger a spurious selection on release).
