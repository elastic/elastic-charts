# ADR 0004 — Self-managed RAF render loop & the zoom-eases / pan-1:1 interaction model

**Status:** Accepted (Spec 6)

## Context

Spec 6 makes the trace chart interactive: a `requestAnimationFrame` loop drives zoom, pan, and lane
scroll; `domainTween` eases focus domain changes; and the kinetic flywheel coasts horizontal pan after
drag release.

Two decisions here are hard to reverse, non-obvious without context, and the result of a real
trade-off:

1. **Rendering architecture** — self-managed RAF loop vs. the redux selector pipeline.
2. **Easing model** — zoom eases via `domainTween`; drag-pan is 1:1 (not eased).

## Decision 1: Self-managed RAF render loop (Timeslip/Flame model)

The trace chart uses the **self-managed canvas family**: a redux-`connect`ed React class component
owns the stage canvas and drives its own RAF render/interaction loop via `withAnimation` +
`withDeltaTime`. The component directly holds mutable instance state (`zoomPan`, `tween`,
`scrollOffset`) and reads `this.props` at frame-call time so redux re-renders are seen without an
extra selector subscription.

**Alternatives considered:**

- **Redux selector pipeline** (`ShapeViewModel` + selector-based rerender): used by XY, heatmap,
  partition. Requires a snapshot-style renderer (draw once per state change) and doesn't support
  sub-frame easing or kinetic flywheel momentum.
- **Hybrid**: use selectors for data but fire the RAF loop from inside the renderer. Adds complexity
  for no gain — Timeslip and Flame prove the self-managed pattern is workable.

**Why the Timeslip+Flame blend:**

- **Timeslip** contributes: the `zoom_pan` projections (`doZoomAroundPosition`, `doPanFromPosition`,
  `endDrag`, `kineticFlywheel`), `domainTween`, and the `withAnimation`/`withDeltaTime` RAF helpers.
  Unlike Timeslip, Trace has all its data upfront (no `getData` fetch loop) and uses `domainTween`
  for easing rather than the raw zoom/pan state.
- **Flame** contributes: the `connect`ed class lifecycle pattern (instance-field RAF handles,
  `preventScroll` as a stable bound method for proper listener removal, `onChartRendered` fired once
  on mount with the note that firing it in `componentDidUpdate` creates an infinite update loop).

**Render-complete protocol:** `onChartRendered()` is dispatched once in `componentDidMount`, which
sets `state.chartRendered` in redux. The `ChartStatus` react component reads this state and owns
the `data-ech-render-complete` attribute — the Trace component does **not** render its own status div
(the same `todo` comment as in Timeslip and Flame, deferred to Spec 8/VRT). This is safe because the
mount frame is already settled (see Decision 2).

## Decision 2: Zoom eases via domainTween; drag-pan is 1:1

**The constraint is structural, not a preference.** `domainTween`'s completion test
([domain_tween.ts](../../../packages/charts/src/chart_types/timeslip/projections/domain_tween.ts)) is:

```
tweenIncomplete = |1 − (max−min) / (targetMax−targetMin)| > ε
```

It is **extent-only**: it checks whether the visible extent has reached the target extent. A pure
horizontal pan never changes the extent, so `domainTween` reports "done" on the very first frame and
**cannot ease a pan at all**. The tween can only smooth **zoom** (extent-changing) transitions.

**Consequences:**

| Interaction | Easing |
|---|---|
| Wheel zoom | Eased via `domainTween` (extent changes ✓) |
| Active drag-pan | 1:1 — frame snaps `tween.niceDomain` to `getFocusDomain` target |
| Post-release coast | 1:1 — `kineticFlywheel` decays velocity; frame snaps tween each step |
| Vertical scroll | 1:1 — `scrollOffset` is a direct pixel value |

The `easeZoom` instance flag separates the two code paths in the frame function:
- `easeZoom = true` (wheel): `domainTween(tween, deltaT, target)` → smooth extent change.
- `easeZoom = false` (drag/mount): `tween.niceDomainMin = target.domainFrom` etc. → 1:1 snap.

