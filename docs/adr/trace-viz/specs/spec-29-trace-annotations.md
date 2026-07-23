---
status: provisional
domain: trace-viz
owners: []
supersedes: []
---

# Spec 29 — Trace annotations

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

## Summary

A Trace chart may include composed **Trace annotations** that mark meaningful time positions/ranges,
lanes, or root-to-target span routes. Annotations are caller-authored context layered on top of
prepared trace output; they do not modify trace data, selection, collapse state, or lane ordering.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `TraceTimeAnnotation` | component | Child spec that marks a timestamp or time range on the Trace x-scale. |
| `TraceLaneAnnotation` | component | Child spec that marks one resolved span lane. |
| `TraceHierarchyAnnotation` | component | Child spec that marks the visible root-to-target route for one resolved span. |
| `TraceAnnotationDatum` | type | Structured annotation identity, metadata, style intent, and accessibility fields. |
| `TraceAnnotationColor` | type | EUI-like named annotation color or a custom Charts `Color`. |
| `TraceAnnotationEvent` | type | Reports the resolved annotation and related trace/span metadata when applicable. |
| `TraceSpec.onAnnotationOver` | prop | Reports pointer entry for an interactive Trace annotation. |
| `TraceSpec.onAnnotationOut` | prop | Reports pointer exit for an interactive Trace annotation. |
| `TraceSpec.onAnnotationClick` | prop | Reports activation of an interactive Trace annotation. |

## Behavior & acceptance

- Trace annotations are composed as child specs of `Trace`, not supplied through one Trace-level
  annotation array prop. Annotation children are declarative specs and do not render arbitrary React
  overlay content. {story:traceAnnotations}
- Every Trace annotation requires a stable `id`, unique across all Trace annotation child specs in
  one chart. Duplicate annotation ids are reported through Trace diagnostics.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"reports duplicate trace annotation ids"}
- Each Trace annotation may be hidden with a simple per-annotation visibility flag. Annotations
  default to visible across all Label positions; v1 does not provide a badge-like `visibleIn`
  label-mode matrix for annotations. {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"trace annotations default visible across label positions"}
- Each Trace annotation may select one `color`: `'default'`, `'primary'`, `'success'`, `'warning'`,
  `'danger'`, or a custom Charts `Color`. Trace derives stroke, fill, opacity, hover, and contrast
  treatment consistently from that color intent. {story:traceAnnotationColors}
- Trace annotations do not render visible text labels in v1. Consumers provide accessible names and
  structured metadata; hover and activation events expose that metadata so applications can show
  tooltip or popover information outside the annotation's canvas/gutter mark. Trace does not provide
  a built-in annotation tooltip in v1.
  {story:traceAnnotationTooltips}
- Trace owns annotation resolution, layout, rendering, hit testing, accessibility exposure, and event
  dispatch. Consumers provide structured annotation specs and central Trace-level handlers.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"resolves composed trace annotations"}
- Trace annotations render as Canvas2D geometric marks in v1. Time annotations and vertical boundary
  rails remain synchronized with zoom, pan, scroll, and export through the Trace canvas renderer.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"renders trace annotations on canvas"}
- Trace annotations do not mutate source `TraceDatum`, normalized spans, collapse state, selection,
  lane order, critical path intervals, or Span badges. {test:packages/charts/src/chart_types/trace_chart/data/normalize.test.ts#"trace annotations do not change prepared trace data"}
- `TraceTimeAnnotation` marks either a timestamp point or a time range in x-scale space, following
  the same conceptual split as XY line and rectangle annotations while using Trace-specific geometry.
  A time annotation supplies either `time` or `range`, but not both. It remains horizontally anchored
  to its time value through zoom and pan and may report hover and activation with annotation metadata.
  {story:traceTimeAnnotations}
- Time annotations render over the trace plot and visible lane area only. V1 does not extend them
  into the time bar, label gutter, badge-only gutter, or chart chrome.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"time annotations are clipped to the plot area"}
- A structurally valid time annotation outside the current visible x-domain is omitted from the
  visual layout and hit testing without diagnostics. Non-finite time values, empty ranges, and
  reversed ranges are invalid annotation structure and are reported through diagnostics.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"reports invalid time annotation values"}
- A time range annotation that partially overlaps the visible x-domain is clipped to the plot
  viewport for rendering and hit testing. Annotation events still report the original authored range.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"clips partially visible time range annotations"}
