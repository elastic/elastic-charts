# Spec 8 — Integration, performance & docs finalization

**Goal:** end-to-end scenarios that combine the per-spec aspects, the performance gate, and finalized docs.

**Depends on:** [Spec 0](./spec-0-scaffolding.md) through [Spec 7](./spec-7-tooltip-events.md) — each
already carries its own aspect story and review.

## Files

- `storybook/stories/trace/08_multi_trace.story.tsx` — `traceId` filter + multi-trace dev-warn.
- `storybook/stories/trace/09_large_n.story.tsx` — ~5k spans, the performance gate.
- VRT baselines for the visual stories (05/06/07) per repo convention.

## Steps

Author the integration stories and their fixtures. Update this `docs/adr/trace-viz/specs/` set and the ADRs with
anything that changed during implementation. Verify the root `CONTEXT.md` glossary still matches the
shipped terms.

## Storybook

The multi-trace and large-N stories above are this spec's aspect.

## Tests

Full `yarn jest trace_chart`. The large-N story is the **performance gate** — pan/zoom must stay
responsive with viewport culling; if it doesn't, that's the signal to exercise the WebGL seam from
[ADR 0001](../0001-renderer-canvas2d-with-webgl-seam.md).

## Review (`/review-claudio`)

A final pass over the whole branch vs. `master` — cross-cutting alternatives, type/test quality,
security, and end-to-end performance.

## Acceptance

All stories render; `yarn jest trace_chart` and `yarn typecheck` are green; VRT baselines updated; docs
reconciled with the shipped implementation; final review findings addressed.
