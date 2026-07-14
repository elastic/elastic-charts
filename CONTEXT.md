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
The set of spans sharing one `traceId`. The Trace chart renders one trace at a time.

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
caller-defined inactivity. One of three hover regions alongside **active** and **empty**.
_Avoid_: idle (implies nothing is happening globally), blocked (implies a stall or error).

**Minimum visible extent**:
The smallest meaningful time window the trace chart allows via zoom-in: **1 ms**. This is the finest
granularity the time-raster axis engine can label; zooming beyond it repeats identical millisecond
labels. The floor applies to both `linear` and `time` x-scale types, since both store domain values in
ms. Distinct from the **Focus domain** (the current window, always ≥ the minimum visible extent after
clamping).
_Avoid_: minimum zoom level (implies a zoom exponent, not a time window).