- A time point annotation may render as a visually thin marker, but hit testing uses a
  library-defined minimum interactive width around the marker, informed by the roughly 10 px target
  area used in the reference design. The exact hit width is not public configuration in v1.
  {test:packages/charts/src/chart_types/trace_chart/render/picking.test.ts#"time point annotations use a minimum hit target"}
- `TraceLaneAnnotation` and `TraceHierarchyAnnotation` target spans by `spanId`, not by lane index.
  Lane indices are derived viewport/layout state and may change under ordering, filtering, collapse,
  and recovery. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"trace annotations target span ids rather than lane indices"}
- A lane or hierarchy annotation whose `spanId` does not resolve in the prepared trace data is
  reported through diagnostics and omitted from visual layout and hit testing.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"reports trace annotations referencing missing spans"}
- A lane or hierarchy annotation whose target span exists in prepared trace data but is hidden only
  by current collapse state is omitted from visual layout and hit testing without diagnostics. Trace
  does not remap the annotation to the visible collapsed ancestor.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"omits annotations targeting collapsed hidden spans"}
- `TraceLaneAnnotation` marks one resolved span lane with a boundary rail between the gutter and the
  span drawing area.
  `TraceHierarchyAnnotation` marks the visible ancestry route from the owning trace root to one
  resolved target span. It highlights only the specific root-to-target route, not sibling branches
  and not the target span's descendants.
  {story:traceHierarchyAnnotations}
- `TraceHierarchyAnnotation` resolves its root-to-target route through the prepared display
  hierarchy, including any recovery or synthetic parentage reflected in visible output. It does not
  follow missing or invisible source parent links that differ from the rendered hierarchy.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"hierarchy annotations use the prepared display hierarchy"}
- When the hierarchy annotation target is visible, the annotation marks the visible ancestry route to
  that target. When the target is hidden by collapse, the annotation is omitted without diagnostics
  and does not expand or reveal hidden descendants.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"hierarchy annotations respect collapse state"}
- Hierarchy annotations render as a straight vertical boundary rail between the gutter and the span
  drawing area, spanning only the lanes in the visible root-to-target route. They do not tint,
  outline, or otherwise highlight span bars for ancestors or the target span.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"hierarchy annotations render in the gutter only"}
- Lane annotations render as a boundary rail segment between the gutter and the span drawing area for
  the target lane only. They do not tint, outline, or otherwise highlight span bars.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"lane annotations render in the gutter only"}
- Vertical annotation hit testing applies only around the boundary rail, using a library-defined
  minimum interactive width. It does not make the whole annotated lane row or gutter row an
  annotation target, so collapse controls, labels, and Span badges keep their own hit areas.
  {test:packages/charts/src/chart_types/trace_chart/render/picking.test.ts#"vertical annotations hit test around the boundary rail only"}
- Vertical annotations do not create gutter width by themselves when `labelPosition` is `none`.
  Their boundary rail renders at the plot's left edge when no gutter is present, or at the boundary
  between any visible label/badge gutter and the span drawing area when gutter space exists.
  {test:packages/charts/src/chart_types/trace_chart/render/geometry.test.ts#"vertical annotations do not create gutter width"}
- Vertical annotations are eligible to render in `gutter`, `inline`, and `none` Label positions by
  default. In `inline` and no-gutter layouts, their boundary rail uses the plot's left edge.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"vertical annotations render across label positions"}
- Annotation interaction handlers belong to the Trace spec rather than individual annotation specs.
  Every handler receives a `TraceAnnotationEvent` containing the resolved annotation metadata and,
  when applicable, related span metadata. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"reports trace annotation events through central handlers"}
- Annotation hover and click handlers are independently optional. Consumers may provide hover without
  click, click without hover, both, or neither; Charts only dispatches callbacks that are supplied.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"annotation handlers are independently optional"}
- `TraceAnnotationEvent` does not expose raw native DOM events in v1. It may include normalized event
  source information such as pointer or keyboard activation and chart-relative coordinates for
  pointer events. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"annotation events do not expose native events"}
- Annotation events are source-discriminated. Pointer-origin events include chart-relative
  coordinates; keyboard-origin activation events do not synthesize coordinates.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"annotation events include coordinates only for pointer source"}
- One central annotation handler family covers time, lane, and hierarchy annotations.
  `TraceAnnotationEvent` includes an annotation type discriminator so consumers can branch without
  separate callback props for each annotation kind.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"uses one annotation handler family"}
