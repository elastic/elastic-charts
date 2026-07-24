/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * TraceSearchProvider and useTraceSearch hook — convenience React context that bridges an external
 * search box (or any descendant) to the trace chart's imperative scrollToSpan control (ADR 0008).
 *
 * Usage:
 * ```tsx
 * function MyPage() {
 *   const { register, scrollToSpan } = useTraceSearch();
 *   return (
 *     <Chart>
 *       <Trace id="t" data={spans} xScaleType="linear" controlProviderCallback={register} />
 *     </Chart>
 *     <button onClick={() => scrollToSpan('my-span-id')}>Go</button>
 *   );
 * }
 *
 * // Wrap with the provider:
 * <TraceSearchProvider><MyPage /></TraceSearchProvider>
 * ```
 */

import React from 'react';

import type { TraceControlCallbacks } from './trace_api';

/** Value exposed by the TraceSearchContext. */
interface TraceSearchContextValue {
  /**
   * Pass this to the `<Trace>` spec's `controlProviderCallback` prop. The provider will store the
   * chart's control callbacks and make them accessible via `scrollToSpan`.
   */
  register: (callbacks: TraceControlCallbacks) => void;
  /**
   * Scroll the lane for span `id` into view (centered) and highlight it. No-op before the chart
   * mounts or after it unmounts. See {@link TraceControlCallbacks.scrollToSpan} for full semantics.
   */
  scrollToSpan: (id: string) => void;
}

const TraceSearchContext = React.createContext<TraceSearchContextValue | null>(null);

/**
 * Provides the `useTraceSearch` hook to all descendants. Wrap a `<Chart>` (and any sibling
 * components that need to drive it) in this provider.
 * @public
 */
export function TraceSearchProvider({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<TraceControlCallbacks | null>(null);

  const register = React.useCallback((callbacks: TraceControlCallbacks) => {
    ref.current = callbacks;
  }, []);

  const scrollToSpan = React.useCallback((id: string) => {
    ref.current?.scrollToSpan(id);
  }, []);

  const value = React.useMemo<TraceSearchContextValue>(
    () => ({ register, scrollToSpan }),
    [register, scrollToSpan],
  );

  return <TraceSearchContext.Provider value={value}>{children}</TraceSearchContext.Provider>;
}

/**
 * Returns the `TraceSearchProvider`'s context value. Must be called inside a `<TraceSearchProvider>`.
 * Returns `null` when used outside a provider — callers that need a guaranteed non-null value should
 * assert after checking.
 * @public
 */
export function useTraceSearch(): TraceSearchContextValue | null {
  return React.useContext(TraceSearchContext);
}
