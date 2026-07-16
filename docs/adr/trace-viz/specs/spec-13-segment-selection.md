# Spec 13 — Segment selection

**Goal:** left-click an active or waiting segment to select and highlight it; double-click a span to
select all its segments; Shift/Ctrl/Cmd-click to accumulate a multi-selection; click empty canvas
space to clear. Selection is exposed via an `onSelectionChange` callback (rich detail) and an optional
controlled `selection` prop (thin identity refs). See [ADR 0011](../0011-segment-selection-model.md).

**Depends on:**
- [Spec 7](./spec-7-tooltip-events.md) — `pickRegion` and `onElement*` callbacks in place.
- [Spec 10](./spec-10-pinnable-tooltip.md) — pin lives on right-click; left-click is free for
  selection.
- [Spec 12](./spec-12-accessibility.md) — lane-highlight render pass (`focusedLaneBackground`) exists;
  keyboard `Enter`/`Space` and `Escape` handling is wired. Spec 13 extends both.

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — export `TraceSegmentRef`,
  `TraceSelection`, and `TraceSelectionDetail`; add `selection?: TraceSelection` and
  `onSelectionChange?: (next: TraceSelection, details: TraceSelectionDetail[]) => void` to `TraceSpec`.
- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add `selectedSegmentStroke: Color`
  and `selectedSegmentStrokeWidth: number` to `TraceStyle`; add a resolved-selection field
  `resolvedSelection: Array<{ laneIndex: number; region: 'span' | 'active' | 'waiting'; segmentIndex: number }>`
  to `TraceGeometry` (keeps the frozen `draw(ctx, geom, style)` contract — ADR 0001).
- `packages/charts/src/chart_types/trace_chart/data/self_time.ts` — export
  `waitingSegments(span: NormalizedSpan): { start: number; end: number }[]` using the interval
  subtraction already in `selfTimeSegments`.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — (a) extend `pickRegion`
  to set `segmentIndex` into `waitingSegments()` when `region === 'waiting'`; (b) add a
  selection-highlight pass after all lane content: for each resolved selection entry whose lane is in
  the visible window, draw a themed stroke outline around the segment's clamped pixel rect (or the
  whole `[start, end]` extent for `region: 'span'`), layered on top.
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — accept `selection: TraceSelection`
  as a parameter; build a `spanId → laneIndex` Map from the sorted spans; resolve and filter
  (prune out-of-range refs); populate `resolvedSelection` in the returned `TraceGeometry`.
- `packages/charts/src/chart_types/trace_chart/render/tooltip.ts` — extend
  `buildTraceTooltipInfo` to include waiting-segment duration, offset, and ordinal rows when
  `region === 'waiting'` (symmetric with the existing active-segment rows). Extract the segment-detail
  builder into a shared helper used by both `buildTraceTooltipInfo` and `buildTraceSelectionDetail`.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — add `selection` instance field
  (type `TraceSelection`); `clickTimer: ReturnType<typeof setTimeout> | null`; `getEffectiveSelection()`
  helper; extend `handleCanvasClick` for single-click replace/modifier-toggle; add `dblclick`
  handler; empty-click clears; build `TraceSelectionDetail[]` and fire `onSelectionChange`; prune
  stale refs (keep valid) in `componentDidUpdate` when `traceSpec.data` changes; pass selection into
  `buildGeometry`; schedule a canvas redraw on selection change; extend Escape to also clear
  selection; extend Spec 12 `Enter`/`Space` handler to make a whole-span selection.
- `packages/charts/src/utils/themes/theme.ts` and the six theme files — add
  `selectedSegmentStroke` and `selectedSegmentStrokeWidth` to the `trace:` block.
- `storybook/stories/trace/17_segment_selection.story.tsx` — new story; register in
  `trace.stories.tsx`.

## Contract

### Public types (trace_api.ts)

