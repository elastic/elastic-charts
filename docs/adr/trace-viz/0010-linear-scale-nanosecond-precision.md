
# ADR 0010 — Linear-scale nanosecond precision (supersedes ADR 0004 Decision 3 for `linear`)

**Status:** Accepted (Spec 19)

## Context

ADR 0004 Decision 3 set a **1 ms** minimum visible extent for both x-scale types, citing that
sub-ms ticks all render the same integer-ms label (e.g. `344ms` repeated across the axis). Below
1 ms the axis goes visually useless.

The trace chart accepts OTLP data via `fromOtlp`, which converts `startTimeUnixNano`
(string/bigint nanoseconds) to milliseconds using bigint arithmetic — preserving sub-ms fractional
precision in the `float64` result (e.g. `1700000000123.456789` ms). For `'linear'` x-scale type,
`normalize()` re-zeros all timestamps to zero, so the domain spans `[0, totalDurationMs]`. For a
typical single-service trace this is in the range 1 ms–10 000 ms — meaning float64 can represent
nanosecond differences without precision loss (contrast with epoch ms ~1.7e12, which tops out near
sub-µs resolution).

The `numericalRasters` tick engine has no lower step bound — step =
`niceMantissa · 10^floor(log10(rawPitch))` where `niceMantissa ∈ {1, 5}`, and any negative exponent
is valid. The only thing that made sub-ms ticks useless was the tick label formatter: it rounded
every value to integer-ms. If the formatter switches units at the µs and ns breakpoints, sub-ms
ticks produce distinct, readable labels with no repetition.

## Decision

Lower the minimum visible extent for **`'linear'` x-scale only** to **1 ns** (`1e-6 ms`). The
`'time'` scale retains the 1 ms floor (float64 cannot represent epoch-ns without precision loss).

This supersedes ADR 0004 Decision 3 for the `'linear'` case only. The `'time'` case in Decision 3
is unchanged.

Implementation requires four local changes:

1. **`render/interaction.ts`** — add `MIN_VISIBLE_EXTENT_LINEAR_MS = 1e-6` alongside
   `MIN_VISIBLE_EXTENT_MS = 1`. `computeZoomMax` already accepts the value as a parameter.
2. **`trace_chart.tsx` wheel handler** — pass the scale-appropriate floor into `computeZoomMax`
   (`'linear'` → `MIN_VISIBLE_EXTENT_LINEAR_MS`, `'time'` → `MIN_VISIBLE_EXTENT_MS`).
3. **`render/time_bar.ts`** — remove the whole-ms skip filter (the rendering complement of the old
   floor that discarded sub-ms ticks for linear mode); extend `formatElapsedMs` with µs/ns unit
   breakpoints so adjacent tick labels are always distinct.
4. **`render/tooltip.ts`** — extend `formatMs` down to ns for duration display in the tooltip.

## Consequences

- Wheel-zooming a linear-scale trace past 1 ms continues to µs and ns resolution, with tick
  labels like `100 µs`, `10 ns`, etc.
- **ZOOM_MAX = 35 bound:** `referenceExtent / 2^35 = 1 ns` requires `referenceExtent ≤ ~34 s`.
  Traces longer than ~34 s cannot reach 1 ns via wheel zoom. This is accepted: typical single-
  service OTLP traces are well under that bound, and lowering the shared `ZOOM_MAX` constant would
  affect every chart that reuses the `zoom_pan` projection (rejected per ADR 0004 D3's original
  reasoning about blast radius).
- Epoch `'time'` scale is completely unchanged (1 ms floor, integer-ms tick labels).
- The `'Minimum visible extent'` glossary entry in `CONTEXT.md` is updated to reflect the
  scale-dependent floors.

## Alternatives considered

- **Extend to `'time'` mode as well** — rejected: float64 at ~1.7e12 ms cannot represent ns
  differences without precision loss; the bigint-derived fractional bits are lost when combined
  with the large epoch base.
- **Show ns in tooltip only, keep axis at 1 ms** — possible, but inconsistent: the axis and
  tooltip would disagree on the finest granularity. The 1 ms floor was originally about the axis;
  once the axis can go to ns, the tooltip should match.
- **Use `BigInt` / split integer+fraction domain throughout** — would enable epoch-ns, but requires
  reworking geometry, zoom/pan projections, and the shared raster engine. Out of scope.
- **Keep `Math.round` labels, let duplicates repeat** — rejected: identical adjacent tick labels
  are the exact problem ADR 0004 D3 was written to prevent. Unit-switching is a better fix.
