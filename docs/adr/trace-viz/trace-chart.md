---
status: implemented
domain: trace-viz
owners: [dej611]
supersedes: []
---
# Trace chart — behavioral spec

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

## Summary

The Trace chart is a horizontally-zoomable, vertically-scrollable waterfall visualization for distributed tracing data. It accepts either a simple `TraceDatum[]` array or OTLP envelope / flat OTel span data (via `fromOtlp`), normalizes both into the same internal shape, and renders each span as a horizontal bar on a Canvas2D surface. The x-axis is a continuous time or linear scale with zoom-to-nanosecond precision; the y-axis is a scrollable list of lanes — one per span.

Key capabilities: categorical color assignment, pinnable tooltip, brush-to-zoom, zoom lock, configurable minimum visible extent, keyboard navigation, segment selection with multi-select modifier keys, scroll-to-lane search integration, configurable lane ordering, collapsible nesting, span badges, trace annotations, data diagnostics reporting, segments/duration bar display, empty-state messages, touch gesture support, automatic clock-skew correction, partial-trace reparenting, consumer-supplied critical-path overlays, and a multi-level time bar.

## Consumer model

> For the full type and prop reference see [`packages/charts/api/charts.api.md`](../../../packages/charts/api/charts.api.md)
> and the [auto-generated API Docs story](../../../storybook/stories/trace/).
> This section covers what neither source explains: integration tiers, design patterns, and non-obvious contracts.

### Integration tiers

**Minimal** — static read-only waterfall:
```jsx
<Chart><Settings /><TraceSpec data={spans} /></Chart>
```

**Interactive** — controlled zoom + selection:
```jsx
<Chart>
  <Settings onElementClick={…} />
  <TraceSpec
    data={spans}
    focusDomain={domain}           onFocusDomainChange={setDomain}
    selection={selection}          onSelectionChange={setSelection}
  />
</Chart>
```

**Full-featured** — search integration, OTel data, coloring, critical path:
```jsx
<TraceSearchProvider>
  <Chart>
    <TraceSpec
      data={fromOtlp(otlpEnvelope)}
      colorBy={colorByOtelAttribute('service.name')}
      controlProviderCallback={cb}  {/* wires TraceSearchProvider.scrollToSpan */}
      criticalPath={intervals}
      laneOrder="tree"
    />
  </Chart>
</TraceSearchProvider>
```

### Design patterns

**Perform-and-fire (focusDomain and selection).**
The chart acts on gestures locally and animates immediately — it does not wait for the parent to re-render. When the animation settles it fires the callback once. The parent then decides whether to synchronize its state. This prevents feedback loops and keeps interaction latency at frame rate even with slow parent renders. See [ADR 0007](./0007-focus-domain-perform-and-fire.md) and [ADR 0011](./0011-segment-selection-model.md).

**Imperative handle (TraceSearchProvider + controlProviderCallback).**
External search UIs need to trigger `scrollToSpan(id)` from outside the chart's React subtree. `controlProviderCallback` is called once on mount with a `TraceControlCallbacks` object; the callback should hand it up to a `TraceSearchProvider`. Descendants then call `useTraceSearch()` to access the handle. The handle is not a ref: calling the same `id` twice fires the scroll twice (no prop-diffing guard). See [ADR 0008](./0008-scroll-to-span-control-provider.md).

**OTel integration path.**
Pass the raw OTLP envelope (or flat `OtelSpan[]`) to `fromOtlp`. It normalizes `startTimeUnixNano`/`endTimeUnixNano` (as `string`, `number`, or `bigint`) to milliseconds and stores the original `OtelSpan` in `datum.meta`. Downstream, `colorByOtelAttribute('service.name')` and custom tooltip renderers can read `datum.meta.attributes` without any extra mapping. See [ADR 0005](./0005-single-input-format-otel-adapter.md).

### Non-obvious contracts

**`colorBy` must be a stable reference.** The color-group map is rebuilt only when `colorBy` itself changes referentially. An inline arrow function recreates it on every render, shuffling palette assignments mid-view. Define `colorBy` at module level or wrap it in `useMemo`. See [ADR 0006](./0006-color-group-accessor-function-only.md).

**`traceId` filter vs combined waterfall.** Omitting `traceId` renders all spans in `data` as a single waterfall regardless of their individual `traceId` values (useful for comparing multiple traces side-by-side). Supplying `traceId` filters to exactly that trace; zero matches produces the trace-not-found empty state, not an empty array. A dev-mode warning fires when `data` contains multiple distinct `traceId` values and no filter is supplied.

**`activeSegments` overrides self-time per span.** Supplying `activeSegments` on a `TraceDatum` bypasses self-time derivation for that span entirely. The supplied intervals are used verbatim. Mix modes freely: some spans with explicit segments, others derived.

## Behavior & acceptance

### Data normalization

- **Simple format:** `TraceDatum[]` is accepted directly. If `activeSegments` is supplied on a datum, those intervals are used verbatim for that span; self-time derivation is skipped.
- **OTel format:** pass through `fromOtlp` first, which normalizes nanosecond timestamps to milliseconds and retains the original `OtelSpan` in `datum.meta` (enabling `colorByOtelAttribute` and custom tooltips that render `attributes`/`status`/`kind`).
- **Multi-trace data:** when multiple distinct `traceId` values are present and no `traceId` prop is supplied, a dev-mode warning is emitted and all spans are rendered.
- **`traceId` filter:** only spans with a matching `traceId` are rendered. Zero matches produces the trace-not-found empty state.