**Addendum — reset on x-domain-semantics change:** switching `xScaleType` or `format` changes the
reference-domain **origin** without changing its **extent** (linear re-zeroes spans to `[0, span]`;
time keeps the absolute epoch `[EPOCH_BASE, EPOCH_BASE+span]` — same `span`). Because the extent-only
completion test sees ratio ≈ 1 on frame 1, `domainTween` declares "done" after a single `mix()` step and
the RAF loop stops, stranding the view between the old and new origins. The view then creeps ~10% per
incidental re-render (the "updates only on hover" bug). A zoom exponent accumulated on the old domain
is also meaningless after the origin shifts.

Fix: `componentDidUpdate` compares a `viewKey = { xScaleType, format }` against the incoming props; on
change it calls `resetView()` (fit-all snap: `zoom=0`, NaN tween, `easeZoom=false`) before scheduling
the frame. This key pair is exactly what selects the `project()` branch; keying on the data ref would
nuke the user's zoom on every data refresh (rejected — streaming concern). `scrollOffset` is not reset
(orthogonal: the vertical lane position is independent of the horizontal scale).

Alternatives considered:
- **Extend `domainTween` with a position-completion metric** (check `|midpoint - targetMidpoint| < ε`).
  Would allow easing the origin shift, but `domainTween` is shared with Timeslip and Flame; adding a
  position check changes semantics across all consumers. Out of scope.
