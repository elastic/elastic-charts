# Architecture Decision Records

Sequentially-numbered records of decisions that are hard to reverse, non-obvious from the code alone,
and the result of a real trade-off. See the individual files for context and rationale. Numbers are
stable and never reused; the list below is grouped by theme for readability only.

### Rendering & layout

- [0001 — Trace chart renders via Canvas2D, behind a WebGL seam](./0001-renderer-canvas2d-with-webgl-seam.md)
- [0009 — Brush rubber-band is a CSS `<div>`, not a canvas draw](./0009-brush-overlay-css-div.md)
- [0020 — Inline labels render on a dedicated row below the bar (Kibana APM style)](./0020-inline-labels-below-bar.md)
- [0024 — Multi-level time bar: stacked tick rows in time mode](./0024-multilevel-time-bar.md)
- [0029 — Trace badge rendering architecture](./0029-trace-badge-rendering-architecture.md)
- [0030 — Trace annotations compose as child specs (composition, geometry, layering, and hit testing)](./0030-trace-annotation-composition.md)
- [0035 — `spanDisplay: 'duration'` is a visual mode; self time stays segment-derived](./0035-span-display-duration-bar-mode.md)
- [0037 — Disclosure column sub-widths are measured and published, not re-derived](./0037-disclosure-column-measured-widths.md)
- [0039 — Tree guides draw from a per-lane guide mask](./0039-tree-guides-per-lane-guide-mask.md)

### Data & normalization

- ~~[0002 — Trace chart accepts two input formats, normalized to one internal span shape](./0002-single-normalized-span-dual-input.md)~~ *(superseded by 0005)*
- [0003 — A span's active segment(s) default to its self time, not its full duration](./0003-self-time-as-active-segments.md)
- [0005 — Trace chart takes a single input format; OTel is consumed via a `fromOtlp` adapter](./0005-single-input-format-otel-adapter.md)
- [0018 — Lane ordering: tree (DFS) default, chronological optional](./0018-lane-ordering-tree-default.md)
- [0022 — Clock-skew correction: Kibana-compatible placement](./0022-clock-skew-heuristic.md)
- [0026 — Collapsible nesting: rolled-up semantics, tree-gating, and disclosure gutter](./0026-collapsible-nesting.md)
- [0027 — Span IDs are unique within one supplied dataset](./0027-span-id-uniqueness.md)
- [0028 — Partial traces use source-preserving synthetic parentage (with Kibana reparenting parity)](./0028-partial-trace-synthetic-parentage.md)
- [0032 — Trace data diagnostics: component-owned report, RAF-pipeline emission, and log migration](./0032-trace-data-diagnostics-report.md)

### Interaction, zoom & events

- [0004 — Self-managed RAF render loop & the zoom-eases / pan-1:1 interaction model](./0004-raf-render-loop-and-interaction-model.md)
- [0007 — Controlled `focusDomain` is perform-and-fire; one callback for all gesture sources](./0007-focus-domain-perform-and-fire.md)
- [0008 — Scroll-to-span uses controlProviderCallback + TraceSearchProvider](./0008-scroll-to-span-control-provider.md)
- [0010 — Linear-scale nanosecond precision (supersedes ADR 0004 D3 for linear)](./0010-linear-scale-nanosecond-precision.md)
- [0021 — Touch interaction model: engine reuse, pinch-zoom-only, manual tap detection, long-press pin](./0021-touch-interaction-model.md)
- [0034 — Trace pointer events flow through the `Settings` element-event union; `Trace` owns only controlled state](./0034-pointer-events-via-settings-element-union.md)

### Selection & color

- [0006 — `colorBy` accepts a function or an explicit descriptor; no bare string shorthand](./0006-color-group-accessor-function-only.md)
- [0011 — Segment selection model: thin refs in, rich details out; controlled perform-and-fire](./0011-segment-selection-model.md)

### Accessibility

- [0012 — Trace accessibility architecture: `role="application"` on the canvas, SR data via a second selector, keyboard focus badge as a DOM sibling](./0012-role-application-canvas-only-sr-siblings.md)

### Empty state & critical path

- [0015 — Critical path is consumer-supplied, interval-precise (not computed, not a boolean)](./0015-critical-path-consumer-supplied-intervals.md)
- [0019 — Empty-state ownership: `no-data` delegates to the library overlay, `trace-not-found` is a canvas message](./0019-empty-state-ownership.md)

### Docs & process

- [0017 — Trace viz story organisation principles](./0017-story-organisation-principles.md)
- [0025 — Auto-generated API table: in-place patch of intro story, not a standalone file](./0025-api-docs-in-place-patch.md)
- [0038 — Public props name display topology when their value derives from it](./0038-prop-naming-display-topology.md)

### Deferred features

- [0016 — Connections are an explicit consumer-supplied prop, not derived from OTel links](./0016-connections-explicit-prop.md) *(deferred; Spec 35)*
- [0023 — Running-span model: optional end, domain-max provisional edge, dashed visual](./0023-running-span-model.md) *(deferred; Spec 34)*
- [0036 — Skewed-duration readability: minimum span mark + interactive inverse-fisheye time compression](./0036-skewed-duration-readability.md) *(B1 implemented; B2 deferred, see Spec 36)*

## Spec plans

The per-feature behavioral specs that guided implementation have been consolidated into the single
durable [`trace-chart.md`](./trace-chart.md) spec — its behavior sections describe every implemented
feature, and the ADRs above hold the rationale. The former per-spec plans under [`specs/`](./specs/)
were removed once absorbed.

Active spec plans (next up): none.

Deferred spec plans (tracked for future work):

- [Spec 34 — Running spans (in-progress visualization)](./specs/spec-34-running-spans.md)
- [Spec 35 — Connections (directed "Initiated by" arrows between segment endpoints)](./specs/spec-35-connections.md)
- [Spec 36 — Time-range compression (interactive inverse fisheye)](./specs/spec-36-time-range-compression.md) *(design-only; rationale in ADR 0036)*

See the repo root [`CONTEXT.md`](../../../CONTEXT.md) for the domain glossary.
