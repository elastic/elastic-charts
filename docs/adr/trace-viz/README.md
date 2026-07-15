# Architecture Decision Records

Sequentially-numbered records of decisions that are hard to reverse, non-obvious from the code alone,
and the result of a real trade-off. See the individual files for context and rationale.

- [0001 — Trace chart renders via Canvas2D, behind a WebGL seam](./0001-renderer-canvas2d-with-webgl-seam.md)
- ~~[0002 — Trace chart accepts two input formats, normalized to one internal span shape](./0002-single-normalized-span-dual-input.md)~~ *(superseded by 0005)*
- [0003 — A span's active segment(s) default to its self time, not its full duration](./0003-self-time-as-active-segments.md)
- [0004 — Self-managed RAF render loop & the zoom-eases / pan-1:1 interaction model](./0004-raf-render-loop-and-interaction-model.md)
- [0005 — Trace chart takes a single input format; OTel is consumed via a `fromOtlp` adapter](./0005-single-input-format-otel-adapter.md)
- [0006 — `colorBy` is a function; no string shorthand](./0006-color-group-accessor-function-only.md)
- [0007 — Controlled `focusDomain` is perform-and-fire; one callback for all gesture sources](./0007-focus-domain-perform-and-fire.md)
- [0008 — Scroll-to-span uses controlProviderCallback + TraceSearchProvider](./0008-scroll-to-span-control-provider.md)
- [0009 — Brush rubber-band is a CSS `<div>`, not a canvas draw](./0009-brush-overlay-css-div.md)

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
- [Spec 9 — Categorical color palette (color-by API)](./specs/spec-9-color-by.md)
- [Spec 10 — Sticky (pinnable) tooltip](./specs/spec-10-pinnable-tooltip.md)
- [Spec 11 — Brush-to-zoom (X-only)](./specs/spec-11-brush-zoom.md)
- [Spec 12 — Focus-domain control + overview composition](./specs/spec-12-focus-domain-control.md)
- [Spec 13 — Responsive layout & relocatable label panel](./specs/spec-13-responsive-labels.md)
- [Spec 14 — Accessibility (best effort)](./specs/spec-14-accessibility.md)
- [Spec 15 — Scroll-to-lane API + search story](./specs/spec-15-scroll-to-lane.md)
- [Spec 16 — API documentation story (auto-extracted)](./specs/spec-16-api-docs.md)

Build order (Specs 0–8): Phase 0 → Spec 0 → Spec 1 → (Spec 2 / Spec 3 / Spec 4 in parallel once
Spec 1's `NormalizedSpan` contract is fixed) → Spec 5 → Spec 6 → Spec 7 → Spec 8.

Build order (Specs 9–16): Spec 9 (color — foundational for showcase stories) → Spec 10 (pin
tooltip — independent) → Spec 11 (brush X-only) → Spec 12 (focus control + overview, depends on 11)
→ Spec 13 (responsive labels — independent) → Spec 15 (scroll-to-lane, provides
`scrollLaneIntoView`) → Spec 14 (a11y, reuses 15's scroll helper) → Spec 16 (API docs — last, so
the table captures every new prop).

See the repo root [`CONTEXT.md`](../../../CONTEXT.md) for the domain glossary.
