---
status: provisional           # provisional | implementable | implemented | superseded
domain: trace-viz             # partition key for future generated indexes
owners: []                    # GitHub IDs of primary authors/owners
supersedes: []                # slugs of docs this replaces
---

# `<Feature>` — behavioral spec

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) **are** allowed.

## Summary

<!-- 1–3 sentences. Consumer-facing: what does this feature do and why does it exist? -->

## Public API

<!-- Stable exported symbols only. Examples: prop names, exported interface/type names, exported
     factory functions. Annotate each with its kind and a one-line description. -->

| Symbol | Kind | Description |
|---|---|---|
| `SymbolName` | prop / type / function | What it does for the caller. |

## Behavior & acceptance

<!-- Each criterion is one bullet, ending with a proof anchor.
     Edge cases, gesture/semantics tables, and boundary conditions live HERE,
     not in a separate prose section — they are behavior, and each must be anchored.

     Proof anchor syntax:
       {story:exportName}           → export { … as exportName } must exist in trace.stories.tsx
       {test:path/to/file.test.ts#"leaf string"}
                                    → the file must exist and contain the quoted substring

     Example:
       - Spans colorize by a caller-chosen category (EUI Borealis palette); the same category key
         always maps to the same color.  {story:colorBy}
       - An explicit per-datum `color` overrides the `colorBy` group color.
         {test:packages/charts/src/chart_types/trace_chart/data/colors.test.ts#"per-datum color overrides group"}

     Modifier-key / gesture tables belong here as anchored rows, e.g.:

     | Gesture | Modifier | Selection mode |
     |---|---|---|
     | Click | none | Replace (single segment) |
     | Click | Shift | Additive (extend set) |
     | Click | Cmd / Ctrl | Toggle (add or remove) |
     (Each row should be covered by a {test:…} anchor on the enclosing bullet.)
-->

- …  {story:…}
- …  {test:…#"…"}

## Decisions

<!-- Links to the ADRs that record the non-obvious trade-offs for this feature.
     This section is the consolidation seam: the behavioral spec (WHAT) + ADRs (WHY)
     together form the living feature document. -->

- [ADR NNNN — Decision title](./NNNN-slug.md)

## Non-goals

<!-- Scope boundaries. Each entry must include a one-line reason so future readers
     understand *why* the boundary was drawn, not just that it exists. -->

- **Sub-goal name:** reason this was excluded.
