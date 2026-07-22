# ADR 0027 — Span IDs are unique within one supplied dataset

**Status:** Accepted; visible-output semantics amended by ADR 0028 / Spec 27

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

Malformed duplicate-ID input must terminate without mutating source data. From Spec 27 onward,
visible output follows Kibana reachability: a duplicate reached within one elected trace tree
invalidates that trace group, while valid groups in a combined waterfall remain visible. The same ID
appearing across selected trace groups invalidates the entire combined result because all public
references are chart-global. Duplicate objects in non-elected/unreachable components may be omitted
without being traversed.

## Consequences

- Traversal uses ID-based duplicate detection for Kibana parity, with a termination guard around all
  malformed topology.
- Tests distinguish group-local invalidation, chart-wide cross-trace invalidation, and duplicates in
  components omitted by elected-root reachability.
- No automatic namespacing is performed because rewriting IDs without rewriting every consumer-held
  reference would silently break identity.