{story:multiTrace}

### Self-time and active segments

- When a span has no explicit `activeSegments`, the chart derives **self-time**: the span's own `[start, end]` minus the union of its direct children's extents, via sorted-interval subtraction. This produces zero or more non-overlapping active segments.
- A child whose extent overruns its parent is clamped to the parent's extent before subtraction; this prevents negative-width segments from malformed data.
- **Waiting segments** — the complement of active segments within `[start, end]` — are first-class selectable regions. They appear in the tooltip and in `TraceSelectionDetail.region === 'waiting'`.

{story:selfTimeDebug}

### Coordinate systems

| `xScaleType` | Behavior |
|---|---|
| `'linear'` (default) | X-axis is elapsed time re-zeroed to 0 from the trace start. Minimum visible extent: 1 ns (1 × 10⁻⁶ ms). Tick labels switch units automatically: ms → µs → ns as zoom deepens. |
| `'time'` | X-axis is wall-clock epoch milliseconds. Minimum visible extent: 1 ms. |

Changing `xScaleType` resets the zoom/pan view to fit-all and clears selection.

### Rendering

- The canvas is partitioned into a **gutter** (span name labels), a **time bar** (tick axis), and the **plot** (span bars). Dimensions and colors come from the active `Theme`.
- Each span occupies one horizontal lane. The **total line** spans the full `[start, end]` extent; **active segments** are drawn as solid colored rectangles overlaid on the total line.
- `spanDisplay` controls the bar treatment:
  - `'segments'` (default): the thin total line with solid active segments inside it (self-time-derived unless `activeSegments` is supplied). See ADR 0003.
  - `'duration'`: the full `[start, end]` extent is filled with the span's color-group color as a single duration bar (the Kibana APM waterfall look). `activeSegments` remain self-time-derived internally, so `selfTime` in the tooltip, element events, selection details, and the screen-reader table stay correct — only the visual treatment changes. See ADR 0035.
- `theme.trace.labelPosition` controls label rendering:
  - `'gutter'` (default): labels drawn in the left panel, ellipsis-truncated.
  - `'inline'`: labels rendered on a dedicated row below the bar within the plot; the gutter collapses to zero width. Suited for narrow embeds (~320 px). Long names clip at the plot's right edge; no right-edge flip.
  - `'none'`: no canvas labels; spans remain accessible via tooltip and screen-reader table.
- Only lanes inside the scroll viewport and segments inside the focus domain are drawn. The renderer's draw-call count is O(visible lanes), not O(total spans).

{story:renderer} {story:responsiveLabels}

### Time bar

- In `'time'` mode with `theme.trace.timeAxisLayerCount ≥ 2`, the time bar renders **stacked tick-label rows** — the finest row shows sub-second detail; additional rows show coarser absolute-time labels (e.g. `22:51:13`, `January 13 2022`).
- Default: `timeAxisLayerCount = 2` (finest detail + absolute time of day). Set to `3` for a date row above.
- The coarsest row always shows a **pinned leading label**: when an interval boundary is off-screen left, the label is clamped to the plot's left edge so absolute-time context is always visible.
- Overlap: when the pinned leading label and the first in-view boundary tick for the same row are too close, the boundary label is suppressed.
- `'linear'` mode and `timeAxisLayerCount = 0` render a single row, byte-identical to the pre-feature baseline.
- The plot area (lane y-positions) does not reflow as density thresholds are crossed; height is reserved for the full configured `timeAxisLayerCount`.

{story:timeBar}

### Zoom, pan, and brush

- **Mouse wheel**: zooms the time axis about the pointer position with easing; pan is 1:1 with no easing.
- **Drag** (`dragMode: 'pan'`): pans the time axis with kinetic coast on release.
- **Brush** (`Shift`+drag when `dragMode: 'pan'`, or plain drag when `dragMode: 'brush'`): draws a CSS rubber-band overlay; on release the visible window eases to the selected range. Brushes narrower than the minimum visible extent are a no-op.
- **`focusDomain` prop**: controlled visible window (ADR 0007). Gestures still execute locally. `onFocusDomainChange` fires when the animation settles, after echo-suppression. A parent feeding the emitted domain back does not re-arm the loop.
- **`zoomable` prop** (default `true`): when `false`, all zoom gestures are disabled — mouse wheel, `+`/`=`/`-` keys, two-finger pinch, and brush-to-zoom. Pan (drag / arrow keys / one-finger), selection, tooltip, and collapse stay active, and a programmatic `focusDomain` still re-drives the window. With `dragMode: 'brush'` and `zoomable: false`, plain drag falls back to panning and a dev-mode warning is logged.
- **`minVisibleExtent` prop**: coarsens the finest zoom-in window (value in ms in both x-scale modes). By default the minimum visible extent is 1 ms in `'time'` and 1 ns in `'linear'`; this raises that floor. Coarsen-only — the effective floor is `max(minVisibleExtent, scaleDefault)`, so a value finer than the scale default (or an invalid value: `0`, negative, `NaN`, non-finite) is ignored. Applies uniformly to every zoom-in path and the `focusDomain` clamp.

