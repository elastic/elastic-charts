# ADR 0024 — Multi-level time bar: stacked tick rows in time mode

**Status:** Accepted (Spec 27)

## Context

In the trace chart's `time` x-scale mode, zooming to the ~1 s detail level makes every tick a
sub-second label (`0ms … 900ms`) that restarts at each second. The absolute wall-clock position
(which second, minute, hour, or date the visible window falls in) is lost. The user has to remember
— or look elsewhere — to know whether `450ms` means `22:51:13.450` or `22:51:14.450`.

The XY chart already solves the same problem via its **multilayer time axis**: a time-mode X axis
shows stacked label rows — fine ticks in the bottom row, progressively coarser absolute-time
annotations above. The trace time bar reuses the same raster engine
(`continuousTimeRasters` / `numericalRasters` from `xy_chart/axes/timeslip/`) and already receives
multiple labeled `AxisLayer` objects from that engine, each carrying a `minorTickLabelFormat` (terse)
and a `detailedLabelFormat` (verbose absolute-time string). Before this ADR the trace bar
**deliberately collapsed** those layers to a single labeled row — the comment at
[time_bar.ts:98–105](../../../packages/charts/src/chart_types/trace_chart/render/time_bar.ts#L98-L105)
explains why (drawing every labeled layer at the same y would cause overlap). This ADR lifts that
restriction and stacks the layers into distinct rows.

The trace bar sits at the **top** of the chart with ticks protruding **down** — the vertical mirror
of the XY bottom axis. The finest row sits nearest the plot (bottom of the bar); coarser rows stack
**upward**.

## Decision 1 — Time mode only; `linear` is single-row regardless

Stacked rows apply only when `xScaleType === 'time'`. `linear` mode retains the existing single
relative-elapsed row (`0ms`, `250ms`, … via `formatElapsedMs`).

**Rationale:** the lost-context problem is specific to epoch timestamps. In `linear` mode all ticks
are relative-from-zero (`0ms`, `1s`, `1m30s`) — there is no absolute wall-clock second or date to
show in an upper row. `numericalRasters` does return coarser layers, but they would carry coarser
relative units, not absolute dates/times. The feature would add complexity without solving anything
the user experiences.

## Decision 2 — Un-collapse the already-shared raster engine output

Rather than computing an independent second tick set, `drawTimeBar` iterates the
`AxisLayer<Interval>[]` already returned by `continuousTimeRasters` and draws the finest
`timeAxisLayerCount` labeled layers as distinct rows.

**Alternative considered — a second `continuousTimeRasters` call for coarse layers only:** adds a
second pass and potentially different density-gate parameters; the engine already returns all useful
layers in one call. Rejected.

**Why the collapse existed:** a single-row bar cannot draw multiple layers at the same y-coordinate.
The collapse was correct for a fixed-height bar — the only way to draw N rows is to reserve N × rowHeight
of height. This ADR adds that reservation (Decision 5), which is what makes the collapse removable.

## Decision 3 — Reimplement the flipped stacking loop in the trace time bar; do not generalise XY's `multilayerAxisEntry` / `tick_label`

The XY stacking machinery is in `multilayer_ticks.ts` (`multilayerAxisEntry`, `fillLayerTimeslip`)
and `renderer/canvas/axes/tick_label.ts` (`renderTickLabel`). These are tightly coupled to:
- `XDomain`, `ScaleContinuous`, `GetMeasuredTicks`, `Projection` — redux-selector types from the XY
  pipeline; none of these exist in the trace chart.
- `Position.Bottom` (the sign `+1` in `tick.layer * layerGirth * +1`) — the trace bar is
  `Position.Top` (sign `−1` / upward).
- Text measurement (`labelBox.maxLabelBboxWidth`) via the selector system — the trace bar renders on a
  canvas with synchronous `ctx.measureText`.

**Alternative considered — extract a chart-agnostic `multiLayerTimeTicks` helper:** a shared helper
would need to accept an abstract scale function, text-measurement callback, and layout direction flag.
The coupling surface is larger than the code being shared. Rejected in favour of a small,
self-contained loop in `time_bar.ts` that borrows only the *formula* (layer-index cap, formatter
routing, row y-offset) while staying inside the trace bar's existing idioms.

## Decision 4 — Configurable `theme.trace.timeAxisLayerCount`, default `2`; `0` = legacy single row

A new `TraceStyle` token `timeAxisLayerCount` (number) mirrors XY's `AxisSpec.timeAxisLayerCount`
(default `2`, also added at XY in the same release cycle). Values:
- `0` — single row; today's behavior; no height change.
- `2` — two rows: finest detail + absolute time (e.g. `0ms` + `22:51:13`). Default.
- `3` — three rows: finest detail + time + date (e.g. `0ms` + `22:51:13` + `January 13, 2022`).

**Alternative considered — fixed 3 rows:** no escape hatch, no match to XY's public API. Rejected.

**Alternative considered — fixed 2 rows (no token):** simpler, but prevents the date row and makes
the behavior differ from XY's configurable model. Rejected.

**Density gating (`notTooDense`) remains authoritative for row *content*.** When zoomed out, coarser
layers are not dense enough to survive the gate and no label is emitted for those rows — even though
height is reserved for them (Decision 5). `timeAxisLayerCount` is a **cap**, not a force.

## Decision 5 — Fixed effective time-bar height; no plot reflow

In `buildGeometry`, when `xScaleType === 'time'`:

```
effectiveTimeBarHeight = max(style.timeBarHeight, timeAxisLayerCount × rowHeight)
```

where `rowHeight = timeBarLabel.fontSize + LABEL_ROW_PADDING`. `plot.top` = `effectiveTimeBarHeight`;
`plot.height` = `canvasHeight − effectiveTimeBarHeight`. The height is **fixed** for the configured
`timeAxisLayerCount`, regardless of how many rows currently have labels (density gating may reduce
drawn labels without reducing the reservation).

**Alternative considered — adaptive height (shrink when rows are empty):** the plot area (and every
lane's y-position) would jump up/down each time the zoom crosses a density threshold and a row
appears or disappears. During a wheel-zoom gesture this is a per-frame layout shift — visually janky.
The scroll-offset clamp (`max(0, spans.length × laneHeight − plot.height)`) would also need to be
recomputed on every frame. Rejected.

**Trace analogue of XY's `getAllAxisLayersGirth`** (`axis_utils.ts:253-260`):
```ts
// XY: total stacked height = rows × rowHeight (fixed for the configured count)
axisLayerCount * maxLabelBoxGirth
```

The default `timeBarHeight = 32` already accommodates 2 rows at 16 px each (10 px font + 6 px
padding). 3 rows requires ~48 px — the theme files with `timeAxisLayerCount: 3` should set
`timeBarHeight: 48`, or the effective-height formula automatically expands it.

## Decision 6 — Pinned leading (containing-interval) label for upper rows

For an upper row (`rowIndex ≥ 1`), the interval scan is extended one bin before the viewport
(`iterFrom = domainFrom − oneLayerBinWidthS`). Any interval whose boundary sits off the left edge but
whose `supremum` enters the viewport emits a label **clamped to `plot.left`**, so the current
containing interval is always identified (e.g. always showing `22:51:13` even when panned between
`22:51:13.000` and `22:51:14.000`). When the pinned label would overlap the next in-view boundary
tick of the same row, the boundary tick label is suppressed.

The finest (ms) row does **not** use the leading-bin extension — it keeps the current hard-skip
(`tickX < plot.left`). Dense ms ticks are always within the viewport; there is no off-screen context
to recover.

**Alternative considered — boundary-only labels for all rows (no pinning):** simpler (no scan
extension, no clamping). But a slow-changing row (date) would show nothing while panned between
boundaries — which is exactly the failure this feature is meant to fix. A `time` trace zoomed to 1 s
can spend multiple minutes between midnight boundaries; the date row would be blank for that entire
time. Rejected.

**XY analogue:** [multilayer_ticks.ts:81–93](../../../packages/charts/src/chart_types/xy_chart/axes/timeslip/multilayer_ticks.ts#L81-L93)
extends the scan with `binStartsFrom = domainFromS − binWidth` and `binStartsTo = domainToS +
binWidth`, then `domainClampedPosition` pins labels to the axis range. This ADR follows the same
principle, specialised for the trace bar's left-edge-clamp.

## Decision 7 — Single tick + finest-row gridline; rows distinguished by label text only

The existing tick-line draw (one short tick per tick position, protruding from the bottom of the bar)
and gridline draw (one faint vertical line through the plot for the finest labeled layer) are
**unchanged**. Additional rows are distinguished solely by their stacked label text — no per-layer
tick lengthening.

**Alternative considered — XY-style per-layer tick length** (`tick.ts:33-56`): each layer's tick
grows by `extensionLayer * layerGirth`, giving coarser rows visually stronger tick marks. Provides
clearer visual hierarchy but adds tick-geometry computation and increases visual weight in a bar that
sits immediately above dense waterfall lanes. Rejected for this spec; can be revisited.

## Consequences

- **The plot area shrinks by a fixed slice in `time` mode** when `timeAxisLayerCount ≥ 2`, even when
  zoomed out (the height is always reserved). A trace canvas that previously showed N lanes now shows
  fewer lanes until the user resizes or scrolls. This is the expected cost of the feature and is
  noted in the story.
- **A new public theme token** `timeAxisLayerCount` is added across six theme files. Consumers who
  customise `theme.trace` will need to add the token; its absence should fall back to the default (2)
  rather than crash — ensure `buildTraceStyle` or the merge path handles `undefined`.
- **`linear` mode and `timeAxisLayerCount = 0` are behavior-preserving** (byte-identical output):
  the effective height formula collapses to `style.timeBarHeight`, and the label draw falls into the
  single-layer path — no functional change.
- **`unitIntervalWidth`** (from `continuous_time_rasters.ts`) must be imported in `time_bar.ts` for
  the leading-bin computation. It is already exported; this is the first import of it from outside
  the timeslip module into the trace chart.
