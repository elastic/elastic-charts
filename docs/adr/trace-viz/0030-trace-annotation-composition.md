---
status: accepted
domain: trace-viz
owners: []
supersedes: []
---

# Trace annotations compose as child specs

## Context

Trace needs annotations that can mark x-scale positions or ranges, resolved span lanes, and visible
root-to-target span routes. These annotations are zero-to-many independent entities with their own
identity, metadata, visibility, and interaction behavior.

The existing Trace chart is a self-managed canvas chart with one primary Trace spec. Adding all
annotation variants as Trace-level props would make the Trace spec grow sideways and couple unrelated
annotation kinds to one prop surface. XY charts already model annotations as independent specs, but
Trace cannot reuse XY annotation behavior directly because Trace owns its own lane model, canvas
renderer, hit testing, and vertical scroll state.

## Decision

Trace annotations are configured as composed child specs of `Trace`:

```tsx
<Trace data={data}>
  <TraceTimeAnnotation id="deploy" time={deployTime} />
  <TraceHierarchyAnnotation id="checkout" spanId="span-42" />
</Trace>
```

The annotation children are declarative specs, not arbitrary rendered React overlays. Trace remains
responsible for resolving them against prepared trace data, rendering them, hit testing them, and
reporting interaction events.

## Consequences

- Annotation variants can evolve independently without adding one large Trace-level annotation prop.
- Multiple annotations can be ordered, identified, hidden, and interacted with as first-class Trace
  specs.
- Trace intentionally departs from the current null-rendering single-spec shape and must define how
  child specs are collected.
- XY annotation concepts can inform naming and interaction semantics, but Trace annotation geometry
  and hit testing remain Trace-specific.

## Alternatives considered

- **Trace-level annotation arrays:** simpler to implement initially, but scales poorly as annotation
  kinds diverge and makes one Trace prop own every future annotation feature.
- **Reuse XY annotation specs directly:** attractive for API familiarity, but XY annotations target
  Cartesian series/axes and DOM tooltip machinery that does not map cleanly to Trace lanes and
  hierarchy.
- **Arbitrary React annotation overlays:** flexible, but pushes positioning, virtualization,
  accessibility, and pan/zoom synchronization out to consumers.