{story:brushZoom} {story:overviewSync} {story:zoomLock} {story:minVisibleExtent}

### Touch gestures

| Gesture | Behavior |
|---|---|
| Two-finger pinch | Zooms the focus domain about the pinch midpoint (zoom-only; no simultaneous pan). |
| Single-finger drag | Pans the focus domain horizontally; scrolls lanes vertically. Releases with kinetic coast. |
| Tap | Selects the tapped segment (`mode: 'replace'`). |
| Double-tap | Selects the whole span (`region: 'span'`). |
| Long-press (~500 ms, stationary) | Pins the tooltip. The next tap or `Escape` unpins. |

Touch has no modifier keys; the selection mode is always `'replace'`. Hover tooltip is not available on touch.

### Color

**Three-level priority** (highest wins):

1. `TraceDatum.color` — explicit per-datum color.
2. `colorBy` group color — the key returned by `colorBy(datum)` maps to a cyclic index in `theme.colors.vizColors` (EUI Borealis palette). First-seen key gets index 0.
3. Themed default active-segment color.

The color map is rebuilt when `data`, `colorBy`, or `theme.colors.vizColors` changes by reference. The `colorBy` reference must be stable (module-level constant or memoized) — a new arrow function on each render triggers a rebuild every render.

When `colorBy` returns `undefined` for a datum, that span falls through to the themed default.

{story:colorBy} {story:chromeNetwork} {story:kibanaTrace}

### Tooltip

**Hover tooltip:** appears above the hovered span; shows name, total duration, self time, and start offset from the trace start. Waiting-segment rows show the segment's duration and offset. Accepts a `customTooltip` to render arbitrary content from `datum.meta` (e.g. OTel attributes).

**Pinnable tooltip (click-to-pin):**

- Left-click a span → tooltip pinned; anchor frozen at click position; persists when the pointer moves away, or the chart scrolls/zooms.
- Left-click a different span while pinned → re-pins to the new span.
- Left-click empty canvas → clears pin.
- `Escape` → clears pin. Also clears selection and keyboard focus (ADR 0010 `Escape` chain).
- Data or view change → clears pin (stale span index must not survive a data update).

The `stickTo` prop controls how the frozen anchor is placed relative to the click position.

{story:tooltipEvents} {story:pinnedTooltip}

### Element events

Trace pointer interactions surface through the standard `Settings` element-event listeners — `onElementClick`, `onElementOver`, and `onElementOut` — rather than Trace-specific handler props; the `Trace` spec itself owns only controlled state and its dedicated callbacks (`onSelectionChange`, `onFocusDomainChange`, `onCollapseChange`, `onDataDiagnosticsChange`).

