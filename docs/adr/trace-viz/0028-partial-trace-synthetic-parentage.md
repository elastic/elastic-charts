# ADR 0028 — Partial traces use source-preserving synthetic parentage

**Status:** Proposed (Spec 27)

## Context

A supplied trace can be incomplete: a span may reference a `parentId` whose span is absent from the
visible dataset. Treating every such orphan as an unrelated root preserves data but fragments the
execution flow. Kibana APM instead marks the trace partial and displays genuine orphans beneath an
elected visible root. Kibana performs that repair on cloned waterfall items, warns the user, and
marks reparented items as orphans.

Directly replacing Elastic Charts' normalized `parentId` would make a presentation repair look like
source truth. It would also cause synthetic children to reduce the root's derived self time and would
leak the invented parent through click and selection payloads.

## Decision

Partial-trace recovery is always on when a trace group has an unambiguous display root. A span whose
recorded parent is missing remains an **orphan span** and keeps its recorded `parentId`; when it can be
recovered safely, normalization assigns a separate synthetic display parent pointing to the elected
root. The original `TraceDatum` is never mutated.

Display topology drives tree lane order, collapse/rollup membership, screen-reader indentation, and
clock-skew correction. Source topology continues to drive derived self time. Public payload
`parentId` remains the recorded value and optional orphan provenance identifies both the missing
relationship and any synthetic root used for display.

Recovery is grouped by `traceId` so a span is never attached across distinct trace-ID values
(`undefined` is one group because no finer identity exists). A group with exactly one recorded root
uses it. A group with no recorded root elects its first orphan in normalized input order as a fallback
root, matching Kibana's fallback rule. A group with multiple recorded roots is ambiguous: all spans
are retained and missing-parent spans remain top-level rather than choosing a root silently.

The chart shows a non-blocking partial-trace warning while continuing to render, and tooltip and
screen-reader surfaces identify each orphan. No opt-in flag is added: an incomplete relationship is
always disclosed, and the synthetic relationship is confined to display semantics.

## Kibana reference boundary

The baseline is Kibana APM's `TraceWaterfall` behavior in `@kbn/apm-ui-shared`:

- commit `c96a8839e018` introduced partial-trace root fallback, trace-level warnings, and per-orphan
  disclosure;
- commit `36c31d600a371` applies focused-trace reparenting and clock-skew placement to cloned items;
- commit `3843218ee070` prevents reparenting an orphan ancestor beneath a selected descendant root.

Elastic deliberately differs in two ways: it never drops unrelated roots from the supplied dataset,
and it does not overwrite recorded parent identity. Focused-subtree selection is not introduced by
Spec 27; a future focus-root feature must adopt Kibana's ancestor-path cycle guard before it can use
synthetic parentage.

## Consequences

- ADR 0018's orphan-as-root rule remains the fallback for ambiguous groups, malformed topology, and
  orphan spans that cannot be reparented safely; it is no longer the only partial-trace presentation.
- `skewCorrected` and orphan provenance are independent: a reparented span may have either, both, or
  neither timing marker depending on whether its coordinates moved.
- Collapsing an elected display root includes reparented orphan subtrees in the visual rollup, while
  the root's derived self time still excludes them from causal child subtraction.
- Duplicate IDs and cycles retain only the defensive guarantees of ADR 0027: termination,
  cardinality, and no mutation. No semantic recovery is attempted for malformed identity graphs.
