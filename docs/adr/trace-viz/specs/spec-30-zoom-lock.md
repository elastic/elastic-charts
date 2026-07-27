---
status: provisional
domain: trace-viz
owners: []
supersedes: []
---

# Spec 30 — Zoom lock

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

## Summary

A Trace chart may **lock its zoom** so the user cannot change the zoom level by any gesture — mouse
wheel, `+`/`-` keys, two-finger pinch, or brush-to-zoom. Locking is expressed by `zoomable: false`;
the zoom level is fixed while **panning, selection, tooltip, and collapse remain fully active**. The
lock targets user gestures only: the visible window can still be driven programmatically through
`focusDomain`, so a consumer can pin the chart to a specific window by pairing the two props.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `TraceSpec.zoomable` | prop | `boolean`, default `true`. When `false`, disables all zoom gestures (wheel, `+`/`-` keys, pinch, brush-to-zoom); pan and all other interactions are unaffected. |

## Behavior & acceptance

- With `zoomable` omitted or `true`, all zoom gestures behave as today: mouse wheel, `+`/`-`/`=` keys,
  two-finger pinch, and brush-to-zoom change the **Focus domain**. {story:zoomLock}
- With `zoomable: false`, the mouse wheel is a no-op — it does not change the Focus domain in either
  direction. {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"wheel does not zoom when zoomable is false"}
- With `zoomable: false`, the `+`, `=`, and `-` keys no-op, but Arrow-key pan still moves the window.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"zoom keys no-op but arrow pan works when locked"}
- With `zoomable: false`, a two-finger pinch no-ops, while single-finger touch pan still works.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"pinch no-ops but one-finger pan works when locked"}
- With `zoomable: false`, a drag that would draw the brush rubber-band pans instead, for every
  `dragMode` and modifier combination — brush-to-zoom is a zoom gesture, so it is removed while the
  drag's pan effect is preserved:

  | `dragMode` | Modifier | `zoomable: true` (today) | `zoomable: false` |
  |---|---|---|---|
  | `'pan'` | none | Pan | Pan |
  | `'pan'` | Shift | Brush (zoom) | Pan |
  | `'brush'` | none | Brush (zoom) | Pan |
  | `'brush'` | Shift | Pan | Pan |

  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"brush drag pans when zoomable is false"}
- The lock is gesture-only: a programmatic `focusDomain` change still re-drives the visible window —
  zoom level included — and fires `onFocusDomainChange`, preserving the perform-and-fire model.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"programmatic focusDomain still zooms when locked"}
- Selection, tooltip, and collapse are unaffected by `zoomable`; only zoom gestures are gated.
  {test:packages/charts/src/chart_types/trace_chart/trace_chart.test.tsx#"selection and tooltip unaffected by zoomable"}

## Decisions

- [ADR 0007 — Controlled `focusDomain` is perform-and-fire](../0007-focus-domain-perform-and-fire.md): the lock gates user gestures, not the programmatic `focusDomain` window drive.
- [ADR 0004 — Self-managed RAF render loop & the zoom-eases / pan-1:1 interaction model](../0004-raf-render-loop-and-interaction-model.md): the gesture set this lock removes.
- [ADR 0021 — Touch interaction model](../0021-touch-interaction-model.md): pinch is zoom-only, so locking zoom removes the two-finger gesture while one-finger pan remains.

## Non-goals

- **Pan lock:** panning (drag / arrow keys / one-finger) is intentionally preserved; a locked chart
  is still navigable, so this spec never disables pan.
- **Zoom-direction asymmetry:** there is no zoom-out-only or zoom-in-only mode — a half-locked chart
  where one direction works is a confusing state, so `zoomable: false` fixes the zoom level entirely.
- **Fully-controlled window:** `zoomable` does not make `focusDomain` veto gestures; the
  gestures-ignored controlled mode was rejected by ADR 0007 and is out of scope here.