- The element payload is a discriminated union: `TraceElementEvent` (a span), `TraceBadgeElementEvent` (a Span badge plus its owning span), and `TraceAnnotationElementEvent` (a Trace annotation, plus the related span for lane/hierarchy kinds). The `isTraceElementEvent` / `isTraceBadgeElementEvent` / `isTraceAnnotationElementEvent` guards narrow the union. See the [Span badges](#span-badges) and [Trace annotations](#trace-annotations) sections for the badge/annotation payloads.
- Precedence is annotation > badge > span; a single pointer transition dispatches to at most one layer. Pointer-origin events include chart-relative coordinates; keyboard-origin activations do not synthesize coordinates. Dispatch is suspended while a viewport gesture (pan/pinch/brush) owns the pointer.

> Decision record: [ADR 0034 — Trace pointer events flow through the `Settings` element-event union](./0034-pointer-events-via-settings-element-union.md)

### Segment selection

#### Gesture table

| Gesture | Result |
|---|---|
| Left-click on active segment | Replace selection with that segment ref. |
| Left-click on waiting segment | Replace selection with that segment ref. |
| `Shift` + left-click | Add ref to selection (no-op if already present; never removes). |
| `Cmd` (macOS) / `Ctrl` (other) + left-click | Toggle ref: add if absent, remove if present. |
| Left-click on empty canvas / gutter / outside lanes | Clear selection. |
| Modifier + empty-click | Preserve selection (native file-manager convention). |
| Double-click on any span region | Replace with whole-span ref (`region: 'span', segmentIndex: -1`). |
| `Shift` + double-click | Additive whole-span ref. |
| `Cmd`/`Ctrl` + double-click | Toggle whole-span ref. |
| `Enter` / `Space` (keyboard nav) | Replace with whole-span ref for the focused lane. |
| `Shift+Enter` | Additive whole-span ref; announced via `aria-live`. |
| `Cmd+Enter` (macOS) / `Ctrl+Enter` (other) | Toggle whole-span ref; announced via `aria-live`. |
| `Escape` | Clear selection; announce "Selection cleared". |

#### Modifier-key platform note

On macOS, `Ctrl+click` fires `contextmenu` (tooltip-pin), not `click`. Selection therefore uses `metaKey` (Cmd) on Apple devices and `ctrlKey` on others. `Cmd+Space` is intercepted by macOS Spotlight; `Cmd+Enter` is the documented keyboard-toggle alternative.

<!-- FIXME: The macOS Ctrl+click → contextmenu collision is ADR-grade rationale. It should be
extracted into its own ADR. Currently captured here only. -->

#### Selection mechanics

- **Debounce:** a ≤ 250 ms timer defers the single-click commit so that a second click can cancel it and replace with a whole-span double-click. `onSelectionChange` fires exactly once per gesture.
- **`onElementClick`** fires immediately on every raw click and is orthogonal to `onSelectionChange`.
- **Controlled `selection` prop:** gestures still fire `onSelectionChange` with the correct `next` value; the prop is the render source of truth.
- **Pruning on data change:** when `data` changes, refs whose `spanId` no longer exists or whose `segmentIndex` is out of range are dropped. Survivors are kept. `onSelectionChange` fires if any refs were dropped.
- **View reset:** changing `traceId`, `xScaleType`, or the input format clears selection entirely (same reset as pin and zoom/pan).
- **Selection identity:** two refs are equal when `spanId`, `region`, and `segmentIndex` all match. Toggle uses this identity test.

{story:segmentSelection} {story:segmentSelectionControlled}

### Scroll-to-lane

`TraceSearchProvider` + `useTraceSearch()` provide an imperative `scrollToSpan(id)` call from any descendant component (e.g. an external search field) without prop threading.

- `scrollToSpan(id)`: centers the matching span's lane in the viewport and highlights it with the keyboard-focus indicator. Re-calling with the same id re-triggers (no prop-diffing guard — this is the reason for the imperative callback pattern rather than a `focusSpanId` prop).
- Unknown id → dev-mode warning; no visual change.

{story:scrollToLane}

### Lane ordering

| `laneOrder` | Behavior |
|---|---|
| `'tree'` (default) | Depth-first: each parent is immediately followed by its descendants, recursively; siblings within a level ordered by start time. Orphan spans treated as roots. Matches Kibana APM trace view. |
| `'chronological'` | Ascending by `span.start`. Matches Chrome DevTools Network panel. |

Changing `laneOrder` invalidates the pipeline cache and resets zoom/pan to fit-all (different lane order → different domain may apply).

{story:laneOrder} {story:kibanaWorkflow}

### Collapsible nesting

- A parent lane can be collapsed to hide its descendant lanes. Collapse is gated on `laneOrder: 'tree'` (the default); in `'chronological'` mode `collapsedSpanIds` is ignored with a dev-mode warning. See ADR 0026.
- Toggle sources: a caret click in the disclosure gutter and the `c` keyboard shortcut on the focused lane.
- **`collapsedSpanIds` prop**: controlled set of span IDs whose descendants are hidden. Perform-and-fire (same model as `focusDomain`/ADR 0007): toggles execute locally and fire `onCollapseChange` with the new array; the parent decides whether to update the prop. Omit the prop to let the component manage collapse state internally.
- **`onCollapseChange`**: fired once per toggle with the next collapsed-ID array; suppressed when the set is identity-equal to the previous fire.
- When a parent is collapsed, its descendants' active segments and critical-path intervals roll up onto the parent lane (merged, clamped to the parent's `[start, end]`). Expanding restores per-lane rendering.
- **`showDisplayChildCount` prop**: when `true`, renders each parent's direct **display-child count** to the right of its caret glyph in the themed gutter-label font; leaf lanes render nothing. Defaults to `false`. Inert when `laneOrder: 'chronological'` (no disclosure gutter exists). See ADR 0037, ADR 0038.
  {story:collapsibleNesting}
- The count uses **display topology** (ADR 0028): a reparented orphan counts toward its elected synthetic display parent; spans from other trace groups in a combined waterfall never share children across group boundaries.
  {test:packages/charts/src/chart_types/trace_chart/data/collapse.test.ts#"child count uses display parentage"}
- The count reflects direct display children only, not the subtree total. It is unchanged by collapse state — a collapsed parent shows the same count as when expanded. The subtree total remains exclusive to the aria-live "N descendants hidden" announcement.
  {test:packages/charts/src/chart_types/trace_chart/data/collapse.test.ts#"child count is unchanged by collapse state"}
- A display child that is itself collapsed still counts as one direct child of its parent — the count is derived from the pre-collapse pipeline output.
  {test:packages/charts/src/chart_types/trace_chart/data/collapse.test.ts#"child count ignores hidden lanes"}
- The disclosure gutter widens by a measured reserve sized to the widest count string across all parent spans. Gutter width, plot origin, labels, and badges do not reflow when a caret is toggled — the reserve is computed once per data change (ADR 0037 D1).
  {test:packages/charts/src/chart_types/trace_chart/render/geometry.test.ts#"child count widens the disclosure column"}
- The caret glyph and count text form one disclosure click/tap target: clicking the count toggles collapse and is consumed before selection, exactly like a direct caret click (ADR 0026 §3e).
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"pickDisclosure includes the child-count zone"}
- The draw zone and pick zone are both derived from the disclosure column geometry published on `TraceGeometry` (ADR 0037 D1). The pick range spans the full reserve; the drawn text occupies only its own digits — no per-lane measurement at pick time.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"child count draw and pick zones agree"}
- With `showDisplayChildCount` omitted or `false`, layout and rendering are identical to the prop-off baseline: no reserve, no count text.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"child count is off by default"}
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"child count is inert in chronological mode"}

### Empty states

