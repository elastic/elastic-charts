# ADR 0016 — Connections are an explicit consumer-supplied prop, not derived from OTel links

**Status:** Accepted (Spec 23)

## Context

Spec 23 adds directional connector arrows between segment endpoints — the Chrome DevTools "Initiated
by" relationship: segment A finished and caused segment B to start. A `connections` prop is added to
`TraceSpec`; each entry is a `TraceConnection { from: TraceSegmentRef; to: TraceSegmentRef }`.

## Decision 1: Explicit prop, not derived from OTel `links`

OpenTelemetry spans carry a `links` array of `{ traceId, spanId, attributes }` references, which is a
looser "related to" relation at span granularity. The chart's OTel adapter (`fromOtlp`) does not map
these into connections, and there is no plan to do so.

**Why:** OTel links are span-to-span (not segment-precise) and semantically underspecified — they can
represent "caused by," "follows from," or merely "related to." The Chrome initiator pattern is
segment-precise (from the *end* of one segment to the *start* of another). Deriving connections
automatically from OTel links would:
1. Silently produce wrong anchors (span start/end vs. the specific active/waiting segment end that
   triggered the next request).
2. Couple the feature to OTel-shaped data, excluding non-OTel consumers.
3. Misrepresent the looser OTel semantics as a strict causal "initiated by" relationship.

Consumers that *do* have OTel-shaped data and want to surface links can map them to `TraceConnection`
values using `fromOtlp`'s `meta` passthrough (the raw OTel span is preserved on `datum.meta`).

## Decision 2: Reuse `TraceSegmentRef` for endpoints

`TraceSegmentRef { spanId, region, segmentIndex }` (Spec 13, ADR 0011 Decision 3) already addresses
any sub-span region precisely. Reusing it means:
- No new identity type for connection endpoints.
- `from` anchors at the **end** of the referenced region; `to` anchors at the **start** — the
  natural "A triggered B" semantics.
- Endpoint resolution reuses the same region→interval logic as the selection-highlight pass.

## Decision 3: Visual-only in v1; no label, color, or a11y surface

The v1 `TraceConnection` type carries no `label`, `color`, or tooltip data. These are deferred to a
named follow-up (see Spec 23 "Out of scope"). Adding fields before a real consumer exists would
speculate about the API surface and make the type harder to deprecate if the semantics prove wrong.
The `from`/`to` `TraceSegmentRef`s provide enough identity to reconstruct SR/tooltip content in a
follow-up without a breaking change.
