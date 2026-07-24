# Spec 8 — Integration, performance & docs finalization

**Goal:** end-to-end scenarios that combine the per-spec aspects, the performance gate, and finalized docs.

**Depends on:** [Spec 0](./spec-0-scaffolding.md) through [Spec 7](./spec-7-tooltip-events.md) — each
already carries its own aspect story and review.

## What was implemented vs. originally planned

**Multi-trace filter + dev-warn** — the data-layer implementation (`normalize`/`selectTrace` in
`data/normalize.ts`) already existed from Spec 1. Spec 8 exposed it through the public API by adding an
optional `traceId?` prop to `TraceSpecBase` and threading it through `getPipeline` → `normalize`. The
pipeline cache and `viewKey` (view-reset key in `trace_chart.tsx`) were updated to include `traceId`, so
changing the prop invalidates the memo and resets zoom/pan to fit-all (a different trace has a different
domain — preserving the old `focusDomain` would strand the view, the same creep the existing
`xScaleType`/`format` reset already guards against). A **zero-match dev-warn** was also added: when
`traceId` is set but matches no spans, `Logger.warn` fires so a mistyped id is debuggable.

**Viewport culling / performance gate** — both axes were already culled from Spec 5/6: vertical via the
`firstLane`/`lastLane` lane-window formula in `canvas2d_renderer.ts`, horizontal via per-span and
per-segment bailouts. `resolveActive` (self-time) is O(N log N). The large-N story is therefore a
**demonstration and regression guard**, not new engine work. A unit test in
`canvas2d_renderer.test.ts` asserts that `draw()` issues only O(visible lanes) fill calls for 5000
spans (far fewer than 5000), locking in the culling invariant.

## Files

- `storybook/stories/trace/08_multi_trace.story.tsx` — `traceId` filter + multi-trace dev-warn story.
- `storybook/stories/trace/09_large_n.story.tsx` — ~5k spans, the performance gate story.
- VRT baselines for all visual trace stories (05/06/07/08/09) — **generated in the Linux Playwright
  Docker container** (`mcr.microsoft.com/playwright:<ver>-noble`), not on macOS hosts. Generate via
  `cd e2e && yarn test --update-snapshots` through `e2e/scripts/start.sh`, then commit the resulting
  `e2e/screenshots/all.test.ts-snapshots/baselines/trace-alpha/*-chrome-linux.png` files.

## Steps completed

1. Added `traceId?` to `TraceSpecBase` in `trace_api.ts`.
2. Added zero-match dev-warn in `data/normalize.ts → selectTrace`.
3. Added `traceId` to `PipelineCache` key and `ViewKey` in `trace_chart.tsx` / `render/interaction.ts`.
4. Added `traceId` to `normalize()` call sites in `getPipeline`.
5. Added culling regression unit test in `canvas2d_renderer.test.ts`.
6. Added zero-match dev-warn unit tests in `data/normalize.test.ts`.
7. Authored `08_multi_trace.story.tsx` and `09_large_n.story.tsx`; registered both in `trace.stories.tsx`.
8. Reconciled this spec doc with shipped behavior.

## Tests

Full `yarn jest trace_chart` — all green. Culling is guarded by the regression test described above.

## Review (`/review-claudio`)

A final pass over the whole branch vs. `master` — cross-cutting alternatives, type/test quality,
security, and end-to-end performance. Run separately after all stories land.

## Acceptance

All stories render; `yarn jest trace_chart` and `yarn typecheck` are green; VRT baselines updated (in
CI/Docker); docs reconciled with the shipped implementation; final review findings addressed.
