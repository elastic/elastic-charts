# Architecture Decision Records

Sequentially-numbered records of decisions that are hard to reverse, non-obvious from the code alone,
and the result of a real trade-off. See the individual files for context and rationale.

- [0001 — Trace chart renders via Canvas2D, behind a WebGL seam](./0001-renderer-canvas2d-with-webgl-seam.md)
- [0002 — Trace chart accepts two input formats, normalized to one internal span shape](./0002-single-normalized-span-dual-input.md)
- [0003 — A span's active segment(s) default to its self time, not its full duration](./0003-self-time-as-active-segments.md)

## Spec plans

Implementation is broken into independently-executable spec plans under [`specs/`](./specs/), one per
component of the Trace visualization. Each spec states its goal, dependencies, files, contract,
implementation steps, Storybook story, tests, `/review-claudio` review focus, and acceptance criteria.

- [Phase 0 — Documentation & workflow scaffolding](./specs/phase-0-docs-scaffolding.md)
- [Spec 0 — Chart-type scaffolding & registration](./specs/spec-0-scaffolding.md)
- [Spec 1 — Input normalization (simple + OTel)](./specs/spec-1-normalization.md)
- [Spec 2 — Self-time derivation](./specs/spec-2-self-time.md)
- [Spec 3 — Geometry, theme & renderer contract](./specs/spec-3-geometry.md)
- [Spec 4 — Time bar (raster axis reuse)](./specs/spec-4-time-bar.md)
- [Spec 5 — Canvas2D renderer](./specs/spec-5-canvas2d-renderer.md)
- [Spec 6 — Connected component, RAF loop & zoom/pan](./specs/spec-6-connected-component.md)
- [Spec 7 — Picking, custom tooltip & element events](./specs/spec-7-tooltip-events.md)
- [Spec 8 — Integration, performance & docs finalization](./specs/spec-8-integration.md)

Build order: Phase 0 → Spec 0 → Spec 1 → (Spec 2 / Spec 3 / Spec 4 in parallel once Spec 1's
`NormalizedSpan` contract is fixed) → Spec 5 → Spec 6 → Spec 7 → Spec 8.

See the repo root [`CONTEXT.md`](../../CONTEXT.md) for the domain glossary.
