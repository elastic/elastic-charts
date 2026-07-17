# Spec 22 — Connections

**Goal:** draw a directional connector arrow from a source segment endpoint (initiator) to a target
segment endpoint (initiated) — possibly in a different lane — expressing the Chrome DevTools
"Initiated by" relationship: segment A triggered segment B. Presence of the `connections` prop is the
on/off toggle.

See [ADR 0016](../0016-connections-explicit-prop.md) for the rationale: why explicit prop (not OTel
`links`), why `TraceSegmentRef` endpoints, and why v1 is visual-only.

**Depends on:**
- [Spec 5](./spec-5-canvas2d-renderer.md) — `draw(ctx, geom, style)` contract, `renderMultiLine`
  primitive, `withContext` block.
- [Spec 12](./spec-12-accessibility.md) — `laneHeight` in geometry, lane-index arithmetic,
  `firstLane`/`lastLane` culling pattern.
- [Spec 13](./spec-13-segment-selection.md) — `TraceSegmentRef` type; `waitingSegments()` export
  from `data/self_time.ts`; `buildGeometry` extra-parameter + resolved-field pattern;
  `spanId→laneIndex` map.

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — export `TraceConnection`; add
  `connections?: TraceConnection[]` to `TraceSpec`.
- `packages/charts/src/chart_types/trace_chart/render/types.ts` — add `connectionColor: Color` and
  `connectionThickness: number` to `TraceStyle`; add
  `resolvedConnections: ReadonlyArray<{ from: { laneIndex: number; tMs: number }; to: { laneIndex: number; tMs: number } }>`
  to `TraceGeometry` (keeps the frozen contract — ADR 0001).
- `packages/charts/src/chart_types/trace_chart/render/geometry.ts` — accept `connections` parameter;
  resolve endpoints via `spanId→laneIndex` + region→interval logic; drop unresolvable connections;
  populate `geom.resolvedConnections`.
- `packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts` — add a connections draw
  pass after the critical-path pass, inside `ctx.clip()` to the plot rect (z-order: fills →
  critical-path → **connections** → selection outlines). No per-endpoint lane culling — the clip
  handles connections whose endpoints are both off-screen but whose line crosses the visible plot.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — read `traceSpec?.connections`;
  pass into `buildGeometry()` in `frame()`. Pure render — no new instance state, no event handlers.
  **No pipeline-cache key change needed** (connections are resolved in `buildGeometry`, not the
  normalize pipeline, because they anchor to already-projected `NormalizedSpan` data and need no
  re-zero).
- `packages/charts/src/utils/themes/theme.ts` and the six theme files
  (`light_theme.ts`, `dark_theme.ts`, `amsterdam_light_theme.ts`, `amsterdam_dark_theme.ts`,
  `legacy_light_theme.ts`, `legacy_dark_theme.ts`) — add `connectionColor` and
  `connectionThickness` to the `trace:` block.
- `storybook/stories/trace/20_connections.story.tsx` — new story; register in `trace.stories.tsx`.

## Contract

### Public types (`trace_api.ts`)

```ts
/**
 * A directed causal edge drawn between two segment endpoints, expressing the Chrome DevTools
 * "Initiated by" relationship: `from` (initiator) triggered `to` (initiated).
 *
 * Each endpoint is a {@link TraceSegmentRef} — the same thin identity ref used for selection. The
 * `from` anchor is the **end** of the referenced region; the `to` anchor is the **start**.
 *
 * Distinct from the structural {@link TraceDatum.parentId} nesting: a connection is a causal edge
 * that may cross lanes arbitrarily and is not implied by the span tree.
 * @public
 */
export interface TraceConnection {
  /** Initiator endpoint — arrow originates from the END of this region. */
  from: TraceSegmentRef;
  /** Initiated endpoint — arrow points to the START of this region. */
  to: TraceSegmentRef;
}
```

New field on `TraceSpec`:
```ts
/**
 * Consumer-supplied directed causal edges between segment endpoints ("Initiated by" connectors).
 * Each arrow is drawn from the end of `from`'s region to the start of `to`'s region. When omitted
 * or empty, nothing is drawn.
 * @public
 */
connections?: TraceConnection[];
```

### Endpoint resolution

Resolving a `TraceSegmentRef` to `{ laneIndex, tMs }`:
1. Look up `spanId` in the `spanId→laneIndex` map (already built in `buildGeometry`). If not found:
   drop the whole connection.
