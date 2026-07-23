---
status: provisional
domain: trace-viz
owners: []
supersedes: []
---

# Spec 27 — Trace span badges

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

## Summary

A Trace chart may derive zero or more structured **Span badges** for each source span. Span badges
supplement the span label with compact text and optional iconography, while retaining visibility and
interaction semantics independent of the label's position or presence.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `TraceSpanBadge` | type | Structured text, optional image, identity, metadata, and visibility for one Span badge. |
| `TraceSpanBadgeImage` | type | CORS-safe string image source, including SVG icons supplied as images. |
| `TraceSpanBadgeSize` | type | `'s' | 'm'`; controls the complete badge and its image. |
| `TraceSpanBadgeColor` | type | EUI-like named badge color or a custom Charts `Color`. |
| `TraceSpanBadgeAccessor` | type | Derives the ordered Span badges associated with one source `TraceDatum`. |
| `TraceSpec.badgeAccessor` | prop | Supplies the Trace-level accessor; Span badges are not stored on `TraceDatum`. |
| `TraceSpec.badgeSize` | prop | Selects one shared size for every Span badge in the Trace. |
| `TraceSpanBadgeEvent` | type | Reports the resolved Span badge and its owning span metadata. |
| `TraceSpec.onBadgeOver` | prop | Reports pointer entry for a Span badge. |
| `TraceSpec.onBadgeOut` | prop | Reports pointer exit for a Span badge. |
| `TraceSpec.onBadgeClick` | prop | Reports activation of a Span badge. |

## Behavior & acceptance

- `badgeAccessor` receives the original `TraceDatum` and returns an ordered, readonly collection of
  structured Span badges. The accessor is evaluated as part of preparing trace data, not as part of
  each animation frame. {story:spanBadges}
- Every Span badge requires a stable `id`. Badge ids are unique only within their owning span; event
  identity is the pair of owning span identity and badge id, not a globally unique badge id.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"identifies badges by span and badge id"}
- If one span returns multiple Span badges with the same `id`, Charts reports the duplicate through
  diagnostics. Pointer hit testing still resolves to the first matching visual badge at that
  position so interaction remains deterministic for the rendered chart.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"reports duplicate span badge ids"}
- A Span badge must contain text, an image, or both. A badge with neither text nor image is reported
  through diagnostics and omitted from visual layout and hit testing.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"reports empty span badges"}
- Span badge text is a string. Consumers format numbers, durations, statuses, and other values
  before returning badges so Charts can measure, truncate, and expose text consistently.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"reports non-string badge text"}
- Whitespace-only Span badge text is treated as absent text. If the badge also has an image, the
  whitespace text is ignored visually; otherwise the badge is an empty badge diagnostic.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"treats whitespace-only badge text as empty"}
