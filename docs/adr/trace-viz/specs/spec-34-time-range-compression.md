---
status: provisional
domain: trace-viz
owners: []
supersedes: []
---

# Spec 34 — Time-range compression (interactive inverse fisheye)

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

> **Status: provisional / not yet implemented.** This is a forward-looking plan for a deferred feature.
> The rationale, rejected alternatives, and the internal scale-seam blast radius live in
> [ADR 0036](../0036-skewed-duration-readability.md); this spec captures the intended product behavior
> and public API so a future PR can build it without re-litigating the shape.

## Summary

A Trace chart may **compress one or more time ranges** on demand: the analyst selects a stretch of the
timeline and it is drawn narrower than its true proportional width, so the surrounding spans expand
into the freed space. It is the inverse of a fisheye — rather than magnifying a focal area, it shrinks
a chosen range while everything else keeps real proportions. This is the remedy for a **skewed** trace
where one long span (an AI agent step, a long poll, a batch job) is mostly dead air that crowds a dense
cluster of short spans into an unreadable sliver.

Compression is **user-directed and time-range-based**, never automatic and never span-specific. It is a
scale transform layered under the existing axis, so it composes with both `time` and `linear`
`xScaleType` rather than introducing a new scale type. It is **controlled** (the consumer owns the set
of compressed ranges) and **persistent** (it survives zoom and pan until explicitly removed).

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `compressedRanges` | prop | Controlled list of `[startMs, endMs]` time ranges currently compressed. Each range renders as a fixed-width band instead of at its true proportional width. Omitted/empty ⇒ the chart renders as a pure linear scale (today's behavior). |
| `onCompressedRangesChange` | prop (callback) | Fired **perform-and-fire** when the user adds or removes a compressed range via the gesture. The chart does not mutate its own scale; the parent decides whether to update `compressedRanges`. |
| `theme.trace.compressedBandWidthPx` | theme token | Fixed pixel width a compressed range collapses to, regardless of its real duration. |

## Behavior & acceptance

- **Enter by gesture.** An **Alt/Option+drag** rubber-band over the plot marks the swept time range for
  compression. It is a sibling of the zoom brush on a distinct modifier, so it does not shadow the
  existing brush-zoom gesture. On release the swept `[start, end]` is reported through
  `onCompressedRangesChange`.
- **Controlled, perform-and-fire, echo-suppressed.** The chart never compresses on its own: the gesture
  only fires the callback, and compression appears when the parent passes the range back in
  `compressedRanges`. Re-emitting the current value does not thrash. This mirrors the controlled
  patterns used for segment selection, collapse state, and focus domain.
- **Fixed-width band.** A compressed range collapses to `compressedBandWidthPx` regardless of its true
  duration, drawn with a **break / squiggle marker** and its two boundary timestamps so the discontinuity
  is legible. Time-bar ticks that fall inside a compressed range are suppressed.
- **Proportions preserved elsewhere.** Uncompressed regions keep their true linear proportions; the width
  reclaimed from compressed ranges is redistributed to them, so short spans outside the dead air grow to
  a readable size.
- **Composes with both scales.** Compression is a transform on the value→pixel mapping, not a new
  `xScaleType`; it applies under both `time` and `linear`.
- **Persistent through zoom and pan.** A compressed range stays compressed across zoom and pan until the
  user explicitly removes it — it is not auto-relaxed and not tied to a particular view.
- **Removal.** Clicking a break marker, or re-sweeping the gesture across an existing band, removes that
  range and fires `onCompressedRangesChange`. Removal is likewise perform-and-fire.
- **Merging.** Overlapping or adjacent compressed ranges resolve to a single band.
- **Aligned interaction.** Picking, tooltips, selection, keyboard focus, and pointer-to-time math all map
  through the compressed layout, so hit-testing and hover stay aligned with what is drawn (including at
  the seams of a band).
- **No-op when unset.** With no `compressedRanges`, rendering, picking, and tick generation are identical
  to today's pure linear scale.

## Decisions

- [ADR 0036 — Skewed-duration readability: minimum span mark + interactive inverse-fisheye time compression](../0036-skewed-duration-readability.md): the rationale for two composable moves (B1 minimum span mark + B2 compression), the rejected alternatives, and the internal scale-seam blast radius.
- [ADR 0007 — Controlled `focusDomain` is perform-and-fire](../0007-focus-domain-perform-and-fire.md): compression is layered under the focus-domain zoom, which keeps operating in ms.
- [ADR 0011 — Segment selection model: controlled perform-and-fire](../0011-segment-selection-model.md): the controlled-prop + callback shape `compressedRanges` / `onCompressedRangesChange` follows.

## Non-goals

- **Automatic / heuristic compression:** no density- or dominance-triggered auto-collapse. The analyst
  compresses exactly the dead air they see, which sidesteps defining "dominates" and deciding what
  happens to spans nested inside a long parent.
- **Span-extent compression:** compressing a dominating span's `[start, end]` would squash its nested
  children. Compression is content-agnostic and time-range-based.
- **Log / symlog x-scale:** a global re-skew is a different tool; it re-skews *all* spacing rather than
  only the chosen dead air. It may still arrive later as an orthogonal `xScaleType`.
- **Dampened-proportional or zero-width bands:** a dampened band frees too little space to be worth it;
  a 0 px cut leaves no room for the break marker and boundary labels that keep the seam legible. The band
  is a fixed small width.
- **Cursor-following magnification:** this is not an animated fisheye lens; ranges are committed via the
  gesture and persist until removed.
