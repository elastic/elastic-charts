# ADR 0023 — Running-span model: optional end, domain-max provisional edge, dashed visual

**Status:** Accepted (Spec 30; visible-domain input amended by Spec 26)

## Context

A distributed span that has started but not yet finished has no end timestamp. Before this ADR,
`TraceDatum.end` was **required** (`number`, not optional), and `dropNonFinite` dropped any span with
a non-finite end. No running span could be expressed or rendered. Additionally, the chart had — and
deliberately maintained (ADR 0004) — **no concept of "now"**: no wall-clock read, no idle RAF
animation, no live-updating bar.

The OpenTelemetry protocol signals a running span by setting `endTimeUnixNano = 0`. Previously,
`fromOtlp` passed this through as `nanoToMs(0) = 0` (a valid Unix epoch timestamp), so a running
span would render as ending at the epoch — visually broken but silent.

## Decision 1 — `end?: number | null` signals running; no separate `running` prop

`TraceDatum.end` becomes `end?: number | null`. Omitting the field or passing `null` means the span is
running. The `running` state is derived from this at parse time and carried as `NormalizedSpan.running`.

**Alternative considered — `running?: boolean` alongside `end`:**
An explicit boolean is clearer at the call site (`{ running: true }`) but introduces an invalid-state
combo (`running: true` with a real `end`) and a redundant field the type system cannot enforce away.
The `end?: number | null` design is self-consistent: the absence of a real end *is* the definition
of running.

