# elastic-charts

A charting library exposing chart types (XY, Partition, Flame, Heatmap, …) as React components, each
backed by a redux-driven internal chart state.

## Language

### Trace visualization

**Span**:
A single timed operation; the atomic datum of the Trace waterfall. One span occupies exactly one lane.
_Avoid_: event, operation, transaction (OTel-specific terms below cover those distinctions).

**Lane**:
One horizontal row of the Trace waterfall, holding exactly one span.
_Avoid_: row, track, swimlane (a swimlane implies grouping, which lanes do not do).

**Total line**:
The thin mark spanning a span's full `[start, end]` extent in the Trace waterfall. For a **running
span** the total line is drawn dashed, extending from the span's start to the trace's latest known
finite end (the domain max) to signal an uncertain right edge.
_Avoid_: bar, duration bar.

**Active segment**:
A solid mark inside a span's total line indicating active execution; a span has 0..N of them.
_Avoid_: active rect (singular — a span can have more than one).

**Self time**:
A span's extent minus the union of its children's extents. The default source of active segments when
a span's active range isn't supplied explicitly (see [ADR 0003](./docs/adr/trace-viz/0003-self-time-as-active-segments.md)).
Self time is **not derived** for **running spans** — their synthetic end is not a real measurement, so
fabricating active-execution segments up to it would overclaim. Running spans render the dashed total
line only, plus any `activeSegments` the caller supplies explicitly.
_Avoid_: exclusive time (self time is the canonical term used throughout this codebase).

