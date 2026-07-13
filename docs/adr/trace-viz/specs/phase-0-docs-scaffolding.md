# Phase 0 — Documentation & workflow scaffolding

**Goal:** stand up the docs structure that holds every spec and ADR, and the branch/workflow the
per-spec loop assumes. Nothing renders yet; this is the paper trail the rest of the work writes into.

**Depends on:** nothing (done first, outside plan mode).

## Actions

1. Create `docs/adr/trace-viz/` with `docs/adr/trace-viz/README.md` — an index listing the ADRs and linking the spec docs.
2. Create `docs/adr/trace-viz/specs/` and copy each spec section into its own file so each is executable standalone.
3. Seed ADRs for the hard-to-reverse, non-obvious, real-trade-off decisions:
   - [0001 — Canvas2D renderer with a WebGL seam](../0001-renderer-canvas2d-with-webgl-seam.md)
   - [0002 — Single normalized span, dual input](../0002-single-normalized-span-dual-input.md)
   - [0003 — Self time as active segments](../0003-self-time-as-active-segments.md)
4. Create the root `CONTEXT.md` glossary (grill-with-docs convention).
5. Create a feature branch off `master`; each spec is a reviewable commit/PR increment.

**Storybook:** n/a — docs-only, nothing renders yet.

**Review:** peer-read the ADRs/glossary for accuracy against the architecture; no `/review-claudio`
pass at this step since there is no code yet.

**Acceptance:** `docs/adr/trace-viz/` (README + 3 ADRs), `docs/adr/trace-viz/specs/` (this file + 9 spec docs), and
`CONTEXT.md` exist and agree with the architecture; branch created.

## Status

- [x] `docs/adr/trace-viz/` created with README + 3 ADRs.
- [x] `docs/adr/trace-viz/specs/` created with all spec docs.
- [x] `CONTEXT.md` created at repo root.
- [x] Feature branch `feat/trace-viz` already in place.