```ts
/** Identity of one selected segment (thin — used in the controlled `selection` prop). */
export interface TraceSegmentRef {
  spanId: string;
  /** 'span' = whole span selected (double-click). 'active' | 'waiting' = one segment. */
  region: 'span' | 'active' | 'waiting';
  /** 0-based index into span.activeSegments or waitingSegments(). -1 when region === 'span'. */
  segmentIndex: number;
}

/** Array of selected refs. Empty = nothing selected. */
export type TraceSelection = TraceSegmentRef[];

/**
 * Rich per-selection-entry detail fired via `onSelectionChange`. Carries all tooltip-equivalent
 * data so consumers don't need to re-derive durations.
 */
export interface TraceSelectionDetail {
  spanId: string;
  name: string;
  parentId?: string;
  traceId?: string;
  start: number;   // span start, rezeroed in 'linear' mode
  end: number;     // span end, same caveat
  duration: number;
  selfTime: number;
  datum: TraceDatum;
  region: 'span' | 'active' | 'waiting';
  segmentIndex: number;
  // Present when region !== 'span':
  segmentStart?: number;
  segmentEnd?: number;
  segmentDuration?: number;
  /** Offset of the segment's start from the trace domain start, in ms. */
  segmentOffset?: number;
}
```

### Gesture semantics

| Gesture | Result |
|---|---|
| Left-click on active/waiting segment | replace selection with `[ref]` |
| Shift / Ctrl / Cmd + left-click on segment | toggle `ref` in the set |
| Left-click on empty region / gutter / outside lanes | clear selection (`[]`) |
| Double-click on span (any region) | replace with whole-span ref `{ spanId, region:'span', segmentIndex:-1 }`; modifier toggles into set |
| Modifier + double-click | toggle whole-span ref into set |
| Enter / Space (Spec 12 keyboard nav) | same as double-click on the focused lane (whole-span selection) |
| Escape | clear selection (also clears focused lane + unpin, per Spec 12/10) |

**Debounce:** a `clickTimer` (≤ 250 ms) defers the single-segment selection commit so that the second
click of a double-click cancels the pending single-selection and replaces it with the whole-span
selection. `onSelectionChange` fires once per gesture. `onElementClick` (Spec 7) fires immediately on
every raw click, unchanged — the two channels are orthogonal.

**Modifier detection:** `e.shiftKey || e.ctrlKey || e.metaKey` (covers Windows Ctrl and macOS Cmd).

### Selection identity

Two refs are the same when `spanId`, `region`, and `segmentIndex` all match. Toggle uses this
identity test (`Array.prototype.findIndex`).

### Selection lifecycle (uncontrolled)

On `traceSpec.data` change (`componentDidUpdate`): filter `selection` to keep only refs whose `spanId`
still exists in the new pipeline result and whose `segmentIndex` is in range for the new span.
Survivors are kept unchanged; removed refs are dropped. If any refs were dropped, fire
`onSelectionChange` with the pruned set + its details.

On `traceId` / `xScaleType` / `format` change (`viewKey` change): clear selection entirely (stale
domain — mirrors the pin and view-reset behavior).

### Render (canvas2d_renderer.ts)

The selection-highlight pass runs **after** all lane content (fills, gutter labels). For each entry in
`geom.resolvedSelection`:

1. If the lane index is outside the visible window (`[firstLane, lastLane]`), skip.
2. Compute the highlight extent:
   - `region: 'active'` → the active segment's pixel rect (same clamp as the fill pass).
   - `region: 'waiting'` → the waiting segment's pixel rect (derived from `waitingSegments()`).
   - `region: 'span'` → the span's full `[start, end]` extent clamped to the plot.
3. Draw a stroke rect with `selectedSegmentStroke` / `selectedSegmentStrokeWidth`. No fill —
   preserves the underlying colorBy fill (ADR 0006 color encoding must not be distorted by selection).
4. If two selection entries produce overlapping rects (e.g. a span ref and a segment ref of the same
   span), they both render; the outer span outline is drawn on top.

### waitingSegments (data/self_time.ts)