| Condition | Message |
|---|---|
| `data = []` | "No data" (delegated to the library's standard empty-chart overlay). |
| `data` non-empty, `traceId` supplied, zero matches | `No spans found for trace "<id>"` (or `traceNotFoundMessage` if supplied). Canvas message, not an overlay. |
| `data` non-empty, no `traceId` | Normal rendering; never an empty state. |

The time bar remains visible in both empty cases.

{story:emptyTrace}

### Accessibility

- The canvas has `role="application"` and is keyboard-focusable. Screen-reader content is provided as a hidden, browsable DOM sibling — not inside the canvas.
- A hidden paginated table (20 rows per page) lists all spans with columns: name, total duration, self time, start offset from trace start, parent name. A `ScreenReaderSummary` element gives the overall span count.
- `aria-live="polite"` announces the focused span's name and total duration after each lane change.

#### Keyboard model

| Key | Action |
|---|---|
| `↑` | Move focus to previous lane (clamp at 0); scroll into view (nearest-edge); announce. |
| `↓` | Move focus to next lane (clamp at last); scroll into view (nearest-edge); announce. |
| `Home` | Jump to first lane. |
| `End` | Jump to last lane. |
| `Enter` / `Space` | Fire `onElementClick` for focused span; select whole span. |
| `←` / `→` | Pan the focus domain one step left / right. |
| `+` / `-` | Zoom in / out one step. |
| `Esc` | Clear focused lane, clear selection, unpin tooltip (cascading chain). |

- Arrows are navigation-only: `↑`/`↓` move between lanes; `←`/`→` pan the time axis.
- Tab moves focus out of the canvas (no focus trap).
- Keyboard navigation is span-granular only (whole lanes). Sub-span / segment-level keyboard selection is not supported.

{story:accessibility}

### Clock-skew correction

When a child span's recorded `start` precedes its parent's `start`, the chart automatically applies the symmetric-latency centering heuristic. The correction is always-on and transparent.

**Formula:** `delay = (parentDuration − childDuration) / 2`. The child (and its entire descendant subtree) is shifted so its new start is `parentStart + delay`. Durations are preserved.

| Case | Behavior |
|---|---|
| Child starts before parent | Child (and descendants) shifted. `skewCorrected` flag set on affected spans. |
| `childDuration > parentDuration` | `delay < 0`; child overhangs symmetrically on both sides. Applied as-is per the heuristic. |
| Cyclic `parentId` graph | DFS terminates via a visited guard; no spans dropped. |
| Multi-level skew | Each level evaluated against its already-corrected parent, independently. |
| Right-side overhang (starts inside parent, ends after) | Not corrected — only `child.start < parent.start` is in scope. |

Corrected spans show a "time adjusted for clock skew" note in the tooltip, screen-reader table, and
keyboard aria-live announcement. Click, hover, and rich selection-detail payloads carrying corrected
timings include `skewCorrected: true`; their `datum` remains the recorded source object. Unskewed
traces are byte-identical to the pre-correction behavior.

### Critical path

- Supply `criticalPath?: TraceCriticalPath` to render a colored line along the bottom edge of affected lanes.
- Each `TraceCriticalInterval` (`{ spanId, start, end }`) carries times in the same units as `TraceDatum`. The chart applies any owning-span clock-skew translation, then re-zeros them in `'linear'` mode alongside span timestamps.
- Intervals are clamped to their span's `[start, end]` (whole span — may cover waiting regions); out-of-bounds intervals or those where `start >= end` after clamping are dropped silently.
- Unknown `spanId` → interval dropped silently.
- An interval may be narrower than the active segment (sub-segment precision is preserved).
- Omit `criticalPath` or pass `[]` → nothing drawn.
- The chart never computes the critical path; it is always consumer-supplied.
- When a parent lane is **collapsed**, its descendants' critical intervals roll up onto the parent lane (merged, clamped to the parent's `[start, end]`) — mirroring rolled-up active segments. Expanding the parent restores per-lane rendering.

{story:criticalPath}

### Partial-trace recovery & reparenting

A supplied trace can be incomplete: a span may reference a `parentId` that is absent from the selected data. Such a span is an **orphan** and its trace is **partial**. Recovery and disclosure are always on — there is no opt-in prop, and the original `TraceDatum` is never mutated.

- **Source vs display topology.** An orphan keeps its recorded `parentId` and is instead given a *synthetic display parent* under an elected root. Display topology drives lane order/depth, collapse and rollup membership, screen-reader indentation, and clock-skew placement; recorded (source) topology continues to drive self-time derivation. A parent ID in a different `traceId` group never satisfies a reference (spans without a `traceId` form one unknown group).
- **Root election** (applied per `traceId` group):

| Recorded roots | Behavior |
|---|---|
| Exactly one | Use that recorded root. |
| None, ≥ 1 orphan | The first orphan in input order becomes the fallback display root (`orphaned`, no `reparentedToSpanId`). |
| More than one | Use the last recorded root in input order; earlier roots and anything reachable only from them are omitted. |
| None and no orphan | Only malformed/disconnected topology (e.g. a rootless cycle); the group renders no lanes. |

