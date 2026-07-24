---
status: accepted
domain: trace-viz
owners: []
supersedes: []
---

# Trace badge rendering architecture

## Context

Trace Span badges need compact EUI-like visuals with text, image sources, loading and failure
placeholders, hover and activation hit testing, accessibility exposure, and optional visibility in
label-less modes. They must stay visually synchronized with Trace zoom, pan, vertical scroll, and
animation.

The rendering choice is not obvious:

- DOM rendering can reuse browser layout and potentially EUI-like composition, but introduces
  per-visible-badge DOM nodes, synchronization during canvas transforms, layering concerns, and
  export/screenshot ambiguity.
- Canvas2D rendering keeps badges in the same draw loop as spans and annotations, but requires
  Charts-owned badge drawing, text measurement, image loading state, placeholder rendering, and hit
  testing.
- A hybrid approach may split responsibilities, but risks paying complexity from both sides.

## Decision

**Canvas2D.** Span badges are drawn by the Trace chart's own Canvas2D draw loop, with Charts-owned
badge text measurement, image loading state, placeholder rendering, and hit testing. Badge visuals
live in the same `draw()` pass as spans, total lines, and the critical path; hit testing is a
`pickBadge` pass over the frozen `TraceGeometry` alongside `pickRegion` / `pickDisclosure`.

### How the two candidates were compared

Two throwaway badge overlays were built on the large-N story (`09_large_n`), toggled by a knob:

- **Canvas2D overlay** — badges drawn to a dedicated `<canvas>` each frame, exercising the real
  per-badge draw cost (`measureText` to size the pill, rounded-rect fill, hollow border, icon dot,
  label text), animated per frame to simulate pan.
- **DOM overlay** — `visible lanes × badges per lane` absolutely-positioned badge nodes, animated per
  frame via a transform.

Both overlays measure badge *rendering* cost only. To probe the **sync** axis, the DOM overlay was
additionally wired to reposition from the public API's `onFocusDomainChange` signal (the only per-view
update a DOM consumer can subscribe to), which fires at RAF **settle** — not per frame. A `useSyncProbe`
harness then recorded the *stale window*: the time each domain-moving gesture (wheel-zoom, drag-pan)
spends between interaction start and the settle fire, during which a DOM overlay is necessarily frozen.
The hit-test and image-loading axes remain assessed by design analysis rather than the spike.

### Measured results

Same conditions for every run: 5000 spans, ~30 visible lanes, badges animated every frame, one
browser at 120 Hz.

| Run | Renderer | Spans | Badges | Frames | Dur (ms) | FPS (mean) | Frame mean (ms) | Frame p95 (ms) | Frame max (ms) | Long tasks |
|---|---|---|---|---|---|---|---|---|---|---|
| Baseline | none | 5000 | 0 | 940 | 7829 | 120.1 | 8.3 | 9.1 | 16.7 | 0 |
| DOM | dom | 5000 | 104 | 1403 | 11692 | 120.0 | 8.3 | 9.3 | 9.4 | 0 |
| Canvas2D | canvas | 5000 | 104 | 1235 | 10279 | 120.1 | 8.3 | 9.3 | 9.4 | 0 |

**Interpretation.** At ~104 badges the two renderers are perf-indistinguishable — both hold ~120 fps
with an 8.3 ms mean frame time, matching the no-badge baseline, and neither produced a long task. So
raw per-frame render cost does **not** discriminate DOM from Canvas2D at this density; frame time is a
wash. (Baseline's higher 16.7 ms max frame is a single startup/GC outlier, not a badge effect.)

Because per-frame cost is a tie at representative density, the decision is driven by the
non-performance axes below — where the two differ substantially — rather than by frame time.

**Measured sync results.** The stale-window probe (114 domain-moving gestures, 120 Hz browser) shows
a DOM overlay driven by the public settle-only signal is desynchronized from the waterfall for a
material window, while a Canvas2D pass is stale-free by construction:

| Overlay | Stale window (typical) | Stale window (sustained) |
|---|---|---|
| DOM (public API, `onFocusDomainChange` settle-only) | mean ~119 ms | p95 ~1.4 s / max ~2.5 s |
| Canvas2D (same `draw()` loop as spans) | 0 ms | 0 ms |

The typical ~120 ms freeze is a visible snap after each discrete gesture; the tail is the more telling
finding — under a *sustained* wheel burst or drag-pan the DOM badges stay frozen for the **entire**
gesture (up to ~2.5 s here) and only snap at settle. (The probe also reports a `staleFrames` count, but
that figure is display-refresh dependent — ~15 frames at 120 Hz for the ~120 ms mean — so the
millisecond window is the reported metric.)

- **Pan/zoom sync:** Canvas2D badges are re-laid-out from geometry in the same frame as the spans
  they adorn, so they never lag the waterfall (0 ms stale, measured). A real (geometry-synced) DOM
  overlay could only reposition at the public settle signal, leaving the ~120 ms typical / up-to-~2.5 s
  sustained stale window measured above — reintroducing the sync class of bug ADR 0009 and ADR 0014
  already pay for with their overlays.
- **Hit testing:** a single `pickBadge` over geometry composes cleanly with the existing
  `pickDisclosure` / `pickRegion` ordering and the gesture-suspension model. The DOM path splits hit
  testing across two systems (DOM events for badges, canvas math for spans) and needs extra work to
  keep badge ownership from double-dispatching with span events.
- **Export/screenshot fidelity:** on-canvas badges are captured by the same canvas export path as the
  rest of the waterfall for free; a DOM overlay would be absent from a canvas snapshot.
- **Accessibility:** interactive badges are exposed through the existing DOM screen-reader trace table
  (ADR 0012) as focusable controls, so Canvas2D rendering does not cost per-badge canvas tab stops.

Canvas2D is chosen on sync fidelity, hit-test composition, and export — at the cost of Charts-owned
text/image/placeholder drawing. That drawing cost is bounded (the spike shows it is free of frame-time
penalty at representative density) and reuses existing canvas primitives, so it is accepted. Badge
image loading is asynchronous and handled by a dedicated per-chart loader/cache that schedules
coalesced, non-blocking redraws.

## Follow-up evidence (Phase 4)

The spike overlays are not geometry-synced and used a modest badge count without image loading. Once
the on-canvas badge renderer lands (Spec 27, Phase 4), re-measure with the real geometry-synced draw
pass to confirm at higher badge densities and with image loading/placeholder redraws:

- Pan/zoom frame time with the real per-lane badge layout and inline right-edge shift.
- Image loading behavior for repeated sources (coalesced redraws, no first-paint block).
- Hover/click hit-testing under scroll + zoom across all three label modes.

## Consequences

- The behavioral badge spec (Spec 27) defines what Span badges do; this ADR fixes how they are
  rendered: Canvas2D, in the Trace draw loop.
- Badge export/screenshot fidelity follows the canvas: badges are captured by the same export path as
  spans, with no separate DOM layer to reconcile.
- Charts owns badge text measurement, image loading/caching, placeholder rendering, and hit testing.
  Badge image loading never blocks first paint; a per-chart loader/cache keyed by `(src, crossOrigin)`
  schedules coalesced non-blocking redraws and emits deduplicated developer warnings on failure.
- EUI-like component reuse (e.g. `EuiIcon`, `EuiBadge`) is not available on canvas; v1 accepts images
  only (including SVG icons supplied as image sources), consistent with Spec 27's non-goals.
- Interactive badges are exposed as focusable controls in the DOM screen-reader trace table, so the
  Canvas2D choice does not add per-badge canvas tab stops.
