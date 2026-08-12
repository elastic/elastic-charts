---
status: accepted
domain: trace-viz
owners: []
supersedes: []
---

# Spec 32 — Collapse child count

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) **are** allowed.

## Summary

When `showChildCount` is enabled, every parent lane in a tree-ordered Trace renders its number of
**display children** immediately to the right of the disclosure caret, in the subdued gutter-label
treatment. The count is always visible on parent lanes — collapsed or expanded — so the **disclosure
gutter** width is stable across collapse toggles.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `showChildCount` | prop (`TraceSpec`) | When `true`, renders each parent's display-child count beside its caret. Defaults to `false`. |

## Behavior & acceptance

- When `showChildCount` is `true`, a parent lane renders its **display-child count** to the right of
  the caret glyph in the themed `gutterLabel` font. Leaf lanes render nothing.
  {story:childCount}

- The count uses **display topology**: a reparented orphan counts toward its elected synthetic
  display parent (Spec 26 / ADR 0028), and an identically-named parent in another trace group of a
  combined waterfall never claims those children.
  {test:packages/charts/src/chart_types/trace_chart/data/collapse.test.ts#"child count uses display parentage"}

- The count is the number of **direct** display children only, unaffected by collapse state: a
  collapsed parent shows the same number as when expanded. The subtree total (`descendantCount`)
  remains exclusive to the aria-live "N descendants hidden" announcement and is never shown in the
  gutter.
  {test:packages/charts/src/chart_types/trace_chart/data/collapse.test.ts#"child count is unchanged by collapse state"}

- The count is derived from the **pre-collapse** pipeline output — a display child that is itself
  collapsed still counts as one direct child of its parent.
  {test:packages/charts/src/chart_types/trace_chart/data/collapse.test.ts#"child count ignores hidden lanes"}

- The disclosure gutter widens by a measured reserve sized to the widest count string across all
  parent spans, so the gutter width, plot origin, labels, and badges never reflow when a caret is
  toggled. The reserve is computed once per data change.
  {test:packages/charts/src/chart_types/trace_chart/render/geometry.test.ts#"child count widens the caret column"}

- The caret glyph **and** the count text form a single disclosure click/tap target: clicking the
  count toggles collapse and is consumed before selection, exactly like a direct caret click
  (ADR 0026 §3e). `onElementClick` is not called and selection is unchanged.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"pickDisclosure includes the child-count zone"}

- The drawn x-range of the count text and `pickDisclosure`'s accepted x-range are both derived from
  the disclosure column geometry published by `buildGeometry` (ADR 0037 D1). They cannot drift
  independently.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"child count draw and pick zones agree"}

- With `showChildCount` omitted or `false`, layout and rendering are identical to today: no reserve,
  no count text.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"child count is off by default"}

- In `laneOrder: 'chronological'` the prop is inert (no disclosure gutter exists and no dev warning
  is added — ADR 0026's existing chronological-mode warning covers the gutter's absence).
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"child count is inert in chronological mode"}

## Decisions

- [ADR 0026 — Collapsible nesting: rolled-up semantics, tree-gating, and disclosure gutter](../0026-collapsible-nesting.md) — owns the disclosure gutter, tree-gating, and the caret-click consumption model this spec extends.
- [ADR 0028 — Partial-trace synthetic parentage](../0028-partial-trace-synthetic-parentage.md) — defines the display topology from which the display-child count is derived.
- [ADR 0037 — Disclosure column sub-widths are measured and published, not re-derived](../0037-disclosure-column-measured-widths.md) — the count reserve is measured via the pipeline measurer and published on the geometry; both the draw pass and `pickDisclosure` read from it.

## Non-goals

- **Subtree totals in the gutter:** direct display-child count answers "what's one level down";
  the subtree total is already surfaced on collapse via the aria-live announcement, and showing both
  numbers inside a ~28 px gutter column is noise.
- **Screen-reader surfacing:** the SR table already carries a `parentName` column per row and appends
  "(N descendants hidden)" to collapsed parent rows; a spoken count would duplicate information AT
  users already have.
- **Count formatting / i18n:** the count is rendered as a plain integer with no locale grouping,
  abbreviation, or upper-bound clamp.
- **Counting spans hidden by anything other than collapse:** the count reflects what expanding the
  parent would reveal — only the direct display-child count in the pre-collapse pipeline output.