- **Reachability & identity.** After attaching orphans, the elected root is traversed depth-first; disconnected cycles, non-elected roots, and unreachable descendants are omitted. A duplicate span ID within a group's reachable tree invalidates only that group; a duplicate ID across selected trace groups invalidates the entire combined result (interaction APIs use chart-global span IDs). Traversal terminates on cycles and duplicates.
- **Empty handling.** When selected input yields no visible lanes (rootless or invalidated), the canvas and time bar stay mounted over a blank plot — this is neither the `no-data` nor the `trace-not-found` state (amends ADR 0019).
- **Provenance.** `TraceSpanInfo.orphaned` and `reparentedToSpanId` are exposed on element events and selection details; `parentId` and `datum` remain the recorded source values. The tooltip discloses `Missing parent` and, when applicable, `Displayed under: <root>` or `Used as display root`; the screen-reader table and keyboard announcements say the same. Recovery-driven omissions and invalidations are reported through the data-diagnostics report rather than as a chart-rendered warning callout.
- **Kibana parity.** Election and reachability match Kibana APM's `TraceWaterfall`; intentional divergences: recorded parent identity is never overwritten, `orphaned` provenance is retained on a fallback root, trace-level warning presentation is left to the consumer, and cross-`traceId` edges are never formed. Because the elected display root is always parentless within its group, no ancestor-path cycle guard is required; a future focus-root feature that can elect a descendant as the display root must reintroduce that guard before applying synthetic parentage.

> Decision record: [ADR 0028 — Partial traces use source-preserving synthetic parentage (with Kibana reparenting parity)](./0028-partial-trace-synthetic-parentage.md)

### Span badges

A `badgeAccessor(datum)` derives an ordered, readonly `TraceSpanBadge[]` for each span. It is evaluated while preparing trace data (not per frame), so pass a stable/memoized reference. Span badges are presentation derived from a span — they never modify the source `TraceDatum` or `fromOtlp` output.

- **Shape.** A `TraceSpanBadge` carries a span-unique `id`, optional `text` (string; whitespace-only counts as absent), optional `image` (`TraceSpanBadgeImage` — a CORS-safe `src` plus optional `crossOrigin`, default `'anonymous'`), optional `color` (`TraceSpanBadgeColor`: `'default' | 'hollow' | 'primary' | 'success' | 'warning' | 'danger'` or a custom `Color`), optional `ariaLabel`, optional `visibleIn` (default `['gutter', 'inline']`), and opaque `meta` returned by reference. A badge must contain text, an image, or both. When it has both, the image precedes the text.
- **Size.** `badgeSize` (`'s' | 'm'`, default `'m'`) applies to every badge in the Trace as one design unit (text, padding, height, image box); individual badges cannot pick a different size.
- **Images.** Only browser-supported image sources (including data URLs) are loaded, always with the declared CORS mode, and never in a way that would taint the chart canvas. Load state is cached per `(src, crossOrigin)`; a reserved box shows a neutral loading placeholder, a failed image shows a distinguishable failed placeholder (text/name/interaction still work), and image load failures emit at most one deduplicated developer warning per source — they are not part of the diagnostics report. Loading never blocks first paint or spins an idle loop.
- **Placement & overflow.** Badges render beside the gutter label (right-aligned), beside the inline label, or — for badges whose `visibleIn` includes `'none'` — in a compact lane-aligned badge-only gutter when labels are hidden. When space is tight, a minimum readable label area is preserved, then badge text truncates and finally trailing badges are omitted from the visual layout (still available to assistive technology). There is no `+N` overflow affordance in v1.
- **Accessibility.** Each badge has one accessible name (visible text, or `ariaLabel`); an image-only badge without `ariaLabel` is reported through diagnostics but still renders with a generic name. Badges are reachable and activatable through the span accessibility surface without adding a canvas tab stop per badge.
- **Events.** Badges are inert data. Interaction is reported through the `Settings` element-event union as `TraceBadgeElementEvent` (owning-span metadata included), not through badge-specific props. A pointer event on a badge is owned by that badge (no double-dispatch to the span), activation requires down+up on the same badge, hit testing is suspended during viewport gestures, and the clickable cursor appears only when an element-click handler is wired. Malformed badges (duplicate ids, empty, non-string text, invalid `visibleIn`, image-only without `ariaLabel`) are reported through the unified data-diagnostics report.

v1 excludes arbitrary React badge content, renderable icon/text components, custom image loaders, per-badge sizes/dimensions, consumer-configurable placement, and a built-in badge tooltip.

> Decision record: [ADR 0029 — Trace badge rendering architecture](./0029-trace-badge-rendering-architecture.md)

### Trace annotations

Annotations are composed as declarative child specs of `<Trace>` — `TraceTimeAnnotation`, `TraceLaneAnnotation`, and `TraceHierarchyAnnotation` — not a Trace-level array prop. They layer caller context over prepared output and never modify trace data, selection, collapse, or lane order. Child specs are inert (no handler functions, no arbitrary React overlays) and are not stored on the Trace spec.

