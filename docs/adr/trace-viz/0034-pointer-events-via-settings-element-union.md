# ADR 0034 — Trace pointer events flow through the `Settings` element-event union; `Trace` owns only controlled state

**Status:** Accepted  
**Relates to:** [ADR 0007](./0007-focus-domain-perform-and-fire.md) (controlled perform-and-fire), [ADR 0011](./0011-segment-selection-model.md) (segment selection: thin refs in, rich details out), [ADR 0029](./0029-trace-badge-rendering-architecture.md) (Span badges), [ADR 0030](./0030-trace-annotation-composition.md) (annotations: composition, geometry, and hit model)  
**Supersedes:** the per-feature `onBadgeOver/Out/Click` and `onAnnotationOver/Out/Click` props previously declared on `TraceSpec` (never released).

## Context

Before this decision the Trace chart grew a separate pointer-event handler family for each
interactive sub-element: `onElementOver/Out/Click` for spans (the library-wide `Settings` channel),
plus `onBadgeOver/Out/Click` and `onAnnotationOver/Out/Click` declared directly on `TraceSpec`. Each
family carried its own event shape and its own flattened bundle of span fields. This produced three
problems, all visible once the v1 feature set was complete and the stories were read end-to-end:

- **Two competing interaction channels.** Every other elastic-charts chart type (XY, partition,
  heatmap, wordcloud, metric, flame) reports pointer interaction through
  `Settings.onElementClick`/`onElementOver`/`onElementOut` as a discriminated element-event union.
  Trace uniquely split its pointer surface across `Settings` (spans) *and* `TraceSpec` (badges,
  annotations), so a consumer wiring "what did the user point at?" had to subscribe to three
  unrelated handler families and reconcile their orderings.
- **Ambiguous precedence and double-dispatch risk.** Badges sit on top of spans and annotations sit
  on top of both ([ADR 0029](./0029-trace-badge-rendering-architecture.md),
  [ADR 0030](./0030-trace-annotation-composition.md)). With independent handler
  families it was easy to emit both a badge `over` and a span `over` for a single pointer
  transition.
- **Duplicated payloads.** `TraceElementEvent`, the badge event, the annotation event, and
  `TraceSelectionDetail` each re-declared the same ~11 span fields.

`TraceSpec` is not yet consumed by any external caller, so a breaking reshape is cheap now and
expensive later.

## Decision

### 1. Pointer events flow through the shared `Settings` element-event union

Span, Span-badge, and annotation *pointer* interactions are all reported through the library-wide
`Settings.onElementOver` / `Settings.onElementOut` / `Settings.onElementClick`, as three new members
of the element-event discriminated union, tagged by `type`:

| `type` | Event | Fires for |
|---|---|---|
| `traceElementEvent` | `TraceElementEvent` | a span bar / segment |
| `traceBadgeEvent` | `TraceBadgeElementEvent` | a Span badge (Spec 27) |
| `traceAnnotationEvent` | `TraceAnnotationElementEvent` | a Trace annotation (Spec 29) |

Consumers discriminate with the exported type guards `isTraceElementEvent`,
`isTraceBadgeElementEvent`, and `isTraceAnnotationElementEvent`. `onElementOut` stays argument-less
(matching the rest of the library): the consumer tracks which element it last entered.

`settings.tsx` importing Trace types is consistent with the existing precedent there (`Cell` for
heatmap, `WordModel` for wordcloud).

### 2. `Trace` props own only controlled state + its `onChange` echo

`TraceSpec` keeps exclusively the *controlled-value + onChange* families that have no element-event
analogue and follow the perform-and-fire model ([ADR 0007](./0007-focus-domain-perform-and-fire.md),
[ADR 0011](./0011-segment-selection-model.md)): `selection`/`onSelectionChange`,
`collapsedSpanIds`/`onCollapseChange`, `focusDomain`/`onFocusDomainChange`, and
`onDataDiagnosticsChange`. The removed `onBadge*` / `onAnnotation*` props do not return.

### 3. Interactivity is gated on `onElementClick`

A badge or annotation becomes interactive — pointer cursor on hover, keyboard-activatable
`<button>` in the screen-reader surface — when, and only when, the consumer supplies a real
`Settings.onElementClick` handler. The connected component maps an absent handler to a stable
module-level no-op and identity-compares against it, so unrelated redux churn never flips
interactivity and the gate needs no extra prop.

### 4. One nested `TraceSpanInfo`, `segmentIndex` optional

The duplicated span-field bundles collapse into a single exported `TraceSpanInfo`, nested as
`event.span` on every trace element/badge/annotation event and as `detail.span` on
`TraceSelectionDetail` (see [ADR 0011](./0011-segment-selection-model.md), amended). `segmentIndex`
is optional across `TraceSegmentRef` and `TraceSelectionDetail`: it is present only for
`region: 'active' | 'waiting'` and absent for `region: 'span'`, removing the previous `-1` sentinel.

## Consequences

- A consumer subscribes to one channel (`Settings.onElementClick` + `onElementOver`/`onElementOut`)
  and branches on `type`, exactly as for every other chart.
- Precedence is resolved once, before any event is emitted: annotation ▸ badge ▸ span. The owner's
  `over` is emitted only after the lower-priority hovers have emitted their single `out`, so one
  pointer transition never produces an over/stray-out pair.
- Screen-reader keyboard activation for badges and annotations dispatches the identical
  `traceBadgeEvent` / `traceAnnotationEvent` through `onElementClick` (coordinate-free), so pointer
  and keyboard report one shape.
- Breaking for the (currently zero) external callers; internal stories and tests move to the
  `Settings` handlers.

## Alternatives considered

- **Keep the per-feature handlers on `TraceSpec`.** Rejected: perpetuates two interaction channels
  and the double-dispatch hazard, and diverges from every other chart type for no benefit.
- **A Trace-only combined `onTraceElement` handler.** Rejected: still a second channel a consumer
  must discover; the existing `Settings` union already exists for exactly this purpose.
- **Keep flattened per-event span fields.** Rejected: four copies of the same 11 fields; a single
  nested `TraceSpanInfo` is learned once and reused everywhere.
