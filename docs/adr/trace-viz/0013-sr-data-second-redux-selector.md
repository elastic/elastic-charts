# 0013 — Screen-reader span data re-derived in a second redux selector

**Status:** Accepted (Spec 12)

## Context

`ScreenReaderSummary` and `ScreenReaderTraceTable` are redux-`connect`ed components with no props.
They follow the same pattern used by partition and goal charts: they read their data from a redux
selector override registered in the chart type's `chart_selectors.ts`, so they can be dropped into
`render()` without threading any component-local data through props.

The trace chart's normalized spans (`NormalizedSpan[]`) and domain are *not* stored in redux state.
They are derived in the component's memoized `getPipeline()` — a `(spec, vizColors) → { spans, domain }`
cache held as an instance field — because normalization is a pre-render computation owned by the
component's RAF lifecycle (ADR 0004 Decision 1).

## Decision

A second memoized selector (`getTraceTableRowsSelector`, via `createCustomCachedSelector`) re-derives
normalized spans from the redux store. It reads the `TraceSpec` from `getSpecsFromStore` and the theme
`vizColors`, then calls `normalize()` + `resolveActive()` — the same functions used by `getPipeline()`.

The selector is registered as an override in `chart_selectors.ts` alongside `getScreenReaderData`.

## Why this is a second call site, not duplicated logic

The selector reuses the existing `normalize` and `resolveActive` functions verbatim. No new
normalization algorithm exists. The selector is keyed on `(spec, vizColors)` — the same key as
`getPipeline()` — so both caches hold the same result after the first call in each lifecycle.

The alternative of reading from `lastGeom.spans` (the frame-time geometry object) was rejected because
`lastGeom` is a component instance field, inaccessible to redux selectors.

## Considered alternatives

**Put normalized spans in redux state** — rejected: would require dispatching an action on every data
change and wiring a reducer, making the trace chart stateful in redux in a way no other self-managed
canvas chart (Flame, Timeslip) is. Out of scope for Spec 12.

**Pass spans as props to the SR components** — rejected: `ScreenReaderSummary` and `ScreenReaderTraceTable`
are self-connected by design (mirroring partition/goal/flame). Prop-threading would require the parent
component to know about the SR components' data needs, coupling the two.

**Share the single `getPipeline` cache** — not possible: the redux selector runs before the component
instance exists and has no access to instance fields.

## Consequences

Two cache entries hold the same normalized spans after the first call: `getPipeline()` (instance field,
pre-render) and `getTraceTableRowsSelector` (redux, pre-connect). In practice the overhead is one
extra call on mount; subsequent renders hit the memoized result. The two caches are independently
evicted (pipeline cache: on component unmount; selector cache: on store GC), but this is harmless —
they are both derived from the same source inputs.

Spec 16 (`focusDomain` control) and Spec 17 (responsive labels) are not affected.