- **Common fields** (`TraceAnnotationDatum`): a chart-unique `id`, optional `hidden`, optional `color` (`TraceAnnotationColor`), an `ariaLabel` (required by contract — a missing name is reported through diagnostics but still renders with a generic name), and opaque `meta`.
- **Time annotation.** Marks a `time` point or a `range` `[from, to]` (never both) on the x-scale, re-zeroed in `'linear'` mode alongside span timestamps. `placement` is `'timebar'` (default: a marker/tick in the lower half of the time bar, nothing in the plot; a range tints a band across that region — the Kibana APM idiom) or `'plot'` (a full-height rail; a range fills a tinted plot band with edge rails). Off-domain annotations are omitted silently; non-finite/empty/reversed values are reported through diagnostics; a partially visible range is clipped for rendering/hit-testing while events still report the original range.
- **Lane annotation.** Marks one resolved span lane with a boundary rail between the gutter and the plot. Targets a span by `spanId` (never a lane index).
- **Hierarchy annotation.** Marks the visible root-to-target ancestry route with a segmented boundary rail, resolved through the prepared display hierarchy (so it honors reparenting and collapse). It marks the route only — not sibling branches or the target's descendants — and is omitted silently when the target is hidden by collapse.
- **Geometry & interaction.** Annotation marks draw above spans and badges (clipped to the plot, or to the time-bar region for `'timebar'` placement) and never tint span bars or widen the gutter. Hit testing uses a thin-band model: a time point uses a minimum interactive width, a time range is hit only on its start/end edge rails, and lane/hierarchy rails are hit only near the boundary. Precedence is annotation > badge > span with no double-dispatch; hit testing is suspended during viewport gestures; the clickable cursor appears only when an element-click handler is wired.
- **Accessibility & events.** Annotations expose their own screen-reader surface (separate from span rows) and are keyboard-activatable when clickable. Interaction is reported through the `Settings` element-event union as `TraceAnnotationElementEvent`, whose `annotationType` (`'time' | 'lane' | 'hierarchy'`) lets one handler family branch by kind. Duplicate ids and references to missing spans are reported through the data-diagnostics report.

v1 excludes visible annotation text labels, arbitrary React overlays, independent per-annotation style overrides beyond `color`, and a built-in annotation tooltip.

> Decision record: [ADR 0030 — Trace annotations compose as child specs (composition, geometry, layering, and hit testing)](./0030-trace-annotation-composition.md)

### Data diagnostics

`onDataDiagnosticsChange(diagnostics)` reports a structured `TraceDataDiagnostics` snapshot for the prepared trace data — the application-facing channel that supersedes developer-console warnings for data issues.

- **Shape.** `TraceDataDiagnostics` is a flat `{ issues: TraceDataDiagnosticIssue[] }` (with an optional derived `summary`). Each issue carries a `kind` (`TraceDataDiagnosticKind`, a closed exported union), a `severity` (`'info' | 'warning' | 'error'`), a `scope` (`'chart' | 'trace' | 'span' | 'badge' | 'annotation' | 'reference'`), an occurrence `count`, bounded `examples`, and related span/trace metadata. Fields are machine-readable only — applications own user-facing prose and remediation copy.
- **Coverage.** Clock-skew corrections, invalid/omitted trace groups, root election, disconnected/rootless components, cycles, duplicate span ids, discarded non-finite spans/intervals, unresolved caller references (critical-path intervals or connections pointing at missing ids), and structural Span-badge and Trace-annotation issues.
- **Timing.** Data-change driven — computed from the same prepared data that drives rendering, before committing visual output, and only when the report's content changes. Zoom/pan/animation frames do not re-emit; it is never fired as a React render-phase side effect. Clean, non-empty prepared data emits an empty report (`{ issues: [] }`) once so consumers can clear stale UI; the `data: []` no-data state does not emit (the canvas is unmounted).
- **Boundaries.** Diagnostics are the primary data-issue channel; any remaining developer logs are scenario-owned. Badge *image load* failures are asynchronous resource failures and stay out of the report (placeholder + one deduplicated developer warning).

> Decision record: [ADR 0032 — Trace data diagnostics report](./0032-trace-data-diagnostics-report.md)

## Decisions

All non-obvious design decisions are recorded in the ADRs below. Consult them for rationale and trade-offs before changing behavior.

