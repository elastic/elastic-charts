# Spec 2 — Self-time derivation

**Goal:** resolve each span's `active` segments when Spec 1 left them empty — i.e. derive self time as
a fallback for spans without an explicit `active` (simple format only; see Spec 1).

**Depends on:** [Spec 1](./spec-1-normalization.md) (`NormalizedSpan`).

See [ADR 0003](../0003-self-time-as-active-segments.md) for why self time, not full duration, is the default.

## Files

- `chart_types/trace_chart/data/self_time.ts`.

## Contract

```ts
function resolveActive(spans: NormalizedSpan[]): NormalizedSpan[]; // fills `active`
```

## Steps

Build a `parentId → children[]` map. For each span whose `active` is empty (i.e. Spec 1 found no
`TraceDatum.active` to copy), compute `[start,end]` minus the **union** of its direct children's
`[start,end]` via sorted-interval subtraction, producing 0..N segments. Spans that already carry a
non-empty `active` (copied verbatim by Spec 1 from an explicit `TraceDatum.active`) pass through
unchanged. Clamp any child extent to the parent's before subtracting, so a child that overruns its
parent (clock skew, bad data) cannot produce a negative-width or out-of-bounds segment.

## Storybook

`storybook/stories/trace/02_self_time_debug.story.tsx` — inspector rendering each span's derived
`active` segments (as text/inline bars) for a nested fixture; shows the gaps where children run.

## Tests

`data/self_time.test.ts` — no children → one full segment; one child in the middle → two segments;
overlapping children → merged coverage; child exceeding parent → clamped; explicit `active` respected;
leaf with 0-duration → empty/degenerate case handled.

## Review (`/review-claudio`)

Interval-math correctness and complexity (O(n log n), not O(n²)), immutability of input spans,
meaningful (not tautological) tests.

## Acceptance

Tests green; debug story shows correct self-time gaps; deterministic ordering (ascending start);
review findings addressed.
