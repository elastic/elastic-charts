# ADR 0033 — Trace annotation geometry, layering, and the uniform thin-band hit model

**Status:** Accepted  
**Implements:** Spec 29 — Trace annotations  
**Relates to:** [ADR 0030](./0030-trace-annotation-composition.md) (annotations compose as child specs), [ADR 0029](./0029-trace-badge-rendering-architecture.md) (per-frame layout → draw → pick pass reused here), [ADR 0004](./0004-raf-render-loop-and-interaction-model.md) (RAF pipeline and interaction model), [ADR 0026](./0026-collapsible-nesting.md) (display hierarchy / memoization), [ADR 0007](./0007-focus-domain-perform-and-fire.md) (`projectionOffset` re-zero parity)

## Context

[ADR 0030](./0030-trace-annotation-composition.md) establishes that Trace annotations are composed
as child specs and that Trace owns their resolution, rendering, hit testing, and event reporting. It
deliberately leaves the *geometry* and *hit-testing* semantics open. Spec 29 needs three annotation
kinds — time (a point or a range on the x-scale), lane (one resolved span lane), and hierarchy (the
visible root-to-target route of one resolved span) — to render as compact adornments that never
obscure or steal interaction from the spans, badges, and segments beneath them.

Several decisions were genuinely load-bearing and non-obvious:

- **Where annotation marks live** relative to the gutter, plot, time bar, and the fixed left region.
- **How a range band can be visible without swallowing the pointer** across its whole width.
- **How a hierarchy route is drawn** when the target's ancestry is interleaved with sibling lanes.
- **How annotation time values are re-zeroed** so they line up with rendered spans under both
  `linear` and `time` scales.
- **How annotation resolution is memoized** without invalidating the span pipeline every render.

## Decision

### 1. A per-frame layout → draw → pick pass, mirroring badges

Annotations reuse the badge architecture ([ADR 0029](./0029-trace-badge-rendering-architecture.md)):
a `layoutAnnotations` pass turns resolved annotations into geometric marks (`lines`, optional `band` /
`timeBarBand` / `markers`, and `hitRects`) attached to `TraceGeometry.annotationsLayout`; a
`drawAnnotations` pass runs
after `drawBadges`; and `pickAnnotation` reads the same laid-out `hitRects`. Layout, draw, and pick
therefore never drift.

### 2. Layering: annotations draw above spans/badges, clipped to the plot; rails ride the boundary

Annotation marks draw on top of spans, segments, and badges. Time marks (point rails and range
bands) are clipped to the plot rect. Lane and hierarchy rails are drawn as vertical segments on the
**gutter↔plot boundary** (at `plot.left`) for the target lane(s); they do not tint span bars and do
not widen the gutter (the boundary rail is painted, it reserves no layout width — see the geometry
boundary test).

### 3. Uniform thin-band hit model (edges-only for ranges, rail-only for vertical)

Every annotation is hit tested through thin bands, never large fills:

- **Time point:** a zero-width mark is widened to a fixed `ANNOTATION_MIN_HIT_WIDTH` (~10px) band so
  it stays clickable at any zoom.
- **Time range:** only the **start and end edge rails** are hit targets; the band interior stays
  interactive so spans inside the window remain hoverable/clickable. Off-screen edges are dropped
  after clipping.
- **Lane / hierarchy:** hit tested only near the boundary rail. Hierarchy rails are **segmented** —
  one rail segment per visible route lane — so route lanes interleaved with non-route siblings show
  gaps, and the pick unions those segments back to the one annotation.

`ANNOTATION_MIN_HIT_WIDTH` is an internal constant, not a theme token (the public surface exposes
color and rail thickness only).

### 4. Annotation-first interaction precedence, with pointer-down consistency and gesture suspension

In hover and click handlers, annotations take precedence over badges, which take precedence over
spans. A single pointer transition dispatches to at most one layer (no double-dispatch). Activation
requires a pointer-down and pointer-up on the **same** annotation, matching the badge gesture
contract; a click consumed by an annotation does not fall through to the span. Annotation hit testing
is suspended during viewport gestures (pan/pinch/brush), and the hovered annotation is cleared when a
gesture starts, when the pointer leaves the chart, and when the annotation is removed. The clickable
cursor appears only when `onAnnotationClick` is supplied.

