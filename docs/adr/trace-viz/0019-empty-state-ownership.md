# ADR 0019 — Empty-state ownership: `no-data` delegates to the library overlay, `trace-not-found` is a canvas message

**Status:** Accepted; zero-visible-lane semantics amended by ADR 0028 / Spec 27
**Implements:** [Spec 18 — Empty-state distinction](./specs/spec-18-empty-state.md)

## Context

The Trace chart has three distinct zero-lane conditions:

1. **`no-data`** — `data` prop is empty; no spans were supplied at all.
2. **`trace-not-found`** — spans were supplied but the specified `traceId` matched none of them.
3. **Invalid or unrenderable data** — spans were selected, but finite filtering or elected-root
   recovery leaves no visible lanes (for example all timestamps are non-finite, a rootless cycle, or
   chart-wide duplicate-ID invalidation).

Before this ADR, both cases short-circuited to the library DOM `NoResults` overlay ("No data to
display") via `isChartEmpty`. This produced identical UI for two semantically different situations,
and it unmounted the trace canvas in both cases — removing the time bar and axis even when valid span
data was present.

There were three candidate ownership models:

- **(a) Canvas-owns-both** — draw a centered message on canvas for both cases; don't use the library
  overlay at all.
- **(b) DOM-overlay-for-both** — keep `isChartEmpty` returning `true` for both cases; show the library
  overlay in both (pre-ADR behavior).
- **(c) Hybrid** — `no-data` → library overlay; `trace-not-found` → canvas message.

## Decision 1: Hybrid ownership

`no-data` keeps the library DOM `NoResults` overlay. `isChartEmpty` now returns `true` only when
`data.length === 0` (or no spec is registered); the `traceId` branch is removed. When the overlay
fires, the trace canvas does not mount.

`trace-not-found` mounts the chart and renders the full time-bar/axis machinery with an empty plot
and a centered message on the canvas.

Invalid or unrenderable data also mounts the chart and retains the time bar, but the plot remains
blank with no centered message. It is neither `no-data` nor `trace-not-found`: malformed-data stages
emit bounded developer warnings, and the application-facing diagnostics/presentation seam is deferred
to the dedicated follow-up from Spec 27.

**Why hybrid:**
- The library overlay is exactly what `no-data` should show: a consumer-overridable "no data"
  message consistent with every other chart type. Fighting it for the `no-data` case (option a)
  would produce a bespoke experience that bypasses `Settings.noResults`.
- `trace-not-found` is an *active* state — the user asked for a specific trace and the data doesn't
  contain it. The time bar and axis provide important context (the full span dataset's extent). Hiding
  them via the overlay (option b) removes that context and obscures the distinction from plain no-data.
- Hybrid matches the pattern sibling canvas charts use: mount the chart shell when there is data to
  reason about; delegate to the library overlay only when there is no data at all.

**Rejected:**
- (a) Canvas-owns-both — bypasses `Settings.noResults`, loses the library's consistent empty-state
  behaviour for no-data.
- (b) DOM-overlay-for-both — identical UI for different semantics; unmounts the canvas and time bar
  when a trace filter merely matched nothing, discarding potentially useful temporal context.

## Decision 2: Customizable canvas message via `TraceSpec.traceNotFoundMessage?: string`

The `trace-not-found` message is a plain **string**, customizable via the `traceNotFoundMessage` prop
on `TraceSpec`. The default is `No spans found for trace "<traceId>"`.

**Why string, not ReactNode:**
The message is drawn directly on the `<canvas>` element by `renderText()`. React cannot render into
a canvas; ReactNode would be meaningless here. Consumers who need a richly-styled DOM overlay can
position one externally.

**Why not a separate prop/component:**
A plain optional string prop is the simplest possible extension. It covers the common override case
(custom wording); power users who want icons or rich layout own that responsibility via DOM overlay.

## Decision 3: `NormalizeResult.emptyReason` carries only `'trace-not-found' | undefined`

The `no-data` case is wholly owned by `isChartEmpty` / the library overlay and never needs to surface
inside the normalize pipeline. Only the `trace-not-found` case needs a signal from the data layer to
the UI layer. Invalid or unrenderable selected data deliberately leaves `emptyReason` undefined; it
does not acquire a user-facing canvas message.

## Decision 4: Glossary-precise trigger

`emptyReason = 'trace-not-found'` is keyed off the result of `selectTrace()` — the traceId filter
match — not the final post-`dropNonFinite` span count. Concretely:

```
traceNotFound = traceId !== undefined && flat.length > 0 && selected.length === 0
```

This means a trace whose spans all have non-finite timestamps is **not** labeled `trace-not-found`;
it is a data-quality problem, handled silently (blank plot + time bar, no message) by `dropNonFinite`.
Only "the traceId filter matched zero spans" produces the message.

## Consequences

- `isChartEmpty` in `chart_selectors.ts` no longer mirrors the `traceId` filter.
- `NormalizeResult` gains an optional `emptyReason?: 'trace-not-found'` field.
- `TraceGeometry` gains `emptyMessage: string | null`; `buildGeometry` accepts it as its last
  optional parameter (default `null`), keeping existing callers unmodified.
- The canvas2d renderer draws the message after `drawTimeBar` when `spans.length === 0` and
  `emptyMessage` is non-null; otherwise it returns immediately as before.
- A non-empty selected dataset that yields zero visible lanes follows that no-message renderer path;
  developer warnings explain malformed-data invalidation until the diagnostics follow-up exists.
- `frame()` in `trace_chart.tsx` composes the string from `emptyReason` + `traceNotFoundMessage` and
  passes it to `buildGeometry` each frame. No new pipeline cache key is needed — `traceNotFoundMessage`
  only affects the rendered string, not any computed layout.
- `00_empty.story.tsx` is updated to demonstrate both variants via a `select` knob.
