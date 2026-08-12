---
status: accepted
domain: trace-viz
owners: []
supersedes: []
---

# Spec 33 — Tree guides

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) **are** allowed.

## Summary

When `showTreeGuides` is enabled, an expanded parent draws a vertical spine downward through the
**disclosure gutter** to its last visible **display child**, with a short horizontal elbow into each
child's lane. The guides make parent↔child membership readable without relying on indentation alone.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `showTreeGuides` | prop (`TraceSpec`) | When `true`, draws tree guides in the disclosure gutter and widens the depth indent so each elbow is legible. Defaults to `false`. |
| `theme.trace.treeGuideColor` | theme token | Stroke color of the spines and elbows. |

## Behavior & acceptance

- When `showTreeGuides` is `true`, an **expanded** parent draws a vertical spine from its caret
  downward to its last visible display child, with a short horizontal elbow into each display
  child's lane at that child's indent depth. {story:treeGuides}

- A **collapsed** parent draws no spine. Its display children are hidden; there are no lane
  positions to connect.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"collapsed parent draws no spine"}

- Tree guides are drawn for **every** open ancestor depth. A lane that is a deep descendant shows
  one vertical guide per open ancestor between the root and itself, plus its own elbow — composing
  into the classic file-tree visual.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"nested lane shows one guide per open ancestor"}

- A spine **terminates** at its last display child with an elbow rather than running past it, so a
  subtree's visual boundary is closed at the bottom.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"spine terminates at the last child"}

- Enabling `showTreeGuides` widens the effective depth indent step (from `CARET_INDENT_STEP_PX` to
  `TREE_GUIDE_INDENT_STEP_PX`) so each elbow has room to be legible. This layout change happens
  once at mount and never reflows during collapse toggles — the disclosure gutter width is stable
  after mount regardless of which carets are toggled. {story:treeGuides}
  {test:packages/charts/src/chart_types/trace_chart/render/geometry.test.ts#"tree guides widen the indent step"}

- Tree guides are confined to the disclosure gutter. They never paint into the label area,
  badge-only gutter, or plot.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"tree guides stay within the disclosure gutter"}

- Tree guides render correctly while the chart is scrolled: a spine whose parent lane is culled
  above the visible viewport still draws through the visible portion of the lanes it spans,
  clipped to the plot rect.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"spine draws when its parent is scrolled out of view"}

- In a multi-trace forest (combined waterfall, `laneOrder: 'tree'`, no `traceId` filter), a
  trace group's root lane has no spine above it, and one group's spine never extends into another
  group's lanes.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"forest roots have no spine"}

- Tree guides are decorative and non-interactive. They are not hit-testable and never consume a
  click. `pickDisclosure`, `pickRegion`, and `pickBadge` return identical results with guides on
  or off.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"tree guides are not pickable"}

- `showTreeGuides` and `showDisplayChildCount` compose: the spine runs at the caret's indent depth,
  and the count text appears to the right of the caret glyph. Neither feature's geometry
  overlaps the other's. {story:treeGuides}

- With `showTreeGuides` omitted or `false`, rendering is identical to today — including the
  8 px depth indent step.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"tree guides are off by default"}

- In `laneOrder: 'chronological'` the prop is inert (no disclosure gutter exists; ADR 0026's
  existing guard applies).
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"tree guides are inert in chronological mode"}

## Decisions

- [ADR 0026 — Collapsible nesting: rolled-up semantics, tree-gating, and disclosure gutter](../0026-collapsible-nesting.md) — the depth-indented caret grid in the disclosure gutter that tree guides are drawn onto.
- [ADR 0018 — Lane ordering: tree (DFS) default, chronological optional](../0018-lane-ordering-tree-default.md) — parent/descendant lane adjacency in tree mode is the structural invariant that makes a contiguous spine expressible at all.
- [ADR 0037 — Disclosure column sub-widths are measured and published, not re-derived](../0037-disclosure-column-measured-widths.md) — Decision 2 records why the indent step is prop-dependent and why it widens once at mount rather than unconditionally.

## Non-goals

- **Guide style configuration:** one `theme.trace.treeGuideColor` token is exposed. Dash pattern,
  stroke thickness, and elbow corner radius stay private constants until a caller requests them.
- **Guides connecting bars in the plot area:** connecting bar endpoints across lanes is Spec 35
  (Connections); tree guides stay in the disclosure gutter.
- **Screen-reader surfacing:** tree guides restate hierarchy that the SR table's `parentName`
  column and `parentId` structure already expose to assistive technology.
- **Guides into collapsed subtrees:** a collapsed parent's display children have no visible lane
  index; there is nothing to elbow into.