### 5. Time re-zero via `projectionOffset`, shared with critical-path intervals

Normalization exposes a `projectionOffset` (`0` in `time` mode, the original domain min in `linear`
mode). Time annotations subtract it from their caller-supplied `time`/`range` exactly as critical
path intervals do, so annotation positions line up with rendered spans in both scales.

### 6. Time annotation placement: time-bar marker (default) vs. plot rail

A time annotation selects a `placement`. The default `'timebar'` mirrors the Kibana APM waterfall
marker: a solid tick and a downward-triangle marker head confined to the **lower half of the time
bar** (over the axis ticks, clear of the time labels), with **nothing drawn in the plot** (a range
additionally tints a band across that lower-half time-bar region). The opt-in `'plot'` keeps the
original treatment: a solid full-height rail for a point, or a tinted plot band with edge rails for a
range. The default was flipped to `'timebar'` because the external axis marker is the common waterfall
idiom and reads as an adornment rather than a plot-spanning divider.

An earlier iteration extended `'timebar'` marks with a faint full-height guide line down the plot;
that was dropped in favor of a time-bar-only mark so the annotation never draws over spans and never
overlaps the time labels (upper half of the bar).

Placement only changes draw geometry — the hit model (Section 3) is unchanged in spirit. A `'timebar'`
point's hit band covers only its lower-half time-bar region at min width; a `'timebar'` range stays
edges-only, each edge a lower-half min-width band. `drawAnnotations` widens its clip to start at
`timeBar.top` (instead of `plot.top`) so the marker/band paint in the axis region while plot-placement
and lane/hierarchy marks still paint in the plot. One theme token backs it: `markerSize` (triangle
size), a style knob unlike the internal `ANNOTATION_MIN_HIT_WIDTH`. Lane and hierarchy annotations are
always plot-anchored — placement applies to time annotations only.

### 7. Annotation resolution memoized separately from the span pipeline

`useSpecFactory` re-upserts annotation specs on every render, so their array reference is unstable.
Resolving annotations inside the main `getPipeline` memo would invalidate the span pipeline on every
frame. Instead, annotation resolution is memoized separately, keyed on the annotation-spec array ref
plus the resolved (pre-collapse) spans ref, and its diagnostics are merged into the single Spec 28
report. Routes are computed against pre-collapse spans through the display hierarchy
(`displayParentId`), so reparented/partial traces ([ADR 0028](./0028-partial-trace-synthetic-parentage.md))
resolve correctly.

## Consequences

- Annotations are visually rich yet interaction-light: they never mask the spans they annotate.
- One layout/draw/pick contract covers all three kinds and stays consistent with badges.
- Hierarchy rails honor "route, not subtree" by segmenting around interleaved siblings.
- Time annotations track spans across scale changes without special-casing at each call site.
- The separate memo keeps viewport frames cheap; annotation churn never re-runs the span pipeline.
- A screen-reader table lists resolved annotations separately from span rows, with keyboard
  activation dispatching `keyboard`-source events (no synthesized hover).

## Alternatives considered

- **Full-band range hit areas:** simplest to pick, but a range band would swallow all pointer events
  over its width, defeating interaction with the spans it frames. Rejected for edges-only.
- **Continuous hierarchy rails:** a single unbroken rail from root to target reads cleanly but
  visually claims interleaved sibling lanes that are not on the route. Rejected for segmented rails.
- **Resolving annotations inside `getPipeline`:** fewer moving parts, but the unstable spec ref would
  invalidate span-pipeline memoization every frame. Rejected for a separate keyed memo.
- **Theme-configurable hit width:** more flexible, but hit tolerance is an interaction-ergonomics
  constant, not a visual style choice; exposing it would enlarge the public surface for little gain.
- **Tinting span bars for lane/hierarchy annotations:** stronger emphasis, but it would overwrite
  span color semantics (color-by, critical path) and couple annotations to span rendering. Rejected
  for boundary rails.