- [ADR 0001 — Trace chart renders via Canvas2D, behind a WebGL seam](./0001-renderer-canvas2d-with-webgl-seam.md)
- ~~[ADR 0002 — Trace chart accepts two input formats, normalized to one internal span shape](./0002-single-normalized-span-dual-input.md)~~ *(superseded by ADR 0005)*
- [ADR 0003 — A span's active segment(s) default to its self time, not its full duration](./0003-self-time-as-active-segments.md)
- [ADR 0004 — Self-managed RAF render loop & the zoom-eases / pan-1:1 interaction model](./0004-raf-render-loop-and-interaction-model.md)
- [ADR 0005 — Trace chart takes a single input format; OTel is consumed via a `fromOtlp` adapter](./0005-single-input-format-otel-adapter.md)
- [ADR 0006 — `colorBy` is a function; no string shorthand](./0006-color-group-accessor-function-only.md)
- [ADR 0007 — Controlled `focusDomain` is perform-and-fire; one callback for all gesture sources](./0007-focus-domain-perform-and-fire.md)
- [ADR 0008 — Scroll-to-span uses `controlProviderCallback` + `TraceSearchProvider`](./0008-scroll-to-span-control-provider.md)
- [ADR 0009 — Brush rubber-band is a CSS `<div>`, not a canvas draw](./0009-brush-overlay-css-div.md)
- [ADR 0010 — Linear-scale nanosecond precision](./0010-linear-scale-nanosecond-precision.md)
- [ADR 0011 — Segment selection model: thin refs in, rich details out; controlled perform-and-fire](./0011-segment-selection-model.md)
- [ADR 0012 — Trace accessibility architecture: `role="application"` on the canvas, SR data via a second selector, keyboard focus badge as a DOM sibling](./0012-role-application-canvas-only-sr-siblings.md)
- [ADR 0015 — Critical path is consumer-supplied, interval-precise (not computed, not a boolean)](./0015-critical-path-consumer-supplied-intervals.md)
- [ADR 0016 — Connections are an explicit consumer-supplied prop, not derived from OTel links *(deferred; Spec 35)*](./0016-connections-explicit-prop.md)
- [ADR 0017 — Trace viz story organisation principles](./0017-story-organisation-principles.md)
- [ADR 0018 — Lane ordering: tree (DFS) default, chronological optional](./0018-lane-ordering-tree-default.md)
- [ADR 0019 — Empty-state ownership: `no-data` delegates to the library overlay, `trace-not-found` is a canvas message](./0019-empty-state-ownership.md)
- [ADR 0020 — Inline labels render on a dedicated row below the bar (Kibana APM style)](./0020-inline-labels-below-bar.md)
- [ADR 0021 — Touch interaction model: engine reuse, pinch-zoom-only, manual tap detection, long-press pin](./0021-touch-interaction-model.md)
- [ADR 0022 — Clock-skew correction: active centering heuristic](./0022-clock-skew-heuristic.md)
- [ADR 0023 — Running-span model: optional end, domain-max provisional edge, dashed visual *(deferred; Spec 34)*](./0023-running-span-model.md)
- [ADR 0024 — Multi-level time bar: stacked tick rows in time mode](./0024-multilevel-time-bar.md)
- [ADR 0026 — Collapsible nesting: rolled-up semantics, tree-gating, and disclosure gutter](./0026-collapsible-nesting.md)
- [ADR 0027 — Span IDs are unique within one supplied dataset](./0027-span-id-uniqueness.md)
- [ADR 0028 — Partial traces use source-preserving synthetic parentage (with Kibana reparenting parity)](./0028-partial-trace-synthetic-parentage.md)
- [ADR 0029 — Span badge rendering architecture](./0029-trace-badge-rendering-architecture.md)
- [ADR 0030 — Trace annotations compose as child specs (composition, geometry, layering, and hit testing)](./0030-trace-annotation-composition.md)
- [ADR 0032 — Trace data diagnostics report](./0032-trace-data-diagnostics-report.md)
- [ADR 0034 — Trace pointer events flow through the `Settings` element-event union](./0034-pointer-events-via-settings-element-union.md)
- [ADR 0035 — `spanDisplay` duration-bar mode](./0035-span-display-duration-bar-mode.md)
- [ADR 0037 — Disclosure column sub-widths are measured and published, not re-derived](./0037-disclosure-column-measured-widths.md)
- [ADR 0038 — Public props name display topology when their value derives from it](./0038-prop-naming-display-topology.md)

## Non-goals

| Non-goal | Reason |
|---|---|
| WebGL rendering in v1 | Canvas2D is sufficient at typical distributed-trace scale. A renderer seam (ADR 0001) exists so a future WebGL backend requires no public API change. |
| Computed critical path | Critical-path computation is domain-specific and depends on data outside the chart. The chart renders consumer-supplied intervals only (ADR 0015). |
| Connections (directed "Initiated by" arrows) | Deferred beyond v1 — no `connections` prop or `TraceConnection` type is exposed. The design rationale (explicit prop, no OTel `links` auto-derivation) is preserved in ADR 0016 for when the feature lands. |
| Hover tooltip on touch | Touch devices have no hover state. Span detail is reachable via long-press pin (ADR 0021). |
| Brush gesture on touch | Pinch-zoom covers narrowing the focus domain. Touch has no modifier key to invert gesture mode (ADR 0021). |
| Keyboard path for single-segment (sub-span) selection | Keyboard navigation is span-granular (arrow keys move between whole lanes). Segment-level keyboard selection is out of scope. |
| Right-side clock-skew correction | Only `child.start < parent.start` (left-side overhang) is corrected. A child that starts inside its parent but ends after it is not repositioned. |
| Running (in-progress) span visualization | Deferred beyond v1 — `TraceDatum.end` is required; no `null`/running model, dashed provisional visual, domain-max edge, or wall-clock behavior is exposed. The design rationale (optional end, provisional domain edge, no live clock) is preserved in ADR 0023 and Spec 34 for when the feature lands. |
| Screen-reader announcement of critical-path membership | Planned follow-up; see ADR 0012 open items. |
| Subtree totals in the disclosure gutter | The direct display-child count answers "what's one level down"; the subtree total is already surfaced on collapse via the aria-live announcement. Showing both inside a narrow gutter column is noise. |
| Screen-reader surfacing of the display-child count | The SR table already carries a `parentName` column per row and appends "(N descendants hidden)" to collapsed parent rows; a spoken count would duplicate information AT users already have. |
| Count formatting / i18n | The count is a plain integer; no locale grouping, abbreviation, or upper-bound clamp. |
| Counting spans hidden by anything other than collapse | The count reflects what expanding the caret would reveal — only the direct display-child count in the pre-collapse pipeline output. |