```ts
export function waitingSegments(span: NormalizedSpan): { start: number; end: number }[] {
  // Complement of activeSegments within [span.start, span.end], same algorithm as selfTimeSegments
  // but with the roles of "parent" and "children union" swapped: activeSegments are the "covered"
  // intervals and the gaps become the result.
  return selfTimeSegments(span.start, span.end, span.activeSegments.map(s => ({
    id: '', name: '', start: s.start, end: s.end, parentId: undefined,
    traceId: undefined, activeSegments: [], meta: span.meta,
  })));
  // Alternatively: inline the gap-derivation using the same sorted-interval loop without the
  // NormalizedSpan wrapper — prefer whichever avoids unnecessary object allocation.
}
```

*(The exact implementation should inline the gap loop rather than constructing fake `NormalizedSpan`
objects. The point is to reuse the interval arithmetic, not the full function signature.)*

### pickRegion extension

When `region === 'waiting'`, set `segmentIndex` to the index into `waitingSegments(span)` where `t`
falls. If no waiting segment contains `t` (can happen with degenerate data), set `segmentIndex = -1`.
This is a backward-compatible extension: `segmentIndex` was already `-1` for non-active hits.

### buildGeometry extension

```ts
export function buildGeometry(
  spans: NormalizedSpan[],
  canvasSize: Size,
  focusDomain: { min: number; max: number },
  scrollOffset: number,
  style: TraceStyle,
  xScaleType: 'time' | 'linear',
  domain: { min: number; max: number },
  selection: TraceSelection,  // ← new parameter
): TraceGeometry {
  // ... existing logic ...
  const spanIdToLane = new Map(spans.map((s, i) => [s.id, i]));
  const resolvedSelection = selection
    .map(ref => {
      const laneIndex = spanIdToLane.get(ref.spanId);
      if (laneIndex === undefined) return null;
      const span = spans[laneIndex];
      if (!span) return null;
      if (ref.region === 'active' && ref.segmentIndex >= span.activeSegments.length) return null;
      if (ref.region === 'waiting' && ref.segmentIndex >= waitingSegments(span).length) return null;
      return { laneIndex, region: ref.region, segmentIndex: ref.segmentIndex };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  return { ...existingGeom, resolvedSelection };
}
```

## Steps

1. Export `waitingSegments` from `data/self_time.ts`.
2. Export `TraceSegmentRef`, `TraceSelection`, `TraceSelectionDetail` from `trace_api.ts`; add
   `selection` and `onSelectionChange` to `TraceSpec`.
3. Add `selectedSegmentStroke` and `selectedSegmentStrokeWidth` to `TraceStyle` (render/types.ts) and
   to all six theme files with sensible defaults (e.g. EUI primary color, 2 px stroke).
4. Add `resolvedSelection` to `TraceGeometry` (render/types.ts).
5. Extend `buildGeometry` (render/geometry.ts) to accept and resolve `selection`.
6. Extend `pickRegion` (canvas2d_renderer.ts) to set `segmentIndex` for `'waiting'` hits.
7. Add the selection-highlight draw pass to `draw()` (canvas2d_renderer.ts).
8. Extend `buildTraceTooltipInfo` (render/tooltip.ts) with waiting-segment rows; extract the
   segment-detail builder used by `TraceSelectionDetail`.
9. Wire all selection state + event handling in `trace_chart.tsx`:
   - Add `selection`, `clickTimer`, `getEffectiveSelection`.
   - Extend `handleCanvasClick` for single-click replace / modifier toggle.
   - Add `dblclick` handler.
   - Clear on empty-click.
   - Prune in `componentDidUpdate`.
   - Cancel `clickTimer` in `componentWillUnmount`.
   - Pass selection into `buildGeometry`; redraw canvas on change.
   - Extend `Escape` and `Enter`/`Space`.
10. Author `17_segment_selection.story.tsx`; register in `trace.stories.tsx`.

## Storybook

`storybook/stories/trace/17_segment_selection.story.tsx`:

- Demo 1 (uncontrolled): click active segment → highlight; click waiting gap → highlight; Shift-click
  another → multi-select outline; double-click span → whole-span outline; click empty → clear.
