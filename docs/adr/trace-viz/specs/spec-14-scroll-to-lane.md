# Spec 14 — Scroll-to-lane API + search story

**Goal:** let an external component programmatically scroll the trace waterfall to a specific span's
lane by span id; expose the mechanism via a React context/hook so downstream components (a search box,
a sidebar) can call it without prop threading.

**Depends on:** [Spec 12](./spec-12-accessibility.md) — `scrollLaneIntoView(index, { align })` and
`focusedLaneIndex` are in place. [ADR 0008](../0008-scroll-to-span-control-provider.md) records the
`controlProviderCallback` + `TraceSearchProvider` design.

## Files

- `packages/charts/src/chart_types/trace_chart/trace_api.ts` — add
  `controlProviderCallback?: (callbacks: TraceControlCallbacks) => void` to `TraceSpec`; export
  `TraceControlCallbacks` type.
- `packages/charts/src/chart_types/trace_chart/trace_chart.tsx` — implement `scrollToSpan(id)`
  method (reuses `scrollLaneIntoView` from [Spec 12](./spec-12-accessibility.md)); register via
  `controlProviderCallback` on mount (and re-register if the callback prop changes).
- `packages/charts/src/chart_types/trace_chart/trace_search_context.tsx` *(new)* — `TraceSearchProvider`
  React context component + `useTraceSearch()` hook.
- `storybook/stories/trace/18_scroll_to_lane.story.tsx` — external EUI search box inside a
  `<TraceSearchProvider>`.

## Contract

```ts
export interface TraceControlCallbacks {
  /** Scroll the lane for the span with the given id into view and set keyboard focus to it.
   *  If no span with that id exists, emits a dev-warn and is a no-op. Re-calling with the
   *  same id re-triggers (imperative — no prop-diffing problem). */
  scrollToSpan: (id: string) => void;
}
```

**`controlProviderCallback` pattern (ADR 0008, mirrors Flame chart):** on `componentDidMount`, if
`controlProviderCallback` is supplied, call it with `{ scrollToSpan: this.scrollToSpan }`. This is
imperative registration: re-calling with the same id re-triggers, unlike a `focusSpanId` prop where
prop-diffing would prevent re-triggering.

**`scrollToSpan(id)`:** (calls `scrollLaneIntoView` from [Spec 12](./spec-12-accessibility.md))
1. Resolve `id → laneIndex` by scanning `this.normalizedSpans` for `span.meta.id === id`.
2. If not found: `Logger.warn('scrollToSpan: span id not found', id)` and return.
3. Call `scrollLaneIntoView(laneIndex, { align: 'center' })`.
4. Set `this.focusedLaneIndex = laneIndex` (field declared in [Spec 12](./spec-12-accessibility.md);
   reuses the focused-lane highlight already in place).

**`TraceSearchProvider` + `useTraceSearch()`:**

```tsx
// trace_search_context.tsx
const TraceSearchContext = React.createContext<TraceControlCallbacks | null>(null);

export function TraceSearchProvider({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<TraceControlCallbacks | null>(null);
  const register = React.useCallback((callbacks: TraceControlCallbacks) => {
    ref.current = callbacks;
  }, []);
  const value = React.useMemo(() => ({
    scrollToSpan: (id: string) => ref.current?.scrollToSpan(id),
    register,
  }), [register]);
  return <TraceSearchContext.Provider value={value}>{children}</TraceSearchContext.Provider>;
}

export function useTraceSearch() {
  return React.useContext(TraceSearchContext);
}
```

The `Trace` spec passes `controlProviderCallback={useTraceSearch().register}` inside the provider.

## Steps

1. Define `TraceControlCallbacks` and add `controlProviderCallback` prop to `TraceSpec`.
2. Implement `scrollToSpan` on `TraceChart` (calls `scrollLaneIntoView` from
   [Spec 12](./spec-12-accessibility.md)); register in `componentDidMount` and re-register in
   `componentDidUpdate` when the prop reference changes.
3. Create `trace_search_context.tsx` with `TraceSearchProvider` and `useTraceSearch`.
4. Author `18_scroll_to_lane.story.tsx`.

## Storybook

`18_scroll_to_lane.story.tsx`:
- Wraps the `<Chart>` in `<TraceSearchProvider>`.
- An external `EuiFieldSearch` box calls `useTraceSearch().scrollToSpan(inputValue)` on submit.
- Demonstrates: typing a span id → the trace snaps to that lane, highlighted.
- Demonstrates: re-submitting the same id re-triggers the scroll.
- Demonstrates: unknown id → no visual change (dev-warn in console).

## Tests

- `scrollToSpan` with unknown id: `Logger.warn` is called; `scrollOffset` unchanged.
- `scrollToSpan` with known id: `scrollOffset` updates to center-aligned target.
- Re-trigger: calling `scrollToSpan` twice with the same id calls the scroll logic twice (no
  prop-diffing guard).
- `TraceSearchProvider`: after `register(callbacks)`, calling `scrollToSpan(id)` via the context
  delegates to `callbacks.scrollToSpan(id)`.

## Review (`/review-claudio`)

- Verify `scrollToSpan` is robust if called before `componentDidMount` completes (guard with null
  check on `normalizedSpans`).
- Verify the `controlProviderCallback` is re-called if the prop reference changes between renders
  (use `componentDidUpdate` in addition to `componentDidMount`).
- Verify `TraceSearchProvider` ref lifecycle — `ref.current` is null on unmount; calling `scrollToSpan`
  after unmount is a no-op, not a throw.
- Verify that calling `scrollToSpan` while a drag gesture is active doesn't corrupt `scrollOffset`
  (the drag handler reads `scrollOffset` on each mousemove; a concurrent snap shouldn't interleave).

## Acceptance

- Typing a span id in the external EUI search box snaps the trace to that lane (centered) and
  highlights it with the Spec 12 focused-lane indicator.
- Re-submitting the same id re-triggers the scroll.
- An unknown id emits a `Logger.warn` and does nothing.
- `yarn jest trace_chart` and `yarn typecheck` are green.
