# Spec 25 — Multi-level (stacked) time bar

**Goal:** when `xScaleType === 'time'`, render the trace time bar as **stacked tick-label rows**
rather than a single row. The finest row shows the existing sub-second detail (`0ms … 900ms`); each
additional row above it shows a coarser absolute-time label (`22:51:13`, `January 13, 2022`) drawn
from the engine layers the density gate already returns. The number of rows is controlled by a new
theme token `theme.trace.timeAxisLayerCount` (default `2`; `0` = today's single-row behavior).

The coarsest shown row carries a **pinned leading label**: even when the interval boundary sits off
the left edge, the label is clamped to `plot.left` so absolute-time context is always visible.
`linear` mode and `timeAxisLayerCount = 0` are byte-identical to today.

See [ADR 0024](../0024-multilevel-time-bar.md) for the rationale: why time mode only, why
`timeAxisLayerCount` is configurable, why the height is fixed (not adaptive), why pinned leading
labels are mandatory, why the stacking is reimplemented rather than generalised from XY.

**Depends on:**
- [Spec 4](./spec-4-time-bar.md) — `drawTimeBar`, raster engine reuse (`continuousTimeRasters`,
  `notTooDense`), `AxisLayer`/`Interval` types; the current single-row label collapse is the baseline
  this spec extends.
- [Spec 3](./spec-3-geometry.md) — `TraceStyle`, `buildGeometry`; the `timeBarHeight` token and the
  derived `plot.top` / `plot.height`.
- [ADR 0024](../0024-multilevel-time-bar.md) — all non-obvious decisions recorded there.

**Independent of** Specs 19 (nanosecond linear), 24 (clock-skew), 25 (running spans) — no normalize
pipeline changes; pure renderer + theme + geometry.

## Files

- `packages/charts/src/chart_types/trace_chart/render/time_bar.ts` — extend `drawTimeBar` for time
  mode: replace the single-row collapse ([L98–105](../../../../packages/charts/src/chart_types/trace_chart/render/time_bar.ts#L98-L105))
  and single `labelY` ([L154–169](../../../../packages/charts/src/chart_types/trace_chart/render/time_bar.ts#L154-L169))
  with a finest→coarsest labeled-layer loop (see Steps). `linear` path unchanged.
- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add `timeAxisLayerCount: number`
  to `TraceStyle`.
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — in time mode, derive effective
  time-bar height from the token (see Steps). `plot.top` / `plot.height` follow automatically.
- Six theme files (`light_theme.ts`, `dark_theme.ts`, `amsterdam_light_theme.ts`,
  `amsterdam_dark_theme.ts`, `legacy_light_theme.ts`, `legacy_dark_theme.ts` under
  `packages/charts/src/utils/themes/`) — add `timeAxisLayerCount: 2` to each `trace:` block
  (same wiring pattern as Spec 30's `runningLineDash`).
- `storybook/stories/trace/27_multilevel_time_bar.story.tsx` — new Storybook story; register in
  `trace.stories.tsx`.

## Contract

### New `TraceStyle` token (`render/types.ts`)

```ts
/**
 * Number of stacked tick-label rows in the trace time bar.
 * - `0` — single row (the existing sub-second detail only; today's behavior).
 * - `2` — two rows: finest detail + absolute time (e.g. `0ms` + `22:51:13`). Default.
 * - `3` — three rows: finest detail + time + date (e.g. `0ms` + `22:51:13` + `January 13, 2022`).
 * Applies only when `xScaleType === 'time'`. `linear` mode is always single-row regardless.
 * Density gating may reduce the number of rows actually drawn below this cap when zoomed out.
 * Mirrors the XY axis `AxisSpec.timeAxisLayerCount` token so consumers have one mental model.
 */
timeAxisLayerCount: number;
```

Default value `2` in all six theme files.

> **Implementation drift (see [ADR 0024](../0024-multilevel-time-bar.md), authoritative).** The code
> that shipped differs from the sketch below in two ways discovered during implementation:
> 1. **Naming:** the module constants are `TICK_LAYER_PADDING` and `tickLayerHeight` (not
>    `LABEL_ROW_PADDING`/`rowHeight`), aligning with the `CONTEXT.md` "tick layer" glossary.
> 2. **Pinned leading + height:** the `oneLayerBinS`/`iterFrom` leading-bin scan extension (and the
>    `unitIntervalWidth` import) were **removed** — the raster generators already emit every
>    pre-viewport boundary, so upper rows iterate the unextended scan and pin only the *nearest*
>    off-left boundary (ADR 0024 Decision 6). A `TICK_LAYER_BOTTOM_INSET` (= `TICK_HEIGHT`) is added to
>    the effective-height formula and to each row's label-y so the finest row clears the tick marks
>    (ADR 0024 Decision 5). Prefer the ADR over the pseudocode below where they disagree.

### Row layout rule

- `rowHeight` = `timeBarLabel.fontSize + LABEL_ROW_PADDING` (e.g. 10 px font + 6 px padding = 16 px
  per row). `LABEL_ROW_PADDING = 6` is a new module constant in `time_bar.ts`.
- **Effective time-bar height** (time mode) = `Math.max(style.timeBarHeight, style.timeAxisLayerCount * rowHeight)`.
  The existing `timeBarHeight = 32` already accommodates 2 rows at 16 px each; 3 rows requires ~48 px.
- `rowIndex = 0` → finest (ms) row; higher `rowIndex` → coarser absolute-time row.
- Label y-position (vertical flip — finest nearest the plot, coarser stacking upward):
  `labelY = timeBar.top + effectiveHeight − (rowIndex + 1) * rowHeight + LABEL_ROW_PADDING / 2`
  (mirrors XY's `Position.Top` sign: `tick.layer * layerGirth * −1`).

### Formatter rule

- `rowIndex < timeAxisLayerCount − 1` (finer rows, including the ms row): `layer.minorTickLabelFormat`.
  For the ms row this formats the epoch-second as milliseconds (existing line 156).
- `rowIndex === timeAxisLayerCount − 1` (coarsest shown row): `layer.detailedLabelFormat` (verbose —
  produces the full date+time string that gives the user absolute context).

### Pinned leading-label rule (upper rows only — `rowIndex ≥ 1`)

For each upper row the interval scan is **extended one bin before the viewport**:
```
binFrom = domainFrom − oneLayerBinWidthS
```
Any interval whose `minimum < domainFrom` but whose `supremum > domainFrom` (i.e. the viewport
falls inside the interval) emits a label clamped to `plot.left`:
```
tickX = max(tickX_raw, plot.left)
```
If the clamped leading tick is within `TICK_LABEL_EDGE_PX` of the next in-view boundary tick for
the same row, the boundary tick's label is **suppressed** to prevent overlap (à la the `minLabelGap`
gap check in
[multilayer_ticks.ts:106–123](../../../../packages/charts/src/chart_types/xy_chart/axes/timeslip/multilayer_ticks.ts#L106-L123)).

The **finest (ms) row does not use the leading-label extension** — it keeps the current hard-skip
(`tickX < plot.left || tickX > plot.left + plot.width`) unchanged, because ms ticks are dense
within the viewport and there is no absolute-context gap to fill.

## Steps

### 1. `render/types.ts` — new token

Add `timeAxisLayerCount: number` to `TraceStyle` with the JSDoc above.

### 2. `render/geometry.ts` — effective height

In `buildGeometry`, compute the effective time-bar height before building the `timeBar` rect:

```ts
const rowHeight = style.timeBarLabel.fontSize + LABEL_ROW_PADDING; // LABEL_ROW_PADDING imported from time_bar.ts
const effectiveTimeBarHeight = isTime                               // xScaleType passed into buildGeometry
  ? Math.max(style.timeBarHeight, style.timeAxisLayerCount * rowHeight)
  : style.timeBarHeight;

const timeBar = { top: 0, left: plotLeft, width: plotWidth, height: effectiveTimeBarHeight };
const plot    = { top: effectiveTimeBarHeight, left: plotLeft, width: plotWidth,
                  height: Math.max(0, canvasHeight - effectiveTimeBarHeight) };
```

`xScaleType` is already an argument to `buildGeometry` via `traceSpec.xScaleType`
([trace_chart.tsx](../../../../packages/charts/src/chart_types/trace_chart/trace_chart.tsx));
if it is not today, thread it through. `LABEL_ROW_PADDING` is exported from `time_bar.ts`.

### 3. `render/time_bar.ts` — multi-row draw loop

Replace the single-row collapse (`L98–105`) and single-label draw (`L154–169`) with the following
in the `isTime` branch. The `!isTime` branch (linear) is **unchanged**.

```ts
// --- Multi-row label draw (time mode) ---
// Collect the finest timeAxisLayerCount labeled layers (finest→coarsest, matching raster order).
const rowHeight = style.timeBarLabel.fontSize + LABEL_ROW_PADDING;
const labelLayers: Array<{ layer: AxisLayer<Interval>; rowIndex: number }> = [];
let rowIndex = -1;
for (const layer of layers) {
  if (!layer.labeled) continue;
  rowIndex++;
  if (rowIndex >= style.timeAxisLayerCount) break; // cap at token
  labelLayers.push({ layer, rowIndex });
}
const coarsestRowIndex = rowIndex; // the highest index actually collected

for (const { layer, rowIndex: ri } of labelLayers) {
  const isFinestRow = ri === 0;
  const isCoarsestShown = ri === coarsestRowIndex;
  const labelFormat = isCoarsestShown ? layer.detailedLabelFormat : layer.minorTickLabelFormat;

  // Extend scan range for upper rows to emit the containing-interval leading tick.
  const oneLayerBinS = unitIntervalWidth[layer.unit] * layer.unitMultiplier;
  const iterFrom = isFinestRow ? domainFrom : domainFrom - oneLayerBinS;
  const iterTo   = domainTo;

  const rowLabelY = timeBar.top + timeBar.height - (ri + 1) * rowHeight + LABEL_ROW_PADDING / 2;

  let prevTickX: number | null = null;

  for (const { minimum } of layer.intervals(iterFrom, iterTo)) {
    const tickMs = minimum * MS_PER_SECOND;
    const tickXRaw = scale(tickMs);

    // Finest row: skip off-plot (today's behavior).
    if (isFinestRow && (tickXRaw < plot.left || tickXRaw > plot.left + plot.width)) continue;

    // Upper rows: clamp leading (off-left) tick to plot.left.
    const tickX = isFinestRow ? tickXRaw : Math.max(tickXRaw, plot.left);

    // Upper rows: suppress boundary tick label when it would overlap the pinned leading label.
    const isPinnedLeading = !isFinestRow && tickXRaw < plot.left;
    if (!isPinnedLeading && prevTickX !== null && tickX - prevTickX < entry.labelBox.maxLabelBboxWidth + TICK_LABEL_MIN_GAP) {
      prevTickX = tickX;
      continue; // overlap — suppress this label
    }
    prevTickX = tickX;

    // Skip right-of-plot ticks (all rows).
    if (tickX > plot.left + plot.width) continue;

    // Tick line (drawn once per position by the existing loop — no change needed).

    // Label.
    const label = isTime ? labelFormat(minimum * MS_PER_SECOND) : formatElapsedMs(minimum);

    const plotRight = plot.left + plot.width;
    let tickLabelFont = labelFont;
    if (tickX - plot.left < TICK_LABEL_EDGE_PX) {
      tickLabelFont = { ...labelFont, align: 'left' };
    } else if (plotRight - tickX < TICK_LABEL_EDGE_PX) {
      tickLabelFont = { ...labelFont, align: 'right' };
    }
    renderText(ctx, { x: tickX, y: rowLabelY }, label, tickLabelFont);
  }
}
```

New module constants added above the function:
```ts
const LABEL_ROW_PADDING = 6;   // px between rows; exported for geometry.ts
const TICK_LABEL_MIN_GAP = 4;  // px minimum gap before a boundary label is suppressed
```

The existing tick-line and gridline draw loop (`L112–151`) is **unchanged** — it continues to draw
tick lines and gridlines for all raster layers as today.

> **Note on `unitIntervalWidth`:** it is exported from
> `xy_chart/axes/timeslip/continuous_time_rasters.ts` and already imported in `time_bar.ts` (via
> the raster engine). The leading-bin extension `oneLayerBinS` uses it to compute one interval width
> for that raster unit (e.g. 1 s for the `second` layer, 86400 s for `day`).

> **Note on `entry.labelBox.maxLabelBboxWidth`:** this is a rendering measurement unavailable in
> Canvas2D without measuring the text. Use a heuristic: `layer.minorTickLabelFormat` text widths
> can be pre-sampled at spec-time or approximated as `label.length * (fontSize * 0.6)` for the
> overlap check. The implementor may store the previous rendered tick's measured width for a tighter
> check.

### 4. Six theme files — new token

In each `trace:` block, add alongside `timeBarHeight`:
```ts
timeAxisLayerCount: 2,
```

### 5. `buildTraceStyle` / `theme.ts`

`buildTraceStyle` in `chart_types/trace_chart/theme.ts` is a passthrough (`theme.trace` returned
as-is). `utils/themes/theme.ts` only declares the `TraceStyle` type — both will pick up the new
field automatically from step 1 + 4.

### 6. Story (`27_multilevel_time_bar.story.tsx`)

Dataset: a realistic trace with an epoch-time `start` (e.g. July 13, 2022, 22:51:00 UTC → `start =
1657752660000`, spans of 5–300 ms). The story zooms the focus domain to a ~1 s window so the finest
row shows `0ms … 900ms` and the upper row shows the pinned `22:51:13` label. A Storybook `argType`
control exposes `timeAxisLayerCount` (0 / 2 / 3) so reviewers can toggle the layers and see the date
row appear at count 3.

## Edge cases

| Case | Behavior |
|---|---|
| `linear` mode | Single row (today's `formatElapsedMs` path). No token effect. |
| `timeAxisLayerCount = 0` | Single row, single label. Byte-identical to today for both time and linear. |
| `timeAxisLayerCount = 1` | Single row (the finest labeled layer), single label, but with the fixed-height geometry — effectively the same as `0` with a reserved slot. |
| Zoomed far out — only the coarsest layer survives `notTooDense` | Fewer rows drawn than the cap, but height is still reserved for `timeAxisLayerCount` rows (no reflow). |
| Pinned leading label fills the entire row | Expected — that is the point (only one interval in view, its boundary is off-screen). |
| Pinned leading label followed immediately by a boundary tick of the same row | The boundary tick's label is suppressed when it would overlap the pinned one. |
| Coarsest row uses `detailedLabelFormat` which is very long | Edge-clamp via `TICK_LABEL_EDGE_PX` and right-align still apply; `renderText` clips at the canvas edge. |
| All time spans start at a second boundary (the leading tick is exactly at `plot.left`) | Pinned extension emits a tick at the boundary — same x-position as the first in-view tick; the boundary tick label is suppressed as a duplicate. |
| `timeAxisLayerCount > 3` | Density gating limits the meaningful labeled layers for time mode to ~3–4 regardless; extra configured rows produce empty scan results and no label is drawn. Height is reserved for all configured rows. |

## Tests

- **Token propagation:** `buildGeometry` with `timeAxisLayerCount = 2` produces `timeBar.height ≥ 2 × rowHeight`; with `= 0` or `linear`, height equals `style.timeBarHeight`.
- **Plot reflow stability:** `plot.top` does not change between calls with different label counts within the same `timeAxisLayerCount` (only the *drawn* label count changes with zoom, not the reserved height).
- **Labeled-layer capping:** mock `continuousTimeRasters` returning 5 labeled layers; with `timeAxisLayerCount = 2` only 2 labels are drawn.
- **Formatter routing:** finest row (rowIndex 0) uses `minorTickLabelFormat`; coarsest shown row uses `detailedLabelFormat`.
- **Time-only guard:** call `drawTimeBar` with `xScaleType = 'linear'` and `timeAxisLayerCount = 3` — single row output, no upper rows.
- **`timeAxisLayerCount = 0`:** output byte-identical to today's single-row path.
- **Pinned leading label:** for a second-granularity upper row whose boundary is 500 ms before the viewport start, assert a label at `x = plot.left` (clamped) is rendered.
- **Finest ms row no leading extension:** with the ms-level viewport 300 ms inside a second interval, assert no off-screen ms tick is emitted.
- **Overlap suppression:** when the pinned leading label and the first in-view boundary tick are closer than `maxLabelBboxWidth + TICK_LABEL_MIN_GAP`, the boundary label is absent.
- **Edge alignment:** a tick at `plot.left` gets `align: 'left'`; one at `plot.left + plot.width` gets `align: 'right'`; one in the middle keeps the default.

## Review (`/review-claudio`)

- Verify `isTime` guard is applied before the multi-row loop — linear mode must not enter it.
- Verify `labelLayers` is collected finest→coarsest and capped at `timeAxisLayerCount` labeled
  layers only (unlabeled layers count as zero toward the cap — same rule as
  [multilayer_ticks.ts:86-87](../../../../packages/charts/src/chart_types/xy_chart/axes/timeslip/multilayer_ticks.ts#L86-L87)).
- Verify `detailedLabelFormat` is used only on the **coarsest shown row** (the highest collected
  `rowIndex`), not a fixed row index.
- Verify the leading-bin extension (`iterFrom = domainFrom - oneLayerBinS`) applies to upper rows
  only, and that the clamping `Math.max(tickXRaw, plot.left)` is conditional on `rowIndex ≥ 1`.
- Verify `plot.top` in `buildGeometry` equals the effective (possibly expanded) `timeBar.height`
  and `plot.height` equals `canvasHeight − effectiveTimeBarHeight` — not the raw `style.timeBarHeight`.
- Verify the existing tick-line and gridline draw loop is **unchanged** (tick lines still protrude at
  `timeBar.top + timeBar.height − TICK_HEIGHT`; gridlines still follow the finest labeled layer).
- Verify `LABEL_ROW_PADDING` is exported so `geometry.ts` can import it without duplicating the
  constant.

## Acceptance

- At the ~1 s zoom level in `time` mode: the `0ms` row (fine detail) is joined by an absolute
  `hh:mm:ss` row above it; with `timeAxisLayerCount: 3` a date row also appears.
- The absolute-time row always shows a label — it is pinned to the left edge when zoomed between
  boundary ticks.
- `linear` mode and `timeAxisLayerCount = 0` render byte-identically to today — no regression.
- The plot area (lane y-positions) does not reflow as zoom crosses a density threshold.
- `yarn jest trace_chart` and `yarn typecheck` are green.
