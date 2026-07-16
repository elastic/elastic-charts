# Spec 19 — Nanosecond precision for linear x-scale

**Goal:** lower the minimum visible extent for `'linear'` x-scale from 1 ms to 1 ns, enabling
deep zoom into nanosecond OTLP timing on single traces. Axis tick labels switch units (µs/ns) so
they remain distinct at fine zoom levels. Epoch `'time'` scale is unchanged (1 ms floor). See
[ADR 0010](../0010-linear-scale-nanosecond-precision.md) for the full decision record.

**Depends on:** [Spec 4](./spec-4-time-bar.md) — `time_bar.ts` tick rendering and `formatElapsedMs`;
[Spec 6](./spec-6-connected-component.md) — wheel handler in `trace_chart.tsx`; ADR 0010.

## Files

- `packages/charts/src/chart_types/trace_chart/render/interaction.ts` — add
  `MIN_VISIBLE_EXTENT_LINEAR_MS = 1e-6` (1 ns) exported constant.
- `packages/charts/src/chart_types/trace_chart/render/time_bar.ts` — remove the whole-ms skip
  filter for linear mode; extend `formatElapsedMs` with µs/ns branches.
- `packages/charts/src/chart_types/trace_chart/render/tooltip.ts` — extend `formatMs` down to ns.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — import and use
  `MIN_VISIBLE_EXTENT_LINEAR_MS` in the wheel handler.

## Contract

**`MIN_VISIBLE_EXTENT_LINEAR_MS = 1e-6`** (in ms; equals 1 ns). `MIN_VISIBLE_EXTENT_MS = 1`
(time mode) is unchanged.

**`formatElapsedMs(ms)` unit steps:**
- `ms < 1e-3` → `${Math.round(ms * 1e6)}ns` (nanoseconds)
- `ms < 1` → `${Math.round(ms * 1000)}µs` (microseconds)
- existing ms / s / m branches unchanged

**`formatMs(ms)` unit steps (tooltip durations):**
- `ms >= 1000` → `X.XX s`
- `ms >= 1` → `X.XX ms`
- `ms >= 1e-3` → `XXX µs`
- else → `XXX ns`

**Whole-ms skip filter removal:** the filter
`if (!isTime && Math.abs(tickMs - Math.round(tickMs)) > 1e-6) continue` in `time_bar.ts` was
ADR 0004 D3's rendering complement — it discarded sub-ms ticks because they all produced the same
integer-ms label. With unit-switching formatters the labels are now distinct, so the filter is
removed for linear mode.

**Wheel handler:** the existing `computeZoomMax(referenceExtentMs)` call (which implicitly used
`MIN_VISIBLE_EXTENT_MS = 1`) is replaced with:
```ts
const minExtent = traceSpec.xScaleType === 'linear' ? MIN_VISIBLE_EXTENT_LINEAR_MS : MIN_VISIBLE_EXTENT_MS;
this.zoomPan.focus.zoom = Math.min(this.zoomPan.focus.zoom, computeZoomMax(referenceExtentMs, minExtent));
```

## Steps

1. Add `export const MIN_VISIBLE_EXTENT_LINEAR_MS = 1e-6` to `render/interaction.ts`, with a
   JSDoc comment noting the ZOOM_MAX≈34 s bound (see ADR 0010).
2. In `trace_chart.tsx` wheel handler, import `MIN_VISIBLE_EXTENT_LINEAR_MS` and pass the
   scale-appropriate floor into `computeZoomMax`.
3. In `time_bar.ts`, remove the whole-ms skip guard for linear mode (`!isTime && …`).
4. Extend `formatElapsedMs` with µs/ns branches before the existing `ms < 1000` check.
5. In `tooltip.ts`, extend `formatMs` with an ns branch below the existing µs branch.

## Storybook

Use the existing `storybook/stories/trace/12_kibana_trace.story.tsx` (linear scale, real OTLP
data with sub-ms span durations from `fromOtlp`). Verify by wheel-zooming past 1 ms to confirm
µs → ns tick labels appear without repeats. No new story is required; add a comment to the existing
story noting the ns zoom capability.

## Tests

- `formatElapsedMs`:
  - `1e-6` → `"1ns"`, `5e-6` → `"5ns"`, `1e-3` → `"1µs"`, `5e-4` → `"500µs"`,
    `0.1` → `"100µs"`, `1` → `"1ms"`, `1500` → `"1.5s"`.
- `formatMs`:
  - `1e-6` → `"1 ns"`, `5e-4` → `"500 µs"`, `1.5` → `"1.50 ms"`, `1500` → `"1.50 s"`.
- `computeZoomMax` with `MIN_VISIBLE_EXTENT_LINEAR_MS`: for a 10 000 ms domain,
  the returned `zoomMax` allows zooming past 1 ms without clamping.
- Wheel handler integration: with `xScaleType='linear'`, the zoom clamp uses `1e-6` as the floor,
  not `1`.

## Review (`/review-claudio`)

- Verify removing the whole-ms filter does not produce duplicate labels from the coarse raster
  layer at the ms/µs boundary — both fine and coarse layers must emit distinct labels.
- Verify the ZOOM_MAX≈34 s bound is noted in a code comment near `MIN_VISIBLE_EXTENT_LINEAR_MS`.
- Verify `formatElapsedMs` and `formatMs` produce integer-valued labels at all tick step
  magnitudes (1ns, 5ns, 10ns, 100ns, 1µs, …) — `Math.round` must not introduce rounding drift at
  any float64-representable step boundary.

## Acceptance

- `12_kibana_trace.story.tsx`: wheel-zoom past 1 ms shows µs then ns tick labels without repeats.
- `09_large_n.story.tsx` (linear scale): zoom/pan/scroll remain smooth; no rendering artifacts.
- `yarn jest trace_chart` and `yarn typecheck` green.