- Demo 2 (controlled): external buttons that set `selection` from outside; `onSelectionChange`
  logged via Storybook actions (both `next` thin refs and `details` rich array).
- Knob: `showTooltipOverEmpty` to contrast empty-click behavior.
- Instructions panel noting Shift/Ctrl/Cmd multi-select, double-click, Esc.

## Tests

- `waitingSegments`: no active segments → one gap = full span; full active → no gaps; two
  non-overlapping active → one gap between them; overlapping active → gaps from merged union.
- `pickRegion` waiting `segmentIndex`: pointer inside first waiting gap → `{ region:'waiting', segmentIndex:0 }`;
  pointer inside second gap → `{ segmentIndex:1 }`; pointer inside active segment → unchanged (`region:'active'`).
- Click replace: click segment → `selection = [ref]`; previous selection is cleared.
- Modifier toggle add: Shift-click second segment → `selection = [ref1, ref2]`.
- Modifier toggle remove: Shift-click already-selected segment → `selection = [ref1]` (removed).
- Double-click: `selection = [{ spanId, region:'span', segmentIndex:-1 }]`.
- Modifier double-click: toggles whole-span ref into / out of set.
- Empty-click: `selection = []`.
- Debounce: single-click fires `onSelectionChange` once, after timer; double-click cancels the timer
  and fires `onSelectionChange` once with the whole-span ref.
- Controlled prop: `selection` prop is used as render source of truth; gestures still fire
  `onSelectionChange` with the correct `next`.
- Prune on data change: a ref whose `spanId` no longer exists is removed; one that still exists is
  kept; `onSelectionChange` fires with the pruned set if any were removed.
- Clear on view change: `traceId` change → `selection = []`.
- Rich details: `onSelectionChange` details entry for an active segment carries `segmentStart`,
  `segmentEnd`, `segmentDuration`, `segmentOffset`, and `datum.meta`.
- Highlight pass: stroke rect drawn only for lanes in the visible window; nothing drawn when
  `resolvedSelection` is empty.
- Enter key: whole-span ref added for the focused lane; `onSelectionChange` fires.
- Escape: selection cleared; `onSelectionChange` fires if selection was non-empty.
- `clickTimer` cancelled on unmount: no setState after unmount.

## Review (`/review-claudio`)

- Verify the `clickTimer` is always cancelled before it is re-set (no leaked timers on rapid clicks).
- Verify the debounce interacts correctly with drag: a pan-then-release (`dragMoved = true`) must
  cancel the pending single-click timer without committing a selection.
- Verify `waitingSegments` handles a span where `activeSegments` covers the full `[start, end]`
  (empty result, no highlight attempt).
- Verify `resolvedSelection` is recomputed by `buildGeometry` only when selection or spans change —
  not on every rAF frame (selection travels through `buildGeometry` which is called every frame;
  verify the `spanId → lane` Map is not re-built every frame — hoist to the caller or memoize).
- Verify modifier key detection covers both `ctrlKey` and `metaKey` (Windows and macOS).
- Verify no XSS when span name / `datum.meta` values flow into `TraceSelectionDetail` (use typed
  fields, not dynamic HTML injection).
- Verify `onSelectionChange` is not called with the same selection identity twice in a row (guard
  with a shallow equality check before firing — mirror the `lastFiredDomain` echo suppression in ADR
  0007).

## Acceptance

- Left-clicking an active or waiting segment shows a stroke outline on that segment and fires
  `onSelectionChange` with the correct thin ref and rich detail.
- Double-clicking a span shows a stroke outline spanning its full `[start, end]` extent and fires
  `onSelectionChange` with a `region:'span'` ref.
- Shift/Ctrl/Cmd-clicking accumulates refs; clicking empty space clears.
- The controlled `selection` prop is rendered correctly; gestures still fire the callback.
- `onSelectionChange` fires exactly once per gesture (single or double).
- Data refresh prunes stale refs and keeps valid ones.
- Escape clears selection; Enter/Space selects the focused lane.
- `yarn jest trace_chart` and `yarn typecheck` are green.
