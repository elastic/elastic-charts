# Trace chart renders via Canvas2D, behind a seam that allows a WebGL backend later

**Status:** accepted

The Trace waterfall (`chart_types/trace_chart/`) draws with Canvas2D rather than WebGL2, even though
the Flame chart (its closest precedent) uses WebGL2 with GPU-side picking. Canvas2D with viewport
culling comfortably handles the thousands-of-spans scale traces are expected to reach, and is far
simpler to build and maintain than a shader/GPU-picking pipeline. To avoid foreclosing on WebGL if
scale later demands it, drawing goes through a small `TraceRenderer` interface (`draw`, `pickLane`) so
a `webgl_renderer.ts` implementation can be swapped in — built on the existing `common/kingly.ts` WebGL
helper, no new dependency — without changing geometry, interaction, or the public API.

## Considered options

- **WebGL2 from day one** (Flame's approach) — rejected for v1: much more implementation cost
  (shaders, GPU pick texture) for headroom not yet needed.
- **Canvas2D with no seam** — rejected: cheapest short-term, but would require a rewrite of the
  renderer's call sites if WebGL becomes necessary.

## Re-evaluation (Spec 19, 2026)

A second performance assessment was performed when nanosecond precision and raw rendering throughput
were requested. Findings confirm the original decision holds:

- The renderer is already `O(visible lanes)` via vertical culling
  (`canvas2d_renderer.ts`, `firstLane`/`lastLane` clamp). Per-frame draw-call count is bounded by
  viewport height divided by lane height — typically 10–40 calls — regardless of total span count.
  This is the regime where WebGL's batching advantage is negligible.
- GPU-side text rendering (glyph atlas, signed-distance field shaders) would add significant
  implementation cost with no throughput gain in this bounded-call-count regime.
- The 5 000-span large-N benchmark (`09_large_n.story.tsx`) confirmed pan/zoom/scroll stay smooth
  at culled draw counts; the culling regression test in `canvas2d_renderer.test.ts` remains the
  performance gate.

**Conclusion:** WebGL is still not warranted. The `TraceRenderer` seam introduced by this ADR
remains the designated escape hatch if a future all-lanes-at-once overview (no vertical culling)
use case demands it.