2. Look up `spans[laneIndex]`. Derive the anchor time from `region`:
   - `'span'` → `from`: `span.end`; `to`: `span.start`.
   - `'active'` → `span.activeSegments[segmentIndex]`; if out of range: drop the connection.
     `from`: `segment.end`; `to`: `segment.start`.
   - `'waiting'` → `waitingSegments(span)[segmentIndex]`; if out of range: drop the connection.
     `from`: `segment.end`; `to`: `segment.start`.
3. Return `{ laneIndex, tMs }`.

**No re-zero.** Connections resolve against the already-projected `NormalizedSpan` (post-pipeline)
data. The `scale(tMs)` function maps the projected time to a pixel x-coordinate.

**Temporal ordering is not enforced.** A connection where `from.tMs > to.tMs` is drawn as-is; the
orthogonal elbow handles inverted geometry without special-casing.

### Geometry extension (`render/types.ts` + `geometry.ts`)

New `TraceStyle` fields:
```ts
/** Stroke color for connection arrows. */
connectionColor: Color;
/** Stroke width in px for connection arrows. */
connectionThickness: number;
```

Internal arrowhead size: `CONNECTION_ARROWHEAD_SIZE = 6` (px) — a renderer constant in
`canvas2d_renderer.ts`, not a theme field (not expected to vary per theme in v1).

New `TraceGeometry` field:
```ts
/**
 * Resolved connection endpoints. Each entry carries the lane index and anchor time (ms, projected)
 * for `from` (initiator end) and `to` (initiated start). Connections whose endpoints could not be
 * resolved are dropped. Empty array when `connections` is absent or empty.
 */
resolvedConnections: ReadonlyArray<{
  from: { laneIndex: number; tMs: number };
  to: { laneIndex: number; tMs: number };
}>;
```

`buildGeometry()` gains a `connections: TraceConnection[]` parameter (default `[]`).

### Render pass (`canvas2d_renderer.ts`)

After the critical-path pass, inside a `ctx.save()` / `ctx.clip(plotRect)` / `ctx.restore()` block:

```
const connectionRgba = colorToRgba(style.connectionColor)  // resolve once per frame
for each { from, to } of geom.resolvedConnections:
  fromX = scale(from.tMs)   // NOT clamped — clip handles off-screen
  fromY = laneTop(from.laneIndex) + laneHeight / 2
  toX   = scale(to.tMs)
  toY   = laneTop(to.laneIndex) + laneHeight / 2
  midX  = (fromX + toX) / 2
  renderMultiLine(ctx,
    [{ x1: fromX, y1: fromY, x2: midX, y2: fromY },    // horizontal leg from initiator
     { x1: midX, y1: fromY, x2: midX, y2: toY },       // vertical bridge
     { x1: midX, y1: toY,   x2: toX, y2: toY }],       // horizontal leg to initiated
    { strokeWidth: style.connectionThickness, stroke: connectionRgba })
  // Small filled-triangle arrowhead at (toX, toY):
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - CONNECTION_ARROWHEAD_SIZE, toY - CONNECTION_ARROWHEAD_SIZE / 2)
  ctx.lineTo(toX - CONNECTION_ARROWHEAD_SIZE, toY + CONNECTION_ARROWHEAD_SIZE / 2)
  ctx.closePath()
  ctx.fillStyle = connectionRgba
  ctx.fill()
```