**`end === 0` is not running.** The check is `datum.end == null` (strict null + undefined equality).
`0` is a valid Unix-epoch end timestamp (though unusual). The `fromOtlp` adapter handles the OTel
semantic-zero `endTimeUnixNano` sentinel explicitly across the adapter's supported `string |
number | bigint` input representations (Decision 4).

## Decision 2 — Provisional right edge = latest known finite boundary (domain max); no wall clock

A running span renders from its `start` to the **trace's domain max** — the latest finite boundary in
the selected visible dataset. The candidates are completed-span ends, running-span starts, and ends
of explicitly supplied active segments on running spans. Explicit active segments are confirmed
execution and must not be clipped by a provisional boundary derived only from siblings. A running
span with no explicit activity contributes only its start, so it cannot extend the domain beyond
what has been observed. The domain max is computed in `project()` and the running span's `end` is
synthesized there to `max(domainMax, span.start)`.

Spec 26 recovery runs before `project()`. Non-elected, unreachable, or invalid trace groups therefore
do not extend the provisional edge of surviving running spans; its diagnostics/warning contract
reports that omission separately.

This is deterministic and repeatable: given the same `TraceDatum[]` the chart always produces the
same output. The bar does not grow between renders.

**Alternative considered — consumer-supplied `now` prop:**
A `<TraceSpec now={Date.now()} />` prop would let the caller drive the running bar's right edge and
advance it by re-rendering. More accurate (bar extends to wall-clock "now"), but:
- Adds a new public API field.
- Requires the caller to drive updates (e.g. `setInterval`).
- The chart renders identically with or without the prop for static data — two modes to maintain.

Rejected in favour of the simpler, clock-free model.

**Alternative considered — `Date.now()` live bar:**
Read `Date.now()` in each RAF frame and animate the bar. Maximally live, but:
- Introduces a wall-clock dependency the chart has never had and that ADR 0004 explicitly avoided
  ("no idle RAF churn"). The RAF loop self-terminates after each interaction settles; a live bar would
  require the loop to run continuously for any dataset containing a running span.
- Non-deterministic: the same data produces different output depending on when the chart renders.
- No test can assert a specific bar width.

Rejected — both the wall-clock dependency and the continuous RAF churn violate ADR 0004's invariants.

**Edge cases:**
- All spans running (no completed end): domain max = `max(starts, explicit active-segment ends)`.
  Each running bar extends from its start to that max. The latest-starting span is a zero-width
  marker only when no later confirmed activity extends the boundary.
- Running span starts after all finite ends: `max(domainMax, span.start) = span.start` →
  zero-width marker at the right edge.

## Decision 3 — Dashed total line via `setLineDash`; new `runningLineDash` theme token

A running span's total-duration line is drawn with a CSS-style dash pattern using the existing
`renderMultiLine` primitive's `Stroke.dash` field. That primitive calls
`ctx.setLineDash(style.runningLineDash)` inside its saved canvas context, so completed spans are
unaffected when the context is restored.

This is the **first use** of `ctx.setLineDash` in the trace chart renderer. A new `runningLineDash:
number[]` token (default `[4, 3]` — 4 px dash, 3 px gap) is added to `TraceStyle` and the six concrete
theme values. The existing `Theme.trace` type and `buildTraceStyle` passthrough need no mapping change.

**Active segments inside a running span remain solid** — they represent confirmed execution and must
not be dashed.

**No right end-cap for the running span** — the open dashed line already signals an uncertain end.

**Visible zero-width marker:** Canvas does not paint a zero-length line with its default butt cap.
When a running span's projected `start === end`, draw a small point marker at the start using the
total-line color and thickness. This is a known timestamp with no extent: it does not alter the
domain or imply duration. Reuse the existing rectangle primitive rather than adding a new canvas
shape abstraction, and clamp the marker within the plot at either edge. Give it a bounded
pixel-space hit target whose horizontal width equals the lane height. This avoids both exact-pixel
picking in a normal domain and the existing zero-domain inversion fallback treating the whole lane
as a hit. The hit resolves to a Provisional region and therefore selects the whole span. When that
whole-span selection is active, draw a compact selection outline around the point marker using the
marker thickness plus the existing selection-stroke width; do not outline the larger hit target.

**Alternatives considered:**

- **Fade / gradient** (opacity fades toward the right edge): visually compelling but requires
  `CanvasGradient` setup per span, and canvas gradients are specified in absolute pixel coordinates —
  they must be recreated whenever the focus domain or DPR changes. Heavier than a `setLineDash` call.
- **Arrow glyph (▶ at the right edge)**: compact and "continues" read, but requires a new draw
  primitive and is invisible when the running span's provisional end is scrolled off-screen. Dashed is
  legible at any zoom level regardless of whether the right edge is visible.
- **Opacity reduction**: a dimmed solid bar. Rejected — a completed span that is waiting (inactive)
  for most of its extent looks similar, causing ambiguity.

## Decision 4 — No self-time fabrication for running spans

`resolveActive` derives a span's active segments as its `[start, end]` interval minus the union of
its children's intervals (self-time — ADR 0003). For a running span, `end` is synthesized to the
domain max, not a real measurement. Deriving self-time to this synthetic end would paint the running
span as *actively executing* up to an invented "now" — a claim the data cannot support.

**Decision:** `resolveActive` skips self-time derivation for running spans. A running span's
`activeSegments` are whatever the caller supplied explicitly (or empty if nothing was supplied).

Callers who know a running span's partial activity (e.g. a span that has completed several phases and
is still in the last one) can supply `activeSegments` explicitly; those segments pass through
unchanged as they do for completed spans.

## Decision 5 — Relax `dropNonFinite` while preserving the NaN/±Infinity poison guard

The current `dropNonFinite` test:
```ts
if (!Number.isFinite(span.start) || !Number.isFinite(span.end)) return false;
```

For running spans, `span.end` starts as `null` (or `NaN` depending on the intermediate sentinel
choice). It must not be dropped here. The relaxed condition:
```ts
if (!Number.isFinite(span.start)) return false;
if (!span.running && !Number.isFinite(span.end)) return false;
```

This preserves the guard that ADR 0001 / the OTel-adapter comment depended on: a `nanoToMs` parse
failure still yields `NaN`, which still triggers the drop. Only a **running** span with a null/NaN
placeholder `end` is spared. Completed spans with any non-finite end still drop.

**OTel adapter fix:** a semantic-zero `endTimeUnixNano` is the OTel sentinel for a running span. The
adapter accepts timestamps as `string | number | bigint`, so the sentinel may arrive as `'0'`, `0`,
or `0n`. Previously `nanoToMs` converted each representation to `0` (epoch time), which was passed
through — finite, not dropped, but semantically wrong. Convert once, then test the converted value:
```ts
const end = nanoToMs(span.endTimeUnixNano);
// ...
end: end === 0 ? null : end,
```

A non-zero `endTimeUnixNano` continues to use the converted value; the BigInt / string parse-error →
NaN path is unchanged.

## Decision 6 — Tooltip and SR show "running" state with no duration number

`end − start` for a running span yields `provisionalEnd − start` — the time from the span's start
to the latest observed activity elsewhere in the trace. This number:
- Is not a real duration (it doesn't measure how long the span took).
- Changes as the domain grows when new spans are added to the dataset.
- Can be zero (for a zero-width marker) or confusingly large (if another span is much later).

Showing it as a duration would mislead users. The tooltip and screen-reader surface instead show
**"running"** with no numeric value. In the tooltip, a running span replaces the **Duration** row
with **Status: Running**. The existing **State** row remains reserved for the hovered Active /
Waiting / empty region on completed spans and the Active / Provisional region on running spans.
Known durations for explicitly supplied active segments remain visible. Screen-reader table cells
and keyboard / `scrollToSpan` aria-live announcements likewise say "running" rather than formatting
the provisional extent.

## Decision 7 — Unmeasured running extent is a Provisional region, not Waiting

For completed spans, the complement of active segments within `[start, end]` is Waiting. A running
span has no real end: its synthesized end is only a rendering boundary. Treating the complement of
explicit active segments up to that boundary as Waiting would fabricate both an execution state and
a selectable waiting-segment duration.

The uncovered part of a running span's synthesized extent is therefore a **Provisional region**. It
makes no claim that the span was active or waiting. The tooltip shows **State: Provisional** with no
segment duration or offset. Selecting that region selects the whole span (`region: 'span'`) because
there is no measured segment with stable boundaries to identify. Explicit active segments remain
individually hoverable and selectable. A zero-width running marker uses the same Provisional-region
semantics within its bounded pixel hit target and receives a marker-sized outline when selected.
Collapsed-lane semantics take precedence: a collapsed running parent retains the whole-span region
and **State: Collapsed**, alongside **Status: Running**, because its rolled-up sub-regions are
intentionally not individually addressable.

## Consequences

- `TraceDatum.end` is now a breaking change in the TypeScript type (`number` → `number | null`). Any
  caller that currently hard-assigns `end: someNumber` is unaffected; callers that read and compare
  `datum.end` must handle `null`.
- The chart gains no wall-clock dependency. The RAF loop self-terminates identically to today for
  datasets that contain running spans.
- `fromOtlp` now correctly maps OTel running spans (semantic-zero `endTimeUnixNano`, whether
  represented as `0`, `'0'`, or `0n`) to `end: null`.
- The `duration` field on `TraceSelectionDetail` and `TraceElementEvent` emits `null` for running
  spans — not `provisionalEnd − start`. Their normalized `end` remains numeric for geometry-aware
  consumers but is documented as a provisional domain boundary, not a completion timestamp.
- The `CONTEXT.md` glossary defines **Running span** and **Provisional region**, and the **Total line**
  entry notes the dashed variant.
