---
status: accepted
domain: trace-viz
owners: []
supersedes: []
---

# Spec 31 — Connections

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

## Summary

A Trace chart may draw **connections** — directional connector arrows between two segment endpoints,
possibly in different lanes, expressing the Chrome DevTools "Initiated by" relationship: one segment
triggered another. Connections are a consumer-supplied prop and are causal edges distinct from the
structural `parentId` span tree. In v1 they are visual-only.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `TraceConnection` | type | A directed causal edge between two segment endpoints ("Initiated by"). |
| `TraceConnection.from` | field | Initiator endpoint (a `TraceSegmentRef`); the arrow originates at the END of this region. |
| `TraceConnection.to` | field | Initiated endpoint (a `TraceSegmentRef`); the arrow points to the START of this region. |
| `TraceSpec.connections` | prop | Consumer-supplied directed edges; omitting or supplying `[]` draws nothing. |
| `theme.trace.connectionColor` | theme token | Stroke and arrowhead color for connection arrows. |
| `theme.trace.connectionThickness` | theme token | Stroke width for connection arrows. |

## Behavior & acceptance

- Supplying `connections` draws a directional elbow connector from the end of each `from` region to
  the start of each `to` region; omitting the prop or supplying `[]` draws nothing.
  {story:connections}
- Each endpoint is a `TraceSegmentRef` — the same thin identity ref used for selection. The anchor
  time is derived from the referenced `region`: for a `'span'` ref the `from` anchor is the span end
  and the `to` anchor is the span start; for `'active'` and `'waiting'` refs the anchors are the end
  and start of the addressed segment.
  {test:packages/charts/src/chart_types/trace_chart/render/geometry.test.ts#"resolves connection endpoints by region"}
- A connection referencing an unknown `spanId`, or an out-of-range segment index, is dropped; a
  valid connection resolves against the already-prepared spans without re-zeroing time.
  {test:packages/charts/src/chart_types/trace_chart/render/geometry.test.ts#"drops connections with unresolvable endpoints"}
- A cross-lane connection renders an orthogonal elbow with a filled triangle arrowhead at the target
  endpoint. {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"draws a cross-lane connection with an arrowhead"}
- A connection whose endpoints share one lane degenerates to a horizontal line with the arrowhead at
  the target. {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"draws a same-lane connection as a horizontal line"}
- Temporal ordering is not enforced: a connection whose source time is later than its target time is
  drawn as-is; the elbow handles inverted geometry without special-casing.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"draws inverted connections without special casing"}
- A connection with both endpoints scrolled off-screen still renders its visible crossing portion;
  connections never paint into the gutter or time bar because they are clipped to the plot area.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"clips connections to the plot area"}
- Connections draw after the critical-path highlight and before selection outlines, and add no
  interaction state: they are pure render layered on prepared data.
  {test:packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.test.ts#"draws connections above critical path and below selection"}

## Decisions

- [ADR 0016 — Connections are an explicit consumer-supplied prop, not derived from OTel links](../0016-connections-explicit-prop.md)

## Non-goals

- **Screen-reader "Initiated by" relationships:** v1 does not add inbound/outbound connection rows to
  the span accessibility surface.
- **Connection hover tooltip or label:** v1 draws the connector only; there is no per-connection
  tooltip, label text, or hover affordance.
- **Selection-linked highlighting:** v1 does not emphasize a span's incoming/outgoing connections
  when a segment is selected.
- **Per-connection style fields:** v1 has no `label` or per-connection `color`; one theme color and
  thickness drive every connector.
- **OTel-`links`-derived connections:** span-to-span links are not segment-precise, so `fromOtlp`
  does not synthesize connections in v1.
