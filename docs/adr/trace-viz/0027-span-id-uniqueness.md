# ADR 0027 — Span IDs are unique within one supplied dataset

**Status:** Accepted (Spec 24 clarification)

## Context

The Trace chart accepts combined multi-trace data, while parentage, selection, collapse, critical
intervals, connections, and scroll-to-span all address spans by ID. Preserving duplicate-ID objects
by reference prevents crashes and lane loss, but cannot determine which duplicate owns an ID-based
relationship or command.

## Decision

`TraceDatum.id` must be unique across the complete `data` array supplied to one `Trace`, including
combined multi-trace datasets. A consumer combining sources whose IDs can collide must namespace the
IDs and every corresponding reference (`parentId`, critical-path `spanId`, connection endpoints,
selection refs, and collapse IDs) consistently.

Malformed duplicate-ID input remains defensive: normalization and lane traversal must terminate and
must not drop or overwrite span objects merely because their IDs collide. Semantic behavior for
parentage and other ID-addressed features is unspecified when the uniqueness contract is violated.

## Consequences

- Object-identity visited/work maps remain required for traversal safety; they do not make duplicate
  IDs semantically supported.
- Tests for duplicate IDs assert termination, cardinality, and order preservation only.
- No automatic namespacing is performed because rewriting IDs without rewriting every consumer-held
  reference would silently break identity.
