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
The thin mark spanning a span's full `[start, end]` extent in the Trace waterfall.
_Avoid_: bar, duration bar.

**Active segment**:
A solid mark inside a span's total line indicating active execution; a span has 0..N of them.
_Avoid_: active rect (singular — a span can have more than one).

**Self time**:
A span's extent minus the union of its children's extents. The default source of active segments when
a span's active range isn't supplied explicitly (see [ADR 0003](./docs/adr/0003-self-time-as-active-segments.md)).
_Avoid_: exclusive time (self time is the canonical term used throughout this codebase).

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
_Avoid_: viewport, visible range.

**Scroll offset**:
The vertical lane-scroll position (pixels) within the plot area. A component-instance value clamped to
`[0, max(0, spans.length × laneHeight − plot.height)]`. Distinct from the **Focus domain** (which is
the horizontal time window). When `scroll offset = 0` the topmost lane is flush with the top of the
plot; increasing the offset scrolls lanes upward, revealing lower lanes.
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
The rendering mode for span name labels: `gutter` (drawn in the fixed left panel — the default), `inline` (drawn over the span's bar near its start edge — the Chrome/Kibana style), or `none` (labels omitted; accessible only via tooltip and screen-reader table). Set via `theme.trace.labelPosition`. No auto-switching — the caller sets the mode explicitly.
_Avoid_: label mode, label placement.

**Focused lane**:
The lane currently selected via keyboard navigation, indicated by a full-width background highlight drawn in `draw()`. Distinct from the hovered lane (which is mouse-driven and controls tooltip visibility). Only one lane is focused at a time; focus is cleared when the canvas loses keyboard focus.
_Avoid_: selected lane, active lane (active is already used for active segments).

**Selection**:
The set of currently selected segments in the trace waterfall. Selection is managed as a
`TraceSelection` (an array of `TraceSegmentRef` values keyed by `spanId`). A **selected segment** is
one active or waiting segment highlighted by a stroke outline; a **selected span** (`region:'span'`)
is a whole-span selection spanning the full `[start, end]` extent, produced by double-click. Multiple
refs coexist in the set (multi-select via Shift/Ctrl/Cmd-click). Distinct from the focused lane
(keyboard nav) and the pinned tooltip (right-click detail view).
_Avoid_: selected lane (reserved for focused lane), highlighted span.

**Brush**:
A Shift+drag gesture on the plot area that draws an X-axis rubber-band rect and, on release, eases the focus domain to the selected time range. X-only (no Y-axis brushing). The default drag gesture (`dragMode='pan'`) is inverted by Shift; setting `dragMode='brush'` makes plain drag brush and Shift+drag pan.
_Avoid_: drag-zoom, range select, lasso.

**Pinned tooltip**:
A tooltip frozen in place after the user **right-clicks** a span. Remains visible regardless of
subsequent mouse position; dismissed by clicking elsewhere on the canvas or pressing Escape. Managed
as local component instance state, not redux. (Left-click is reserved for **selection**.)
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
affected lanes. Each critical interval may cover only a sub-range of a single active segment — it is
not span-granular. Consumers supply raw pre-normalization times (same units as `TraceDatum.start/end`);
the chart re-zeros them in `'linear'` mode alongside `activeSegments`.
_Avoid_: critical segment (would collide with the index-addressable active/waiting **segment**),
critical span (implies span-granular marking).

**Connection**:
A directed causal edge drawn as an orthogonal elbow connector from a source segment endpoint (the
**initiator**) to a target segment endpoint (the **initiated**), expressing the Chrome DevTools
"Initiated by" relationship. The arrow originates at the **end** of the `from` region and points to
the **start** of the `to` region. Connections may cross lanes arbitrarily. Distinct from the
structural `parentId` nesting, which is a tree relationship between whole spans.
_Avoid_: link (reserved for OTel's looser span-to-span `links` relation), dependency (overclaims
blocking semantics), arrow (a rendering term, not a domain concept).

**Empty state**:
The condition when the trace chart has no lanes to render. Two distinct cases: `no-data` (the `data`
prop was empty — no spans supplied at all) and `trace-not-found` (spans were supplied but the
specified `traceId` matched none of them). Each case renders a distinct centered message on the
canvas. The combined-waterfall case (spans present, no `traceId` filter) is never an empty state.
_Avoid_: empty chart, no results (those are library-wide terms for other chart types).