- Span badges are application presentation derived from a span; they do not modify the source
  `TraceDatum` or data produced by `fromOtlp`. {test:packages/charts/src/chart_types/trace_chart/data/normalize.test.ts#"derives span badges without changing source data"}
- A Span badge contains structured content rather than an arbitrary React component. Its optional
  media is a `TraceSpanBadgeImage`; EUI SVG icons are supported only when supplied as image sources.
  {story:spanBadges}
- A Span badge size is selected from a finite T-shirt-size set. The size controls the badge's text,
  padding, height, and icon/image box as one design unit; an icon or image cannot supply independent
  width, height, or arbitrary sizing styles. {story:spanBadgeSizes}
- SVG-based icons and custom images preserve their aspect ratio while fitting the image box derived from
  the badge size. {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"badge media inherits badge size"}
- When a Span badge has both image and text, the image always precedes the text. V1 does not expose
  image-side configuration. {story:spanBadges}
- A Span badge has one accessible name. Visible badge text is the default; `ariaLabel` overrides it
  when supplied. An image-only badge without `ariaLabel` is reported through diagnostics but still
  renders and remains interactive, using a generic generated accessible name. The image is
  decorative within the named badge rather than announced separately. {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"names image-only span badges"}
- `TraceSpanBadgeImage` accepts one `src` string and an optional `crossOrigin` mode of `'anonymous'`
  or `'use-credentials'`; it defaults to `'anonymous'`. Charts applies the same loading policy for
  every renderer and never falls back to drawing an unsafe cross-origin image that would taint the
  chart canvas. {test:packages/charts/src/chart_types/trace_chart/render/badge_images.test.ts#"rejects images without compatible CORS"}
- `src` may be any normal browser-supported image URL string, including data URLs. Charts does not
  add custom fetchers, authentication headers, or application-managed image loading in v1.
  {test:packages/charts/src/chart_types/trace_chart/render/badge_images.test.ts#"loads browser-supported badge image sources"}
- Badge image load state is cached per unique `src` and `crossOrigin` combination within one Trace
  chart instance. Badges that reference the same image identity share loading, success, failure, and
  warning state. {test:packages/charts/src/chart_types/trace_chart/render/badge_images.test.ts#"shares badge image load state by source and cors mode"}
- Badge image cache eviction and lifetime after an image is no longer referenced are implementation
  details. The public contract is shared state for currently referenced image identities and bounded
  warning behavior. {test:packages/charts/src/chart_types/trace_chart/render/badge_images.test.ts#"badge image cache eviction is not observable"}
- Image loading never blocks the first chart paint or an unrelated Trace render. A reserved image
  box initially shows a neutral loading placeholder; successful loading replaces it without changing
  badge geometry. {story:spanBadgeImageStates}
- A failed image retains the reserved box and shows a neutral but distinguishable failed-image
  placeholder. Badge text, accessible name, hover, and activation remain available, and the failure
  emits a developer-facing warning for debugging. Image-only failed badges remain visible and
  interactive through the placeholder. {story:spanBadgeImageStates}
- Resolving an image invalidates the affected visual state and schedules a canvas update; multiple
  resolutions before the next animation frame are coalesced into one redraw. Image loading never
  creates a periodic timer or an idle animation loop, and the scheduling policy is not public
  configuration.
  {test:packages/charts/src/chart_types/trace_chart/render/badge_images.test.ts#"image resolution schedules a non-blocking redraw"}
- An image failure emits at most one developer warning for each unique `src` and `crossOrigin`
  combination, regardless of how many Span badges reference it.
  {test:packages/charts/src/chart_types/trace_chart/render/badge_images.test.ts#"deduplicates image failure warnings"}
- Image failure warnings identify the failed image `src` and `crossOrigin` mode, not every owning
  span or badge that referenced the image.
  {test:packages/charts/src/chart_types/trace_chart/render/badge_images.test.ts#"image failure warnings are source scoped"}
- One `badgeSize` applies to every Span badge in a Trace. Individual badges cannot select a different
  size in the initial contract. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"uses one badge size across lanes"}
- `badgeSize` accepts `'s'` and `'m'` and defaults to `'m'`, matching the standard EUI badge density.
  Exact pixel dimensions remain design/theme concerns rather than public values. {story:spanBadgeSizes}
- Each Span badge may select one `color`: `'default'`, `'hollow'`, `'primary'`, `'success'`,
  `'warning'`, `'danger'`, or a custom Charts `Color`. Charts derives readable text contrast and any
  necessary border consistently across renderers. {story:spanBadgeColors}
- Badge interaction handlers belong to the Trace spec rather than individual `TraceSpanBadge`
  values. Every handler receives a `TraceSpanBadgeEvent` containing the resolved badge—including its
  metadata—and the owning span's rich event metadata. {story:spanBadgeEvents}
- Badge hover and click handlers are independently optional. Consumers may provide hover without
  click, click without hover, both, or neither; Charts only dispatches callbacks that are supplied.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"badge handlers are independently optional"}
- `TraceSpanBadgeEvent` does not expose raw native DOM events in v1. It may include normalized event
  source information such as pointer or keyboard activation and chart-relative coordinates for
  pointer events. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"badge events do not expose native events"}
- Badge events are source-discriminated. Pointer-origin events include chart-relative coordinates;
  keyboard-origin activation events do not synthesize coordinates.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"badge events include coordinates only for pointer source"}
- Span badge values remain inert data: they do not contain event-handler functions. Consumers that
  need badge-specific behavior branch on the reported badge identity or metadata.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"reports badge and span metadata through central handlers"}
- Span badges render as visual and accessible adornments even when no badge interaction handlers are
  supplied. Interaction handlers add behavior; they do not control badge visibility.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"badges render without interaction handlers"}
- A Span badge may carry opaque consumer metadata. Charts returns this metadata by reference in
  `TraceSpanBadgeEvent` but does not inspect, clone, serialize, diff, or validate the metadata
  payload. Diagnostics validate only the badge's structural fields.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"passes badge metadata through events"}
- Span badge diagnostics are reported through the unified Trace diagnostics report. V1 does not
  expose a separate badge-specific warning callback or console channel, except for image loading
  failures that also emit a developer-facing warning for debugging.
  {test:packages/charts/src/chart_types/trace_chart/data/diagnostics.test.ts#"includes badge issues in the trace diagnostics report"}
- A pointer event that targets a Span badge is owned by that badge. Charts dispatches the matching
  badge handler and does not also dispatch the underlying span hover or click handler for the same
  pointer transition or activation. The badge event includes the owning span metadata when consumers
  need span-level context. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"does not double-dispatch badge and span pointer events"}
- Pointer activation fires `onBadgeClick` only when pointer down and pointer up resolve to the same
  Span badge and no viewport gesture is recognized.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"badge click requires down and up on the same badge"}
- Span badge targets use an interactive pointer cursor only when `onBadgeClick` is supplied.
  Hover-only badges may still report hover transitions but do not imply activation through cursor
  styling. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"badge cursor reflects clickability"}