**Rolled-up active segments**:
The union of every span's active segments within a collapsed subtree (the collapsed parent's own
active segments plus all descendants' active segments), merged/deduped with the same interval-merge
pass used by `mergeSegments`, and clamped to the parent's `[start, end]` extent. Displayed as the
filled bar of a collapsed parent lane. Idle time on the rolled-up bar is time *nobody* in the subtree
was actively executing. A collapsed lane is still owned by exactly one span — the aggregate is a
visual representation, not a new entity. See [ADR 0026](./docs/adr/trace-viz/0026-collapsible-nesting.md).
_Avoid_: self time (self time is a single span's exclusive time; the rollup is a subtree aggregate).

**Running span**:
A span that has started but not yet finished, represented in the input by omitting `end` or passing
`null`. The chart renders a running span's **total line** as a dashed line from `start` to the trace's
latest known finite end (the **domain max** — a provisional right edge, not "now"). The chart has no
wall-clock dependency; the provisional end does not animate. Duration and elapsed-time values are not
presented for running spans (the provisional extent is not a real measurement). In the OpenTelemetry
protocol, a running span sets `endTimeUnixNano = 0`, which the `fromOtlp` adapter maps to `null`. See
[ADR 0023](./docs/adr/trace-viz/0023-running-span-model.md).
_Avoid_: in-flight span (may imply network activity specifically), live span (implies the bar is live-
animating).

**Clock-skew correction**:
An active positional adjustment applied by the normalization pipeline when a child span's recorded
`start` precedes its parent's (a temporal impossibility caused by unsynchronized clocks). The heuristic
centers the child within the parent: `delay = (parentDuration − childDuration) / 2`. The entire
descendant subtree shifts by the same `offset`, preserving intra-subtree relative distances. Corrected
spans carry a `skewCorrected` marker; the tooltip and screen-reader surface note the adjustment, and the
original recorded times remain accessible via the source datum. Runs before domain projection and before
running-end synthesis; running spans (no duration) are skipped. See [ADR 0022](./docs/adr/trace-viz/0022-clock-skew-heuristic.md).
_Avoid_: clock drift (implies a gradual continuous offset rather than a fixed per-collection skew),
timestamp fix (sounds like a data-repair step applied to the source, not a rendering adjustment).

**Trace**:
The set of spans sharing one `traceId`. The chart typically renders a single trace; pass `traceId` to
filter to one, or omit it to render all supplied spans as one combined waterfall (one lane per span).
Lane assignment order is controlled by the **Lane order** mode.

**Lane order**:
The rule that assigns spans to lanes top-to-bottom. Two modes: `tree` (depth-first `parentId`
nesting — each parent is immediately above its descendants; the default, matching Kibana APM) and
`chronological` (by span `start` ascending, matching Chrome DevTools Network). In `tree` mode,
multi-trace mode (no `traceId` filter) produces a **forest**: each subtree is grouped together
rather than interleaved by start. Orphan spans (whose `parentId` is absent from the span set) are
treated as roots. Set via `TraceSpec.laneOrder`. See [ADR 0018](./docs/adr/trace-viz/0018-lane-ordering-tree-default.md).
_Avoid_: sort order, row order.

**Focus domain**:
The currently-visible time window `[min, max]` of the Trace waterfall after zoom/pan, eased toward a target.
Can be externally driven via the `focusDomain` prop and observed via the `onFocusDomainChange` callback
(perform-and-fire, echo-suppressed — see ADR 0007). Values are in post-normalize coordinates: epoch-ms
for `'time'`, elapsed-from-zero-ms for `'linear'`. Changed by mouse wheel, keyboard, brush, and (on
touch) two-finger pinch centered on the pinch midpoint (zoom-only — see ADR 0021).
_Avoid_: viewport, visible range.

**Scroll offset**:
The vertical lane-scroll position (pixels) within the plot area. A component-instance value clamped to
`[0, max(0, spans.length × laneHeight − plot.height)]`. Distinct from the **Focus domain** (which is
the horizontal time window). When `scroll offset = 0` the topmost lane is flush with the top of the
plot; increasing the offset scrolls lanes upward, revealing lower lanes. Adjusted by mouse drag and (on
touch) single-finger vertical drag simultaneously with horizontal Focus-domain pan.
_Avoid_: vertical offset (ambiguous with DPR transforms), viewport offset.

**Waiting**:
The portion of a span's total line not covered by an active segment; time the span was not itself
executing. By default (when active segments are self-time-derived, per ADR 0003) this is time the
span spent in its children. When a caller supplies `active` ranges explicitly, it is
caller-defined inactivity. One of three hover regions alongside **active** and **empty**. Each
contiguous waiting gap is an addressable **waiting segment** (derived on demand — not stored on
`NormalizedSpan`) that can be selected and highlighted independently, symmetric with active segments.
_Avoid_: idle (implies nothing is happening globally), blocked (implies a stall or error).

**Label position**:
The rendering mode for span name labels: `gutter` (drawn in the fixed left panel — the default), `inline` (drawn on a dedicated row below the bar, starting near the bar's start edge and overflowing right — the Kibana APM style), or `none` (labels omitted; accessible only via tooltip and screen-reader table). Set via `theme.trace.labelPosition`. No auto-switching — the caller sets the mode explicitly.
_Avoid_: label mode, label placement.

**Focused lane**:
The lane currently selected via keyboard navigation, indicated by a full-width background highlight drawn in `draw()`. Distinct from the hovered lane (which is mouse-driven and controls tooltip visibility). Only one lane is focused at a time; focus is cleared when the canvas loses keyboard focus.
_Avoid_: selected lane, active lane (active is already used for active segments).

**Selection**:
The set of currently selected segments in the trace waterfall. Selection is managed as a
`TraceSelection` (an array of `TraceSegmentRef` values keyed by `spanId`). A **selected segment** is
one active or waiting segment highlighted by a stroke outline; a **selected span** (`region:'span'`)
is a whole-span selection spanning the full `[start, end]` extent, produced by double-click (or
double-tap on touch). Multiple refs coexist in the set (multi-select via Shift/Ctrl/Cmd-click). On
touch, tap produces a selected segment and double-tap produces a selected span (both in `'replace'`
mode — touch has no modifier keys). Distinct from the focused lane (keyboard nav) and the pinned
tooltip (right-click / long-press detail view).
_Avoid_: selected lane (reserved for focused lane), highlighted span.

**Brush**:
A Shift+drag gesture on the plot area that draws an X-axis rubber-band rect and, on release, eases the focus domain to the selected time range. X-only (no Y-axis brushing). The default drag gesture (`dragMode='pan'`) is inverted by Shift; setting `dragMode='brush'` makes plain drag brush and Shift+drag pan.
_Avoid_: drag-zoom, range select, lasso.

**Pinned tooltip**:
A tooltip frozen in place after the user **right-clicks** a span (or **long-presses** on touch, ~500 ms
stationary). Remains visible regardless of subsequent pointer position; dismissed by clicking (or
tapping on touch) elsewhere on the canvas, pressing Escape, or a `visibilitychange` event. Managed as
local component instance state, not redux. (Left-click and tap are reserved for **selection**; see ADR
0021 for the touch-dismiss path.)
_Avoid_: sticky tooltip (ambiguous with `stickTo` anchor positioning), locked tooltip.

**Color group**:
The string value that determines which palette color a span's active segments receive. Two spans with the same color group key get the same color. The key can be derived from any span property (e.g. an OTel attribute, span kind, or a caller-computed value); the chart resolves key → color via a cyclic index into the EUI palette.
_Avoid_: category, series, bucket.

**Minimum visible extent**:
The smallest meaningful time window the trace chart allows via zoom-in. Scale-dependent:
- **`linear` x-scale:** **1 ns** (`1e-6 ms`). `normalize()` re-zeros all timestamps to zero, so the
  domain spans `[0, totalDurationMs]`; float64 can represent nanosecond differences without precision
  loss at this base. The tick formatter switches units at µs/ns breakpoints so adjacent labels remain
  distinct. Note: `ZOOM_MAX = 35` caps reachable zoom depth — traces longer than ~34 s cannot zoom
  all the way to 1 ns via wheel; the 1 ns floor is only reachable within that bound.
- **`time` x-scale:** **1 ms**. Epoch-based domain values are ~1.7 × 10¹² ms; float64 at that
  magnitude cannot represent sub-ms differences, making 1 ms a hard precision limit.

Distinct from the **Focus domain** (the current window, always ≥ the minimum visible extent after
clamping).
_Avoid_: minimum zoom level (implies a zoom exponent, not a time window).

**Critical path**:
A consumer-supplied set of interval-precise **critical intervals** marking the portions of spans that
gated the trace's total duration; rendered as a distinct colored line along the bottom edge of the
affected lanes. Each critical interval covers a sub-range of a span's `[start, end]` extent — it may
fall in a **waiting** region (time the span was blocked on children) as well as in an active region.
It is not span-granular. Consumers supply raw pre-normalization times (same units as `TraceDatum.start/end`);
the chart re-zeros them in `'linear'` mode alongside `activeSegments`. When a parent lane is
collapsed, its descendants' critical intervals become **rolled-up critical intervals** attributed to
the collapsed parent. See [ADR 0015](./docs/adr/trace-viz/0015-critical-path-consumer-supplied-intervals.md).
_Avoid_: critical segment (would collide with the index-addressable active/waiting **segment**),
critical span (implies span-granular marking).

**Rolled-up critical intervals**:
The union of every critical interval within a collapsed subtree, clamped to the collapsed parent's
`[start, end]` and merged via the same sorted-interval union used for **rolled-up active segments**.
Displayed as the critical-path line on a collapsed parent lane; disappears (reverts to per-lane)
when the parent is expanded. A collapsed lane is still owned by exactly one span — the rollup is a
visual representation, not a new entity. See [ADR 0015 Decision 4](./docs/adr/trace-viz/0015-critical-path-consumer-supplied-intervals.md)
and [ADR 0026](./docs/adr/trace-viz/0026-collapsible-nesting.md).
_Avoid_: critical path rollup (prefer the full term for clarity), rolled-up critical path (implies
the whole critical path is rolled up, not just intervals for hidden spans).

**Connection**:
A directed causal edge drawn as an orthogonal elbow connector from a source segment endpoint (the
**initiator**) to a target segment endpoint (the **initiated**), expressing the Chrome DevTools
"Initiated by" relationship. The arrow originates at the **end** of the `from` region and points to
the **start** of the `to` region. Connections may cross lanes arbitrarily. Distinct from the
structural `parentId` nesting, which is a tree relationship between whole spans.
_Avoid_: link (reserved for OTel's looser span-to-span `links` relation), dependency (overclaims
blocking semantics), arrow (a rendering term, not a domain concept).

**Empty state**:
The condition when the trace chart has no lanes to render. Two distinct cases, handled differently:
`no-data` (the `data` prop was empty — no spans supplied at all) delegates to the **library empty
state** — the `NoResults` DOM overlay, overridable via `Settings.noResults` — and the trace canvas
does not mount (`isChartEmpty` returns `true`). `trace-not-found` (spans were supplied but the
specified `traceId` matched none of them) mounts the chart and renders the full time-bar/axis
machinery with an empty plot and a centered message on the canvas. The combined-waterfall case
(spans present, no `traceId` filter) is never an empty state.
_Avoid_: empty chart (ambiguous); describing the `no-data` library overlay as a "canvas" message
(it is a DOM overlay, distinct from the `trace-not-found` canvas draw).

**Time bar**:
The horizontal strip at the top of the trace chart that renders the x-axis ticks, tick labels, and
vertical gridlines through the plot. It is `timeBarHeight` pixels tall (a `theme.trace` token,
default 32), and `plot.top` equals `timeBar.height`, so the plot area sits immediately below it.
In `'time'` x-scale mode, the time bar can render **stacked tick-label rows** (see **Tick layer**):
a fine sub-second detail row at the bottom (nearest the plot) plus coarser absolute-time rows above
it, governed by the `theme.trace.timeAxisLayerCount` token. In `'linear'` mode, a single relative-
elapsed row is always shown regardless of the token. The time bar reuses the same raster engine
(`continuousTimeRasters` / `numericalRasters`) as the XY chart's multilayer time axis; it is the
vertical mirror of that axis — ticks protrude **down** and coarser rows stack **upward**. See
[ADR 0024](./docs/adr/trace-viz/0024-multilevel-time-bar.md).
_Avoid_: time axis (the XY chart owns that term for its `<Axis>` component), ruler (implies
measurement marks only, not tick labels).

**Tick layer**:
One horizontal label row within the trace time bar (time mode only). Layer 0 is the finest
(sub-second detail, e.g. `0ms … 900ms`); higher layers are progressively coarser absolute-time rows
(e.g. `22:51:13`, `January 13, 2022`). Each tick layer corresponds to one `AxisLayer` returned by
`continuousTimeRasters`. Finer layers use the terse `minorTickLabelFormat`; the coarsest **shown**
layer uses the verbose `detailedLabelFormat`. The coarsest shown layer carries a **pinned leading
label** — the containing-interval label is clamped to the left edge so absolute-time context is always
visible even when panned between boundaries. The number of layers is configured by
`theme.trace.timeAxisLayerCount` (default 2; 0 = single row). Density gating may yield fewer drawn
layers than the configured cap. See [Spec 27](./docs/adr/trace-viz/specs/spec-27-multilevel-time-bar.md)
and [ADR 0024](./docs/adr/trace-viz/0024-multilevel-time-bar.md).
_Avoid_: row (too generic — a lane is also a row); axis layer (reserved for the XY chart's
`detailedLayer` / `layer` fields in `multilayer_ticks.ts`).
