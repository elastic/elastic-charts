# ADR 0024 — Multi-level time bar: stacked tick rows in time mode

**Status:** Accepted (Spec 25)

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
tickLayerHeight        = timeBarLabel.fontSize + TICK_LAYER_PADDING
effectiveTimeBarHeight = max(style.timeBarHeight, timeAxisLayerCount × tickLayerHeight + TICK_LAYER_BOTTOM_INSET)
```

`plot.top` = `effectiveTimeBarHeight`; `plot.height` = `canvasHeight − effectiveTimeBarHeight`. The
height is **fixed** for the configured `timeAxisLayerCount`, regardless of how many rows currently
have labels (density gating may reduce drawn labels without reducing the reservation).

**`TICK_LAYER_BOTTOM_INSET` — clearance for the tick marks (added during implementation).** The tick
marks protrude **down** from the bottom edge of the bar (`TICK_HEIGHT` px). Because the finest tick
layer sits nearest the plot (bottom of the stack), a stack sized to exactly `count × tickLayerHeight`
places the finest label row directly on top of — and slightly overlapping — those tick marks. `linear`
mode never hit this because it draws its single row at the **top** of the bar (`timeBar.top + 2`),
leaving the whole bar as implicit clearance. To give time mode the same breathing room, the effective
height reserves `TICK_LAYER_BOTTOM_INSET` (= `TICK_HEIGHT`) below the stack, and every row's label-y
is lifted by the same inset. The constant is exported from `time_bar.ts` so `geometry.ts` and the
demo story (`04_time_bar`) all size the bar from one source of truth. See
[time_bar.ts `TICK_LAYER_BOTTOM_INSET`](../../../packages/charts/src/chart_types/trace_chart/render/time_bar.ts).

**Alternative considered — shorten or move the tick marks instead of growing the bar:** would decouple
the tick length from the shared `TICK_HEIGHT` and make the trace ticks inconsistent with the rest of
the bar. Reserving a few px of height is simpler and keeps the tick geometry unchanged. Rejected.

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

With the default `fontSize = 10` a tick layer is 16 px (10 px font + 6 px `TICK_LAYER_PADDING`), so 2
rows plus the 6 px `TICK_LAYER_BOTTOM_INSET` need 38 px and 3 rows need 54 px — both exceed the default
`timeBarHeight = 32`, so the `max()` in the formula expands the bar automatically. Theme authors do not
need to hand-tune `timeBarHeight` per `timeAxisLayerCount`; the reservation is derived.

## Decision 6 — Pinned leading (containing-interval) label for upper rows: pin only the nearest off-left boundary

For an upper row (`rowIndex ≥ 1`) the row must always show the interval that **contains the left edge**
of the viewport (e.g. always showing `22:51:13` even when panned between `22:51:13.000` and
`22:51:14.000`, or `January 13, 2022` for a date row that changes only at midnight). That label is
drawn **clamped to `plot.left`**. When the pinned label would overlap the next in-view boundary label
of the same row, the boundary label is suppressed using a synchronous `ctx.measureText` width check
(`TICK_LABEL_MIN_GAP`).

The finest (ms) row does **not** pin — it hard-skips off-left ticks (`tickX < plot.left`). Dense ms
ticks are always within the viewport; there is no off-screen context to recover.

### Pin exactly one boundary — the nearest (corrected during implementation)

The raster interval generators (`continuousTimeRasters`) **emit every boundary from far before the
viewport**, not just the one containing the left edge — the single-row baseline relied on the caller
culling all off-plot ticks (`tickX < plot.left → continue`). The first implementation of this decision
assumed instead that extending the scan one bin (`iterFrom = domainFrom − oneLayerBinWidthS`) would
surface a *single* off-left tick, and flagged **every** off-left tick as "pinned" and clamped it to
`plot.left`, bypassing overlap suppression. Because the generator emits the whole pre-viewport history,
this stacked **all** of those labels on top of each other at `plot.left` — e.g. when zoomed to a 15 s
window on a mid-year timestamp the date row painted `January 1 … July 17` (≈200 labels) at the same
pixel. Zooming in reduced how many boundaries fell off-left, so the general axis "spread out" while the
top-left corner stayed garbled — the reported symptom.

**Corrected approach:** iterate the full `intervals(domainFrom, domainTo)` (no scan extension), and for
upper rows remember only the **last** (nearest, largest-`minimum`) off-left boundary as the
pinned-leading candidate. Flush it once — at `plot.left` — when the first in-view tick appears, or at
loop end if the whole row is off-left. All earlier off-left boundaries are dropped. This yields exactly
one containing-interval label per upper row at any zoom, plus the normal in-view boundary labels
(overlap-suppressed against the pinned one). The `iterFrom`/`oneLayerBinWidthS` extension and the
`unitIntervalWidth` import it required are removed.

**Alternative considered — boundary-only labels for all rows (no pinning):** simpler (no clamping). But
a slow-changing row (date) would show nothing while panned between boundaries — exactly the failure this
feature is meant to fix. A `time` trace zoomed to 1 s can spend minutes between midnight boundaries; the
date row would be blank for that entire time. Rejected.

**XY analogue:** [multilayer_ticks.ts:81–93](../../../packages/charts/src/chart_types/xy_chart/axes/timeslip/multilayer_ticks.ts#L81-L93)
extends the scan and uses `domainClampedPosition` to pin labels to the axis range. This ADR follows the
same *principle* (a containing-interval label pinned to the edge) but, because the trace generators
already emit pre-viewport boundaries, achieves it by selecting the nearest off-left boundary from the
unextended scan rather than by widening the scan.

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
- **No new cross-module imports for tick scanning.** An earlier draft imported `unitIntervalWidth`
  from `continuous_time_rasters.ts` to compute a leading-bin scan extension; the corrected pinned-leading
  approach (Decision 6) iterates the unextended `intervals(domainFrom, domainTo)` and selects the
  nearest off-left boundary, so that import was removed. `time_bar.ts` does add a `ctx.measureText`
  width check for overlap suppression, which requires setting `ctx.font` once (via `cssFontShorthand`)
  before the stacked-label pass.
- **Two constants are exported from `time_bar.ts` for shared sizing:** `TICK_LAYER_PADDING` (per-row
  padding) and `TICK_LAYER_BOTTOM_INSET` (tick-mark clearance). `geometry.ts` and the `04_time_bar`
  story import both so the reserved bar height is computed identically everywhere.
