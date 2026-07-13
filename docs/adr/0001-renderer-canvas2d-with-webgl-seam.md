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
