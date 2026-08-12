# ADR 0038 — Public props name display topology when their value derives from it

**Status:** Accepted  
**Implements:** [Spec 32 (harvested) — Collapse child count](./trace-chart.md#collapsible-nesting)  
**Cites:** [ADR 0028](./0028-partial-trace-synthetic-parentage.md) — display topology; [Spec 33 — Tree guides](./specs/spec-33-tree-guides.md).

## Context

[ADR 0028](./0028-partial-trace-synthetic-parentage.md) introduced **display topology**: the tree
computed from `displayParentId(span) = span.reparentedToSpanId ?? span.parentId`. Display topology
may differ from recorded (source) topology — an orphaned span can be reparented to a synthetic root
under a different parent than the one recorded in its `parentId`. Both topologies coexist in every
prepared dataset.

When Spec 32 adds a prop for the display-child count, the natural name is `showChildCount`. But
"child" is load-bearing: a span's recorded child count and its display child count can differ, and the
distinction is a spec acceptance criterion (*"a reparented orphan counts toward its elected synthetic
display parent"*). Using `showChildCount` leaves that question unanswered at the API surface.

## Decision

**A prop whose computed value depends on display topology spells it out in its name; a prop that
merely renders or accepts existing structure does not.**

- `showDisplayChildCount`: the *number* it draws is computed over display parentage — using recorded
  parentage instead would produce a different integer. The ambiguity is load-bearing, so the name
  resolves it.
- `showTreeGuides` (Spec 33): draws spines and elbows connecting adjacent lanes in the display tree,
  but every input it needs (lane positions, depth, adjacency) is already determined by the time the
  draw pass runs. The prop is a visual switch, not a query over two competing topologies.
- `collapsedSpanIds`: a set of span IDs. The component looks each ID up in the display tree, but the
  prop's value is just a set of IDs — not a count, not a derived statistic. No ambiguity.

The rule is scoped to *computed values* (statistics, measurements, derived aggregates). It does not
require renaming every prop that touches the display tree — that would turn `collapsedSpanIds` into
`displayCollapsedSpanIds` and `showTreeGuides` into `showDisplayTreeGuides`, neither of which
resolves a real ambiguity.

**Why this over alternatives:**

- **Keep `showChildCount`** (bare): leaves the recorded-vs-display ambiguity in the public API. Spec
  32's acceptance test *"child count uses display parentage"* documents the answer, but the prop name
  forces the reader to look it up rather than reading it from the API.
- **Rename everything that touches the display tree** (`showDisplayTreeGuides`, etc.): eliminates a
  real ambiguity only where one exists. For structure-rendering props the question never arises, so
  the rename adds noise rather than clarity.
- **Scope to computed values (chosen):** names the ambiguity exactly where it matters — at the API
  boundary for props whose *value* would change if you swapped topologies — and nowhere else.

## Consequences

- `TraceSpec.showDisplayChildCount` is the only prop introduced by this rule so far.
- Future props whose value is a count, ratio, or measurement computed over display parentage should
  spell it out (e.g. a hypothetical `displayChildDepthLimit`). Props that merely render or accept
  IDs/booleans over the existing tree structure should not.
- The rule is intentionally narrow. If a future feature creates a similar ambiguity on the recorded
  side (e.g. a prop whose value changes depending on which topology is queried), the same principle
  applies symmetrically — spell out `recorded` if the prop's value is computed over recorded topology
  and the distinction matters.