- **Preserve zoom across the origin shift** (don't reset). The reported bug — the view remains stranded
  and only moves on cursor hover. Rejected: the user sees garbage tick labels and must hover to unfreeze.

**Kinetic flywheel** (`kineticFlywheel`, decay 0.92/frame) is the **only** source of pan smoothness.
It runs inside the main frame function (not a separate sub-loop) and self-terminates when
`|velocity| < 0.01`. The loop keep-going condition is:

```
tweenOngoing || flywheelActive
```

**Mount snaps to fit-all in one frame:** initial `tween.niceDomainMin/Max = NaN`. On the first frame,
`domainTween` sees `NaN` and snaps directly to the target (fit-all). `tweenIncomplete` is `false`
(extent check: `|1−1|=0 ≤ ε`), `flywheelActive` is `false`, so the loop stops after exactly one
frame — no idle RAF churn. `onChartRendered` fires after this settled view.

**Spec-letter deviation:** the Spec 6 reuse list names `doPanFromJumpDelta` for drag. The
implementation uses `doPanFromPosition` instead. This is intentional: `doPanFromPosition` tracks
`dragVelocity` on each call, which `endDrag` copies to `flyVelocity` for the kinetic coast.
`doPanFromJumpDelta` does not track velocity, so the coast would be always-zero. The spirit of the
spec (smooth pan with kinetic momentum) requires `doPanFromPosition`.

## Decision 3: Zoom-depth floor at the finest raster (1 ms), clamped locally in the wheel handler

> **Amended (Spec 18 / ADR 0010):** The 1 ms floor described below applies only to the `'time'`
> x-scale type. For `'linear'` scale, the floor was lowered to **1 ns** (`1e-6 ms`). The original
> objection (sub-ms ticks all render the same integer-ms label) is void once the tick formatter
> switches units (µs/ns), keeping labels distinct. See [ADR 0010](./0010-linear-scale-nanosecond-precision.md).

The millisecond raster (`continuousTimeRasters`, `BinUnit: 'millisecond'`, interval width `0.001`s) is
the finest time granularity the axis engine can label. Below 1 ms the engine keeps emitting bins whose
integer-ms labels repeat — the user sees identical "X ms" markers across the whole time bar.

**The constraint:** `focus.zoom` is exponential: `visibleExtent = referenceExtent / 2^zoom`. The
shared `ZOOM_MAX = 35` in `zoom_pan.ts` is a domain-agnostic constant set for Timeslip and cannot be
lowered for trace without affecting every chart that reuses the projection. The clamp must be
per-chart.

**Implementation:** in the trace wheel handler, after `doZoomAroundPosition`:

```ts
const zoomMax = multiplierToZoom(MIN_VISIBLE_EXTENT_MS / referenceExtentMs);
// i.e. log2(referenceExtentMs / 1ms) — the zoom level at which the window spans exactly 1 ms
this.zoomPan.focus.zoom = Math.min(this.zoomPan.focus.zoom, zoomMax);
```

where `MIN_VISIBLE_EXTENT_MS = 1` and `multiplierToZoom` is the existing exported helper from
`zoom_pan.ts`. The wheel handler is the trace chart's sole zoom entry point (no touch/pinch), so one
clamp site covers everything.

**Rendering complement:** the 1 ms zoom floor prevents the *domain* from shrinking below 1 ms, but
the linear-mode raster engine (`numericalRasters`) can still subdivide its interval list into
sub-ms steps (0.1/0.2/0.5 ms via `oneFive`). At the floor boundary that produces ~11 ticks all
formatted to the same integer-ms label by `formatElapsedMs`. The fix is a **whole-ms boundary
filter** in the time-bar render loop: for linear mode only, any tick whose `tickMs` is not within
`1e-6` of a whole millisecond is skipped. This renders at most one tick per millisecond, with the
tick line and label at the exact integer position — no position/label mismatch. The filter is a
no-op for raster steps ≥ 1 ms (all integer-valued), so it has zero effect outside the deep-zoom
case. Time mode is exempt: `continuousTimeRasters` already bottoms out at integer-ms ticks, and
applying an epsilon test to large epoch-ms values risks float-precision false positives.

**Alternatives considered:**

- **Fractional-ms labels** (`344.0ms`, `344.1ms`, …): keeps all ticks but shows sub-ms precision,
  which contradicts the 1 ms zoom floor — if 0.1 ms is displayable, why stop zoom at 1 ms?
  Rejected: incoherent with the declared finest resolution.
- **Label-dedup** (skip ticks whose formatted label was already rendered): would suppress the right
  labels but still draw spurious tick lines at fractional-ms positions — position/label mismatch.
  Rejected: misleads users about where the boundaries are.
- **Thread a domain-aware cap into `zoom_pan.ts`** (make `clampZoom` domain-aware). Rejected: wider
  blast radius; Timeslip has its own intended range of zoom, and coupling the shared projection to a
  specific minimum interval would be surprising.
- **Clamp at raster layer selection** (suppress display below 1 ms without stopping zoom). Rejected:
  hides the problem rather than fixing it — the axis would go blank and users couldn't know they'd
  zoomed past the floor.

## Decision 4: Layout uses actual `chartDimensions`; `roundUpSize` is not used

`roundUpSize` ([flame_chart/render/common.ts](../../../packages/charts/src/chart_types/flame_chart/render/common.ts))
rounds dimensions up to the nearest 256 px multiple to reuse a WebGL/Canvas2D backing store across
small resizes (a Flame/WebGL optimization). Applied to Canvas2D *plot-layout math* it creates a
correctness cliff: `chartDimensions.height ≈ 240` (the `<Chart title>` header is a flex sibling
*outside* the `ResizeObserver`-measured area) rounds up to 512, making the computed plot height 480 px
instead of 208 px, and `maxScroll = max(0, 384 − 480) = 0` — vertical scroll stops working entirely.

**Decision:** the trace chart sizes both the `<canvas>` element and all layout/interaction math to the
exact `chartDimensions` values. No `roundUpSize`, no 256 px quantization. This diverges intentionally
from the Flame lineage described in Decision 1: Canvas2D backing-store reallocation on resize is
cheap, and correctness is not negotiable.

**Alternatives considered:**

- **Keep `roundUpSize` only on the `<canvas>` element, use actual dimensions for layout math** (the
  Flame pattern). Technically correct, but relies on the container's `overflow:hidden` to clip the
  oversized canvas box, and the benefit (avoiding Canvas2D realloc on resize) does not justify the
  complexity for this chart type.

## Consequences

- The frame loop terminates after one frame on mount and after each interaction settles. No idle RAF
  churn. This is verifiable in review: the keep-going condition must include both `tweenOngoing` and
  `flywheelActive`, with neither set spuriously.
- Adding a smooth pan in the future would require either extending `domainTween` with a position-based
  completion metric or introducing a separate pan-tween state. The current architecture does not
  preclude this; the `easeZoom` flag is the extension point.
- The `render-complete` / `data-ech-render-complete` protocol (Spec 8 VRT) can assume the trace chart
  settles within one rAF tick on mount, making it safe to assert rendered content without polling.
- The zoom-depth floor (Decision 3) is the only place `MIN_VISIBLE_EXTENT_MS` appears; extending it
  to support a user-configurable minimum zoom is a future-API addition, not a refactor.
- The exact-dimensions layout (Decision 4) means the trace chart's canvas element is never larger than
  the visible area. A future VRT suite can safely screenshot the full canvas without clipping concerns.
