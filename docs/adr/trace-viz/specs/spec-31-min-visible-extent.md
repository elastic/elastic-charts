---
status: provisional
domain: trace-viz
owners: []
supersedes: []
---

# Spec 31 — Configurable minimum visible extent

> **Altitude: DURABLE / product.**
> No file paths, no line numbers, no internal function names.
> Public API symbol names (props, exported types, exported functions) are allowed.

## Summary

A Trace chart may **coarsen its finest zoom-in window** via `minVisibleExtentMs`. By default the
**Minimum visible extent** is scale-dependent (1 ms in `'time'`, 1 ns in `'linear'`); a consumer can
raise that floor — for example capping `'linear'` zoom-in at a 1 ms window instead of 1 ns — so the
chart never resolves finer than a chosen granularity. The override is **coarsen-only**: it can only
raise the floor, never lower it below the scale default, so the documented precision guarantees hold.

## Public API

| Symbol | Kind | Description |
|---|---|---|
| `TraceSpec.minVisibleExtentMs` | prop | `number` (ms). Raises the finest visible zoom-in window above the scale default. Omitted, or any value not finer-coarsening, leaves the scale default (1 ms `'time'`, 1 ns `'linear'`). |

## Behavior & acceptance

- With the prop omitted, the finest zoom-in window is the scale default: 1 ms in `'time'`, 1 ns in
  `'linear'`. {story:minVisibleExtent}
- A value coarser than the scale default raises the floor: `minVisibleExtentMs: 1` stops `'linear'`
  zoom-in at a 1 ms window rather than the default 1 ns.
  {test:packages/charts/src/chart_types/trace_chart/render/interaction.test.ts#"override coarsens the linear floor to 1 ms"}
- The override is coarsen-only: a value finer than the scale default is clamped to the default, so the
  effective floor is `max(override, scale default)` and sub-precision windows are never reachable.
  {test:packages/charts/src/chart_types/trace_chart/render/interaction.test.ts#"finer override clamps to scale default"}
- Invalid values (`0`, negative, `NaN`, or non-finite) fall back to the scale default.
  {test:packages/charts/src/chart_types/trace_chart/render/interaction.test.ts#"invalid override falls back to scale default"}
- The resolved floor applies uniformly to every zoom-in path — mouse wheel, `+` key, pinch, and brush
  commit — as well as the `focusDomain` clamp, so no single entry point can breach it.
  {test:packages/charts/src/chart_types/trace_chart/render/interaction.test.ts#"override applies to all zoom-in entry points"}

## Decisions

- [ADR 0010 — Nanosecond precision for the linear x-scale](../0010-linear-scale-nanosecond-precision.md): the 1 ns `'linear'` floor this override coarsens; the `'time'` 1 ms floor is a float64 precision limit at epoch magnitude (see the **Minimum visible extent** glossary entry).

## Non-goals

- **Finer-than-default floor:** the override cannot lower the floor below the scale default — sub-ms
  windows in `'time'` exceed float64 precision at epoch magnitude, and 1 ns is already the finest
  representable window at the re-zeroed `'linear'` base.
- **Coarsest-extent / max zoom-out cap:** this spec constrains zoom-in only; zoom-out always settles
  at fit-all, so a maximum-window bound is out of scope.
- **Per-axis tick-unit enum:** the time-bar unit label switching (ms / µs / ns) stays automatic; this
  prop bounds the zoom window, not the label unit.
