# ADR 0035 — `spanDisplay: 'duration'` is a visual mode; self time stays segment-derived

**Status:** Accepted  
**Relates to:** [ADR 0003](./0003-self-time-as-active-segments.md) (self time = active segments, not full duration), [ADR 0011](./0011-segment-selection-model.md) (segment selection), [ADR 0006](./0006-color-group-accessor-function-only.md) (color groups)  
**Supersedes:** the "avoid duration bar" guidance in the `Total line` glossary entry of `CONTEXT.md` (a duration bar is now a first-class, opt-in display).

## Context

[ADR 0003](./0003-self-time-as-active-segments.md) draws every span as a thin **total line** over its
full `[start, end]` extent with 0..N solid **active segments** (self time) inside it, and rejects the
"active = full duration" look because it makes the whole self-time distinction invisible.

That decision is about the **meaning** of `activeSegments`. It is silent about consumers who
legitimately want the **"Kibana APM waterfall"** presentation — a single solid color-group bar per
span across the whole duration — as a *visual* choice, while keeping self time correct underneath.
Five stories (`12/20/22/24/25`) reached for that look by overwriting the derived segments:

```ts
fromOtlp(envelope).map((d) => ({ ...d, activeSegments: [{ start: d.start, end: d.end }] }));
```

This is a footgun. It does not just restyle the bar: it *redefines* `activeSegments`, so
`computeSelfTime`, the tooltip, element events, `TraceSelectionDetail`, and the screen-reader table
all then report `selfTime === duration` — a semantic bug ADR 0003 exists to prevent. The stories
shipped that bug purely to get a fuller-looking bar.

## Decision

Add a first-class visual prop `spanDisplay?: 'segments' | 'duration'` to `TraceSpec`
(default `'segments'`), threaded through `buildGeometry` → `TraceGeometry.spanDisplay` → the
Canvas2D renderer.

- **`'segments'` (default):** unchanged — total line + self-time-derived active-segment rects
  (ADR 0003).
- **`'duration'`:** the renderer draws one filled rect over the full `[start, end]` extent using the
  span's color-group fill (`span.color`, or the theme's active-segment color as fallback), and draws
  **neither** the thin total line **nor** the per-segment rects.

`spanDisplay` is *purely* a rendering branch in `canvas2d_renderer.ts`. It does **not** touch
normalization, `activeSegments`, or any derived quantity: `activeSegments` stay self-time-derived per
ADR 0003, so `selfTime` in the tooltip, element events, selection details, and the screen-reader
table are identical in both modes. Only the pixels change.

## Consequences

- The `activeSegments`-overwrite block is removed from stories `12/20/22/24/25`; they set
  `spanDisplay="duration"` instead, and their self-time reporting is now correct rather than
  silently equal to duration.
- Running spans (ADR 0023) keep their dashed provisional treatment in `'segments'` mode; in
  `'duration'` mode the filled bar honours the same clamped extent.
- `CONTEXT.md` gains a **Duration bar** glossary entry and the `Total line` / `Active segment`
  entries note they apply to the `'segments'` mode.
- No change to hit-testing or selection geometry: picking still resolves to `span` / `active` /
  `waiting` regions from the underlying segments regardless of how the bar is painted.

## Alternatives considered

- **Keep telling callers to overwrite `activeSegments`.** Rejected: it is the exact anti-pattern
  ADR 0003 forbids and corrupts every self-time-derived readout.
- **A theme flag instead of a spec prop.** Rejected: display mode is data-presentation intent that
  belongs with the other `TraceSpec` rendering props, not in the shared visual theme; a single trace
  may want a different treatment than the global theme default.
- **Draw the duration bar *and* keep the segments on top.** Rejected: two overlapping fills muddy
  the "solid bar" look consumers ask for; consumers wanting both already have the default
  `'segments'` mode (total line + segments).
