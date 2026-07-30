---
status: provisional
domain: trace-viz
owners: []
supersedes: []
---

# Skewed-duration readability: minimum span mark + interactive inverse-fisheye time compression

**Status:** **B1 implemented** (minimum span mark, `minSpanWidthPx`); **B2 deferred**, its behavior
specified in [Spec 34](./specs/spec-34-time-range-compression.md). This record captures the two
complementary moves agreed for the skewed-duration problem and the rationale behind each.

## Context

A trace where one span dwarfs the rest is common (an AI agent step, a long poll, a batch job). In the
stress fixture (story `34_min_span_width`) `run_agent` runs ~414 s while every
other span is a few ms. On the linear x-scale those short spans map to sub-pixel widths and vanish;
the dense `foreach` burst of ~63 `elasticsearch.request` spans collapses into a single invisible sliver
just left of the right edge.

The whole scale stack is linear: the `scale` closure built in `buildGeometry`, its inverse in
`pickRegion`, the pointer-px→ms conversion in `pixelRangeToDomain` / drag-pan, and tick generation in
the time bar (`numericalRasters` / `continuousTimeRasters`, which assume uniform px density).

A pure **log / symlog x-scale** was considered as the single fix but rejected as the primary approach
(see Alternatives): it needs a positive floor that the `linear`-mode rezeroed domain (`min = 0`)
violates, it re-skews *all* spacing (not just the dead air), and it fights the raster tick engines. The
agreed direction is two smaller, composable moves instead.

## Decision

### B1 — Minimum span mark (implement-ready design)

Guarantee that a span never renders narrower than a small floor so it stays locatable.

- A new **`TraceStyle` theme token `minSpanWidthPx`** (default `5`), tunable per theme.
- The floor applies to the span's **whole mark**:
  - `spanDisplay: 'duration'`: floor the bar rect width to `minSpanWidthPx`.
  - `spanDisplay: 'segments'` (default): floor the **total line** to `minSpanWidthPx` **and** guarantee
    a min-width **active mark** when the active footprint would be sub-floor, so an active leaf reads as
    active rather than idle.
- Marks are **left-anchored at the true start** and clamped so a floored mark near the right edge stays
  inside the plot.
- **Picking mirrors the floor.** `pickRegion` widens a span's hit area to the same floored pixel mark:
  when the pointer is within the floored mark it snaps the inverted time into `[start, end]`, so a
  floored (sub-pixel) span resolves to a real region instead of `empty`. Without this the tooltip and
  pointer cursor feel broken over a clearly-visible bar. The span's `start`/`end` **timing values are
  unchanged** — only the pixel hit envelope is widened, and only up to the same `minSpanWidthPx` the
  draw pass already uses, so selection semantics stay intact. Wide spans are unaffected (their floored
  mark equals their natural extent).
- **Dense clusters still overlap** at the floor (63 spans × 5 px in ~3 s of a 417 s domain merge into a
  smear). Accepted: B1 is a *visibility* safety net; **B2 is what makes a cluster analyzable** by
  freeing horizontal space. The two features are explicitly complementary.

### B2 — Interactive inverse-fisheye time-range compression (design; deferred)

The normative product behavior and public API for B2 live in its own behavioral spec —
[Spec 34 — Time-range compression](./specs/spec-34-time-range-compression.md). This ADR records only
the *decisions* behind that shape and the internal blast radius; see the spec for the observable contract.

The agreed decisions (rationale in **Alternatives considered** below):

- **User-directed, time-range-based, on demand** — not an automatic heuristic and not span-specific. The
  user chooses a **time range** and it is compressed relative to the rest: the inverse of a fisheye
  (shrink the chosen range so everything else expands into the freed width).
- **Built-in gesture + controlled prop** — an **Alt/Option+drag brush-to-compress** gesture (a sibling of
  the zoom brush on a distinct modifier) feeds a controlled `compressedRanges` prop with an
  `onCompressedRangesChange` callback, **perform-and-fire and echo-suppressed**, mirroring selection
  (ADR 0011), collapse (ADR 0026), and focus domain (ADR 0007).
- **Fixed small band (~24 px)** with a break / squiggle marker and boundary timestamps; time-bar ticks
  inside the band are suppressed.
- **Persistent** transform — it survives zoom and pan until the user explicitly removes it, and it
  **composes with both `time` and `linear`** (a scale transform, not a new `xScaleType`).

#### Scale seam / blast radius (for the future implementation)

The single linear `scale` closure becomes an ordered list of `[value-range → pixel-range]` segments
(uncompressed segments linear; compressed segments a fixed ~24 px). Everything that maps between value
and pixel space must walk the same piecewise mapping:

1. `scale(t)` in `geometry.ts`.
2. The inverse in `pickRegion` (`canvas2d_renderer.ts`).
3. `pixelRangeToDomain` and the drag-**pan** math in `interactions.ts` — the main item beyond the pure
   scale, because a uniform pointer-px pan is non-uniform in ms under a piecewise scale.
4. Time-bar tick generation — ticks inside a compressed band are suppressed and replaced by the break
   marker + boundary labels.

Zoom itself keeps operating in ms on the focus domain (unchanged); the piecewise mapping is layered
underneath it. A `buildViewKey` entry gates a view reset when the compressed set changes.

## Consequences

- B1 is a small, low-risk, themeable change that can ship independently and immediately improves the
  skew case's visibility.
- B2 is a larger, opt-in feature with a real scale-seam blast radius; its behavior is specified in
  [Spec 34](./specs/spec-34-time-range-compression.md) but not built. It follows the established
  controlled-prop + built-in-gesture pattern, so it does not introduce a new interaction paradigm.
- Together they cover the two failure modes of skewed traces: *invisible* short spans (B1) and
  *uninspectable* dense regions crowded out by dead air (B2).

## Alternatives considered

- **Log / symlog x-scale (single fix):** rejected as primary. Needs a positive floor the rezeroed
  `linear` domain (`min = 0`) breaks; re-skews all spacing rather than only the dead air; and the
  raster tick engines assume linear density, so tick selection would bunch left / starve right. A log
  scale could still be added later as an orthogonal `xScaleType`, but it does not address the "I want to
  keep real proportions except for this one gap" need that B2 does.
- **Automatic compression heuristic (density- or dominance-triggered):** rejected in favor of an
  on-demand gesture. Auto-detection has to define "dominates" and decide what happens to spans nested
  inside a long parent; the user-chosen range sidesteps both — the analyst compresses exactly the dead
  air they see.
- **Span-extent compression (compress a dominating span's `[start,end]`):** rejected — it squashes any
  nested children inside that span. Time-range compression is content-agnostic and user-directed.
- **Min-width on active segments only (leave the total line proportional):** rejected — an active leaf
  would then show a muted line with no salient fill, reading as "existed but idle". Flooring the whole
  mark keeps the active read honest.
- **Dampened-proportional or hard-cut (0 px) compressed band:** rejected in favor of a fixed ~24 px
  band — dampened frees less space (defeating the purpose); a 0 px cut leaves no room for the break
  marker + boundary labels that keep the compression legible.