- Badge hover and activation are suspended while an active viewport gesture, such as drag pan or
  brush zoom, owns the pointer. Normal badge hit testing resumes after the gesture completes.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"suspends badge events during viewport gestures"}
- If a viewport gesture starts while a Span badge is hovered, Charts emits one `onBadgeOut` for that
  badge before suspending badge hit testing.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"clears hovered badge when viewport gesture starts"}
- If a data or spec change removes the currently hovered Span badge, or makes it no longer visible,
  Charts emits one `onBadgeOut` for the previous hovered badge.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"clears hovered badge when it is removed"}
- When the pointer leaves the chart while a Span badge is hovered, Charts emits one `onBadgeOut` for
  that badge. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"clears hovered badge when pointer leaves chart"}
- Keyboard users can reach and activate Span badges through the span accessibility surface. Keyboard
  activation dispatches `onBadgeClick` with the same event shape as pointer activation, without
  adding one canvas tab stop per visual badge.
  {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"keyboard activation dispatches badge click events"}
- Span badges appear as keyboard-activatable controls only when `onBadgeClick` is supplied. Without
  a click handler, badges remain represented as informational accessible content related to their
  owning span.
  {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"non-clickable badges are informational for keyboard users"}
- Keyboard activation does not synthesize `onBadgeOver` or `onBadgeOut`; those handlers describe
  pointer transitions only. {test:packages/charts/src/chart_types/trace_chart/render/screen_reader_trace_table.test.tsx#"badge keyboard activation does not synthesize hover"}
- Span badges do not create a built-in visual tooltip, popover, or hover card in v1. Badge hover and
  activation are reported through public handlers, and truncated badge text remains available to
  assistive technology. {story:spanBadgeEvents}
- Each Span badge may declare `visibleIn`, an ordered set of existing Label position values
  (`'gutter'`, `'inline'`, and `'none'`). When omitted, it defaults to `['gutter', 'inline']`: the
  badge accompanies a visible label. Including `'none'` explicitly keeps that badge visible when
  labels are omitted. {story:spanBadgeVisibility}
- Badge visibility does not change `theme.trace.labelPosition`; it controls only whether that badge
  participates in the current layout. {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"badge visibility is independent of label drawing"}
- When Label position is `none`, participating Span badges render in a compact badge-only gutter.
  The badge-only gutter is lane-aligned, does not move during horizontal zoom or pan, and does not
  expose empty label space. {story:spanBadgeVisibility}
- The badge-only gutter is absent when no Span badge visible in `none` participates in the current
  layout, allowing the plot to retain the width it has without badges.
  {test:packages/charts/src/chart_types/trace_chart/render/geometry.test.ts#"badge-only gutter is conditional"}
- Vertical Trace annotations do not create their own gutter width in Label position `none`. If Span
  badges create a compact badge-only gutter, vertical annotation rails use that gutter's boundary with
  the span drawing area; otherwise rails render at the plot's left edge.
  {test:packages/charts/src/chart_types/trace_chart/render/geometry.test.ts#"vertical annotations do not create gutter width"}
- In `inline` Label position, participating Span badges are adjacent to the inline span label.
  In `gutter`, every badge for a span uses the same library-defined placement: either adjacent to
  the label or on a row below it. The final placement is pending a two-variant design evaluation;
  consumers cannot configure or mix placements. {story:spanBadgePlacement}
- When the label and participating Span badges do not all fit, the layout preserves a
  design-defined minimum readable label area, then lays out badges in accessor order. Badge text may
  truncate with an ellipsis down to a design-defined minimum; badges that still do not fit are
  omitted from the visual layout from the end of the ordered collection. Omitted badges remain
  available to assistive technology. V1 does not provide a `+N` overflow affordance, popover, or
  expandable badge area. {story:spanBadgeOverflow}

## Decisions

- [ADR 0029 — Trace badge rendering architecture](../0029-trace-badge-rendering-architecture.md): pending measured
  DOM, Canvas2D, and hybrid investigation.
- Badge export and screenshot fidelity depend on the eventual rendering architecture decision and are
  not promised by this behavioral spec until that ADR resolves DOM, Canvas2D, or hybrid rendering.

## Non-goals

- **Arbitrary React badge content:** unconstrained components would make sizing, event semantics,
  accessibility, and renderer independence application-defined. The initial contract supports
  structured badge content only.
- **Renderable icon components:** v1 accepts images only. Consumers may supply an EUI SVG icon as an
  image source; passing `EuiIcon` or another React component is reserved for future evaluation.
- **Renderable text nodes:** v1 accepts badge text as strings only, not React nodes or unformatted
  numeric values.
- **Custom image loaders and request headers:** v1 uses browser string-source loading with the
  declared CORS mode; application-specific fetching and authentication remain consumer-owned.
- **Telemetry enrichment:** Span badges are presentation derived through `badgeAccessor`, not fields
  added to `TraceDatum` or OTLP source data.
- **Consumer-configurable badge placement:** the library selects one consistent gutter placement at
  design time so applications cannot create incompatible lane layouts.
- **Custom badge or image dimensions:** finite badge-size tokens own all text, padding, height, and
  image dimensions.
- **Per-badge sizes:** the initial contract keeps one size across the Trace so lane alignment and
  gutter geometry remain predictable.
- **Independent badge style overrides:** v1 does not expose separate background, text, border,
  radius, padding, font, or CSS controls; one badge `color` drives the derived visual treatment.
- **Badge overflow expansion:** v1 does not add visual expansion controls for omitted badges; the
  ordered accessor already provides a simple priority model.
- **Built-in badge tooltip UI:** v1 reports hover state but leaves tooltip, popover, and hover-card
  presentation to consumers.