- Trace annotation child specs remain inert data: they do not contain event-handler functions.
  Consumers that need annotation-specific behavior branch on the reported annotation identity or
  metadata. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"trace annotation specs do not store handlers"}
- Trace annotations render as visual and accessible context even when no annotation interaction
  handlers are supplied. Interaction handlers add behavior; they do not control annotation visibility.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"annotations render without interaction handlers"}
- A Trace annotation may carry opaque consumer metadata. Charts returns this metadata by reference in
  `TraceAnnotationEvent` but does not inspect, clone, serialize, diff, or validate the metadata
  payload. Diagnostics validate only the annotation's structural fields.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"passes annotation metadata through events"}
- Trace annotations expose their own accessibility surface rather than being folded into span rows by
  default. Annotation entries use accessible names and include related span metadata when applicable.
  {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"exposes trace annotations separately from span rows"}
- Every Trace annotation requires an accessible name. An annotation without an accessible name is
  reported through diagnostics but still renders and remains interactive, using a generic generated
  accessible name. {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"reports annotations without accessible names"}
- Keyboard users can reach and activate annotations through the annotation accessibility surface.
  Keyboard activation dispatches `onAnnotationClick` with the same event shape as pointer activation,
  without adding one canvas tab stop per visual annotation mark.
  {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"keyboard activation dispatches annotation click events"}
- Trace annotations appear as keyboard-activatable controls only when `onAnnotationClick` is
  supplied. Without a click handler, annotations remain represented as informational accessible
  content. {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"non-clickable annotations are informational for keyboard users"}
- Keyboard activation does not synthesize `onAnnotationOver` or `onAnnotationOut`; those handlers
  describe pointer transitions only.
  {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"annotation keyboard activation does not synthesize hover"}
- A pointer event that targets a Trace annotation is owned by that annotation. Charts dispatches the
  matching annotation handler and does not also dispatch underlying span or Span badge hover/click
  handlers for the same pointer transition or activation.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"does not double-dispatch annotation and span pointer events"}
- Pointer activation fires `onAnnotationClick` only when pointer down and pointer up resolve to the
  same Trace annotation and no viewport gesture is recognized.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"annotation click requires down and up on the same annotation"}
- Trace annotation targets use an interactive pointer cursor only when `onAnnotationClick` is
  supplied. Hover-only annotations may still report hover transitions but do not imply activation
  through cursor styling. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"annotation cursor reflects clickability"}
- Annotation hover and activation are suspended while an active viewport gesture, such as drag pan or
  brush zoom, owns the pointer. Normal annotation hit testing resumes after the gesture completes.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"suspends annotation events during viewport gestures"}
- If a viewport gesture starts while a Trace annotation is hovered, Charts emits one
  `onAnnotationOut` for that annotation before suspending annotation hit testing.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"clears hovered annotation when viewport gesture starts"}
- If a data or spec change removes the currently hovered Trace annotation, or makes it no longer
  resolve or render, Charts emits one `onAnnotationOut` for the previous hovered annotation.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"clears hovered annotation when it is removed"}
- When the pointer leaves the chart while a Trace annotation is hovered, Charts emits one
  `onAnnotationOut` for that annotation.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"clears hovered annotation when pointer leaves chart"}

## Decisions

- [ADR 0030 — Trace annotations compose as child specs](../0030-trace-annotation-composition.md)

## Non-goals

- **Trace-level annotation arrays:** composed child specs let independent annotation kinds evolve
  without expanding one large Trace prop.
- **Arbitrary React annotation overlays:** v1 keeps Trace responsible for synchronized positioning,
  virtualization, hit testing, and accessibility.
- **Independent annotation style overrides:** v1 does not expose separate stroke, fill, opacity,
  width, dash, radius, font, or CSS controls; one annotation `color` drives the derived visual
  treatment.
- **Visible annotation labels:** v1 keeps annotation marks visually compact and leaves descriptive
  information to accessibility metadata and consumer tooltip presentation.
- **Built-in annotation tooltip UI:** v1 reports hover state and metadata but leaves tooltip,
  popover, and hover-card presentation to consumers.
- **XY annotation reuse as-is:** XY annotations can inform API language, but Trace annotation
  geometry and hierarchy semantics are Trace-specific.
- **Time-bar annotation markers:** v1 time annotations mark the trace plot; dedicated time-bar or
  axis-marker integration is reserved for a future variant.
- **Annotation-driven trace mutation:** annotations call out existing trace output; they do not
  change collapse, selection, or lane ordering.
