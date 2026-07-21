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
- [0010 — Linear-scale nanosecond precision (supersedes ADR 0004 D3 for linear)](./0010-linear-scale-nanosecond-precision.md)
- [0011 — Segment selection model: thin refs in, rich details out; controlled perform-and-fire](./0011-segment-selection-model.md)
- [0012 — `role="application"` on the `<canvas>` element only; SR content as browsable siblings](./0012-role-application-canvas-only-sr-siblings.md)
- [0013 — Screen-reader span data re-derived in a second redux selector](./0013-sr-data-second-redux-selector.md)
- [0014 — Keyboard focus badge is a DOM sibling `<div>`, not a canvas draw](./0014-keyboard-focus-badge-dom-sibling.md)
- [0015 — Critical path is consumer-supplied, interval-precise (not computed, not a boolean)](./0015-critical-path-consumer-supplied-intervals.md)
- [0016 — Connections are an explicit consumer-supplied prop, not derived from OTel links](./0016-connections-explicit-prop.md)
- [0017 — Trace viz story organisation principles](./0017-story-organisation-principles.md)
- [0018 — Lane ordering: tree (DFS) default, chronological optional](./0018-lane-ordering-tree-default.md)
- [0019 — Empty-state ownership: `no-data` delegates to the library overlay, `trace-not-found` is a canvas message](./0019-empty-state-ownership.md)
- [0020 — Inline labels render on a dedicated row below the bar (Kibana APM style)](./0020-inline-labels-below-bar.md)
- [0021 — Touch interaction model: engine reuse, pinch-zoom-only, manual tap detection, long-press pin](./0021-touch-interaction-model.md)
- [0022 — Clock-skew correction: active centering heuristic](./0022-clock-skew-heuristic.md)
- [0023 — Running-span model: optional end, domain-max provisional edge, dashed visual](./0023-running-span-model.md)
- [0024 — Multi-level time bar: stacked tick rows in time mode](./0024-multilevel-time-bar.md)
- [0026 — Collapsible nesting: rolled-up semantics, tree-gating, and disclosure gutter](./0026-collapsible-nesting.md)

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
- [Spec 12 — Accessibility (keyboard nav, focused-lane highlight, scroll helper, SR surface)](./specs/spec-12-accessibility.md)
- [Spec 13 — Segment selection (click, double-click, multi-select, clear)](./specs/spec-13-segment-selection.md)
- [Spec 14 — Scroll-to-lane public API + search story](./specs/spec-14-scroll-to-lane.md)
- [Spec 15 — Lane ordering mode (tree default + chronological)](./specs/spec-15-lane-ordering.md)
- [Spec 16 — Focus-domain control + overview composition](./specs/spec-16-focus-domain-control.md)
- [Spec 17 — Responsive layout & relocatable label panel](./specs/spec-17-responsive-labels.md)
- [Spec 18 — Empty-state distinction (no-data vs trace-not-found)](./specs/spec-18-empty-state.md)
- [Spec 19 — Nanosecond precision for linear x-scale](./specs/spec-19-nanosecond-linear.md)
- [Spec 20 — API documentation story (auto-extracted)](./specs/spec-20-api-docs.md)
- [Spec 21 — Collapsible nesting](./specs/spec-21-collapsible-nesting.md)
- [Spec 22 — Critical path (consumer-supplied interval-precise highlight)](./specs/spec-22-critical-path.md)
- [Spec 23 — Connections (directed "Initiated by" arrows between segment endpoints)](./specs/spec-23-connections.md)
- [Spec 24 — Touch gestures (pinch-zoom, drag-pan, tap/double-tap selection, long-press pin)](./specs/spec-24-touch-gestures.md)
- [Spec 25 — Clock-skew correction (active centering heuristic)](./specs/spec-25-clock-skew.md)
- [Spec 26 — Running spans (in-progress visualization)](./specs/spec-26-running-spans.md)
- [Spec 27 — Multi-level (stacked) time bar](./specs/spec-27-multilevel-time-bar.md)

Build order (Specs 0–8): Phase 0 → Spec 0 → Spec 1 → (Spec 2 / Spec 3 / Spec 4 in parallel once
Spec 1's `NormalizedSpan` contract is fixed) → Spec 5 → Spec 6 → Spec 7 → Spec 8.

Build order (Specs 9–20): Spec 9 (color — foundational for showcase stories) → Spec 10 (pin
tooltip — independent) → Spec 11 (brush X-only). After Spec 11 the remaining specs form an acyclic
graph whose numeric order **is** the dependency order:

- **Spec 12** (accessibility, keyboard nav, focused-lane highlight, `scrollLaneIntoView` helper) —
  depends on Spec 6. Implement first; unblocks 13 and 14.
- **Spec 13** (segment selection) — depends on Specs 7, 10, and 12.
- **Spec 14** (scroll-to-lane public API) — depends on Spec 12 (reuses `scrollLaneIntoView` and
  `focusedLaneIndex`).
- **Spec 15** (lane ordering mode) — depends on Spec 1 (`parentId`). Independent of 12–14.
- **Spec 16** (focus-domain control) — depends on Spec 11.
- **Spec 17** (responsive labels) — depends on Spec 5.
- **Spec 18** (empty-state distinction) — depends on Specs 1 and 5.
- **Spec 19** (nanosecond linear scale) — depends on Specs 4 and 6.
- **Spec 20** (API docs, auto-extracted) — must be last; captures public props from Specs 13–17.

Specs 15–19 are mutually independent and can be parallelised after Spec 11.

Spec 21 (collapsible nesting) builds on Spec 15 (`laneOrder: 'tree'` is the seam) and Specs 12 and 13
(keyboard nav and `TraceSegmentRef`). It is independent of Specs 22–27. Open questions #2–#9 from the
original stub are resolved by [ADR 0026](./0026-collapsible-nesting.md).

- **Spec 22** (critical path highlight) — depends on Specs 5, 12, and 13. Independent of Spec 23.
  Extends the normalize pipeline (`project()`) and adds a canvas draw pass; no interaction state.
- **Spec 23** (connections / "Initiated by" arrows) — depends on Specs 5, 12, and 13 (reuses
  `TraceSegmentRef`, `waitingSegments`, and the `buildGeometry` resolved-field pattern). Independent
  of Spec 22. Pure render — no pipeline changes, no interaction state.
- **Spec 24** (touch gestures) — depends on Specs 7, 10, and 13. See ADR 0021. Pure interaction
  layer addition; no pipeline changes.
- **Spec 25** (clock-skew correction) — depends on Specs 1 and 2 (`buildChildrenMap`, `gapSegments`).
  Adds a new normalize stage between `dropNonFinite` and `project`. Independent of Specs 22–24.
  Must be implemented **before** Spec 26 (clock-skew runs before running-end synthesis).
- **Spec 26** (running spans) — depends on Specs 1, 3, 5, 7, and 12. Relaxes `dropNonFinite`,
  extends `project` and `resolveActive`, adds a renderer dashed-line pass, and adds a new theme
  token. Should be implemented **after** Spec 25 (the clock-skew stage runs before running-end
  synthesis, and running spans are skipped by the heuristic). Independent of Specs 22–24.
- **Spec 27** (multi-level time bar) — depends on Specs 3 and 4 (geometry, `TraceStyle`, raster
  engine reuse). Pure renderer + theme + geometry change; no normalize pipeline changes. Independent
  of Specs 22–26. See [ADR 0024](./0024-multilevel-time-bar.md).

See the repo root [`CONTEXT.md`](../../../CONTEXT.md) for the domain glossary.
