# ADR 0037 — Disclosure column sub-widths are measured and published, not re-derived

**Status:** Accepted  
**Implements:** [Spec 32 (harvested) — Collapse child count](./trace-chart.md#collapsible-nesting), [Spec 33 — Tree guides](./specs/spec-33-tree-guides.md)  
**Cites:** [ADR 0026](./0026-collapsible-nesting.md) — disclosure gutter; [ADR 0029](./0029-trace-badge-rendering-architecture.md) — `computeBadgeGutterWidth` precedent.

## Context

ADR 0026 introduced the **disclosure gutter**: a fixed left column whose width is the sum of three
sub-widths — a label-gutter component (mode-dependent), the caret glyph zone (`CARET_GLYPH_PX`), and
a per-depth indent allocation (`CARET_INDENT_STEP_PX × maxDepth`). At that point every sub-width was
a compile-time constant, so an internal consistency shortcut was acceptable: rather than publishing
the caret-column sub-width explicitly, `canvas2d_renderer` re-derived it by subtracting
`style.gutterWidth` from `gutter.width`, and `badge_layout` mirrored the same subtraction (its
comment explicitly states "mirroring the renderer's derivation").

Specs 32 and 33 break both constants:

- **Spec 32** adds a data-derived child-count column whose width is measured at runtime (sized to the
  widest count string across all parents, using the canvas-backed text measurer already used by badge
  layout — see ADR 0029). It is not a constant and cannot be reconstructed by arithmetic on
  `gutter.width`.
- **Spec 33** makes the depth indent step itself prop-dependent: `showTreeGuides` raises it from 8 to
  ~14 px. `CARET_INDENT_STEP_PX` becomes an off-by-default baseline constant, not the effective step
  at draw/pick time.

With these two changes, the existing subtraction pattern breaks: the renderer and badge layout would
each independently reconstruct a column width that no longer matches the one used during
`buildGeometry`, causing caret glyphs and count text to draw at the wrong x, and `pickDisclosure`'s
hit zone to cover different pixels than the drawn mark.

## Decision 1: Disclosure column sub-widths are published on the geometry

The caret-glyph width, the child-count column width, the effective indent step, and `maxDepth` are
computed once — in `buildGeometry` / the pipeline that feeds it — and carried on `TraceGeometry` as
a `disclosureColumn` sub-object. All consumers (caret draw, count draw, `pickDisclosure`, and
`badge_layout.caretColumnWidth`) read from that one value.

**Why this over alternatives:**

- **Keeping the subtraction:** valid only while the sub-widths are constants. Adding the count column
  means the renderer must reconstruct `countColumnPx` by a different subtraction, but `badge_layout`
  cannot do the same reconstruction without also knowing `countColumnPx` independently — a circular
  dependency with no clean resolution.
- **Passing each sub-width as a separate `buildGeometry` argument:** the signature already has 15
  parameters; introducing three more for this feature without publishing them on the geometry still
  requires consumers to call `buildGeometry` with the right values each time, and still creates the
  same drift risk if a consumer derives them locally.
- **Publishing on geometry (chosen):** the geometry is already the single source of truth for layout
  values shared between draw and pick passes. `disclosureByLane` lives there today; extending it with
  `disclosureColumn` is the same pattern.

The count column width is measured in the pipeline's existing measurer call-site (the same call that
feeds `computeBadgeGutterWidth`), memoized per data-change, and threaded into `buildGeometry` like
`badgeGutterWidth`. In `buildGeometry`, `gutterPx(style, opts)` continues to compute the total gutter
width additively (for the `gutter` rect), but the per-sub-width breakdown is published on the geometry
for consumers that need it.

## Decision 2: The depth indent step is prop-dependent

`TraceSpec.showTreeGuides` raises the effective depth indent step from 8 px to a value sufficient to
draw a legible elbow (≥ 12 px; the exact constant is `TREE_GUIDE_INDENT_STEP_PX` in `types.ts`).
The baseline constant `CARET_INDENT_STEP_PX` is preserved as the default (guides off); the effective
step is chosen in `buildGeometry` based on the prop, and published as part of `disclosureColumn`.

**Why this over alternatives:**

- **Always 4 px elbow (8 px step, unchanged):** at 14 px lane height (bar band minus padding), a 4 px
  stub reads as a tick mark — not a connector. Insufficient for the feature's legibility goal.
- **Unconditionally wider step:** widens the disclosure gutter on every existing nested-data chart,
  shifting the plot left, churning all nested-trace VRT baselines, and imposing a layout cost on users
  who never enable guides.
- **Prop-dependent step (chosen):** widens the gutter once — at mount, when `showTreeGuides` is
  supplied — and never reflows during collapse toggles (the count reserve is sized across all
  pre-collapse parents, independent of collapse state). VRT regressions on existing stories are zero
  because both new props default to `false`.

## Consequences

- `canvas2d_renderer.caretColumnWidth` (the locally-derived variable) is removed; call sites read
  `disclosureColumnWidth(geom.disclosureColumn)` — i.e. `maxDepth * indentStepPx + caretPx + countPx`.
  `pickDisclosure` instead adds the per-lane `entry.depth * indentStepPx`, so the two sums differ by
  design and neither re-derives the parts.
- `badge_layout.caretColumnWidth()` (the mirror function) is removed; call sites read
  `disclosureColumnWidth(geom.disclosureColumn)` via the same exported helper.
- `pickDisclosure`'s right-hand x bound becomes
  `gutter.left + entry.depth * disclosureColumn.indentStepPx + disclosureColumn.caretPx + disclosureColumn.countPx`,
  so the click/tap zone covers the drawn mark plus the count reserve.
- The disclosure hit zone spans the whole count reserve, not each lane's rendered digits: a parent
  showing `5` on a chart whose widest count is `128` is still clickable across the full reserve.
  Uniform target width, no per-lane measurement at pick time; same deliberate hit-exceeds-ink
  asymmetry as the `minSpanWidthPx` floor.
- `gutterPx(style, opts)` signature is unchanged; it still returns the total gutter width for the
  `gutter` rect. The `opts` shape gains `childCountPx` so the total includes the count reserve.
- Callers that hand-roll a `TraceGeometry` in tests must supply `disclosureColumn`; the existing
  `new Map()` pattern for `disclosureByLane` is the precedent — an empty/zero value is the safe
  default for tests that do not exercise the disclosure column.