`laneTop(index) = plot.top + index * laneHeight - scrollOffset` (mirror of the per-lane math at
[canvas2d_renderer.ts:94](../../../packages/charts/src/chart_types/trace_chart/render/canvas2d_renderer.ts#L94)).

**No per-endpoint culling.** The `ctx.clip(plotRect)` handles connections whose both endpoints are
outside the scroll viewport — the crossing portion still renders. The connection array is
consumer-bounded and small; iterating all of it is cheaper than the clipping bookkeeping that
per-endpoint culling would require.

## Steps

1. Add `TraceConnection` to `trace_api.ts`; add `connections` field to `TraceSpec`.
2. Add `connectionColor` and `connectionThickness` to `TraceStyle`; set defaults in all six theme
   files and `theme.ts`.
3. Add `resolvedConnections` to `TraceGeometry`; extend `buildGeometry()` to accept `connections`,
   resolve endpoints, and populate the field.
4. Add the connections draw pass (with `ctx.clip()`) to `draw()` in `canvas2d_renderer.ts`.
5. Wire in `trace_chart.tsx`: pass `traceSpec?.connections ?? []` into `buildGeometry()`.
6. Author `20_connections.story.tsx`; register in `trace.stories.tsx`.

## Storybook

`storybook/stories/trace/20_connections.story.tsx`:
- Reuse the `11_chrome_network` fixture (12-span HTTP request waterfall: document, scripts,
  stylesheets, images, XHR).
- Add `connections` wiring the "initiator" chain: e.g. the `app` script (end of its active segment)
  → the `api-user` XHR (start of its active segment), and `main-css` → `inter` font. This mirrors
  the Chrome screenshot showing `vendors~main.iframe.bundle.js` initiated by a span two lanes below.
- `boolean('Show connections', true)` knob conditionally supplies the prop vs. `undefined`.
- Brief comment in the fixture explaining which `TraceSegmentRef` fields to use (`region: 'active'`,
  `segmentIndex: 0`) for first-active-segment endpoints.

## Tests

- Endpoint resolution — `'span'` region: `from` anchor = `span.end`, `to` anchor = `span.start`.
- Endpoint resolution — `'active'` region: anchor = `span.activeSegments[i].end` (from) /
  `.start` (to); out-of-range `segmentIndex` drops the connection.
- Endpoint resolution — `'waiting'` region: anchor = `waitingSegments(span)[i].end` (from) /
  `.start` (to); out-of-range drops the connection.
- Unknown `spanId`: connection dropped (neither endpoint needs to be valid; if either fails, drop).
- Empty / absent `connections`: `resolvedConnections = []`, no draw calls.
- Renderer smoke — same-lane connection (from and to in the same lane): orthogonal elbow degenerates
  to a horizontal line (fromY === toY); arrowhead drawn at correct x.
- Renderer smoke — cross-lane connection: three `renderMultiLine` segments drawn at the correct
  coordinates.
- Renderer smoke — both endpoints off-screen (scrolled out): connection still draws (clip handles
  it); no `renderMultiLine` calls without the clip path.
- Arrowhead: `ctx.fill` called at `(toX, toY)`.
- `ctx.clip()` is applied before the connections pass and removed (via `ctx.restore()`) after it.

## Out of scope (named follow-up)

- Screen-reader announcement of "Initiated by …" relationships (e.g. augment the SR span table from
  ADR 0013 with outbound/inbound connection rows).
- Tooltip / label on hover of a connection line.
- Highlighting a span's incoming/outgoing connections when a segment is selected (Spec 13 integration).
- A `label` and per-connection `color` field on `TraceConnection`.
- OTel-`links`-derived connections in `fromOtlp` (span-to-span, not segment-precise; deferred per
  ADR 0016).

## Review (`/review-claudio`)

- Verify `ctx.clip()` is applied to the **plot rect** (not the full canvas), so connectors never
  paint into the gutter (`x < plot.left`) or time bar (`y < plot.top`).
- Verify `ctx.save()` / `ctx.restore()` wraps the entire connections pass (not just the clip), so the
  clipping state doesn't leak into the selection-outline pass.
- Verify `colorToRgba(style.connectionColor)` is resolved **once per frame** (not per connection),
  consistent with the `segFillCache` pattern for active segments.
- Verify endpoint resolution calls `waitingSegments(span)` consistently with the Spec 13 selection
  pass — both must produce the same segment list for the same span.
- Verify connections with both endpoints in the same lane (same `laneIndex`) render a horizontal
  line (fromY === toY → the vertical segment has zero height and the two horizontal legs are
  collinear). Confirm no degenerate `renderMultiLine` artefact.
- Verify `resolvedConnections` is not rebuilt on every rAF frame when `connections` prop hasn't
  changed (it is passed into `buildGeometry()`, which is called every frame; check that the caller
  uses a stable reference or that `buildGeometry` doesn't allocate unnecessarily when input is
  unchanged).

## Acceptance

- Supplying `connections` draws a directional elbow connector from the end of the `from` region to
  the start of the `to` region; omitting or supplying `[]` draws nothing.
- Connections cross lanes correctly — an arrow from lane 2 to lane 5 renders an orthogonal elbow
  with a filled triangle arrowhead at the target.
- A connection whose both endpoints are scrolled off-screen still renders its visible crossing
  portion (no missing lines when panning past an endpoint).
- Connectors are clipped to the plot area — they do not paint over the gutter or time bar.
- `yarn jest trace_chart` and `yarn typecheck` are green.
