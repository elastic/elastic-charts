/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Tests for TraceSearchProvider and useTraceSearch (Spec 14 / ADR 0008).
 *
 * These are pure React context tests — no Chart, no canvas, no redux.
 * The context layer is thin by design; tests focus on:
 *   - registration delegation (register → scrollToSpan routes to the stored callbacks)
 *   - pre-registration safety (scrollToSpan before register is a no-op, not a throw)
 *   - post-unmount safety (scrollToSpan after unmount is a no-op)
 *   - null return when used outside a provider
 */

import { act, render, renderHook } from '@testing-library/react';
import React from 'react';

import type { TraceControlCallbacks } from './trace_api';
import { TraceSearchProvider, useTraceSearch } from './trace_search_context';

describe('TraceSearchProvider / useTraceSearch', () => {
  it('useTraceSearch returns null when called outside a provider', () => {
    const { result } = renderHook(() => useTraceSearch());
    expect(result.current).toBeNull();
  });

  it('useTraceSearch returns a non-null value inside a provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TraceSearchProvider>{children}</TraceSearchProvider>
    );
    const { result } = renderHook(() => useTraceSearch(), { wrapper });
    expect(result.current).not.toBeNull();
    expect(typeof result.current!.register).toBe('function');
    expect(typeof result.current!.scrollToSpan).toBe('function');
  });

  it('scrollToSpan before register is a no-op (does not throw)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TraceSearchProvider>{children}</TraceSearchProvider>
    );
    const { result } = renderHook(() => useTraceSearch(), { wrapper });
    expect(() => result.current!.scrollToSpan('any-id')).not.toThrow();
  });

  it('after register(callbacks), scrollToSpan delegates to callbacks.scrollToSpan', () => {
    const mockScrollToSpan = jest.fn();
    const mockCallbacks: TraceControlCallbacks = { scrollToSpan: mockScrollToSpan };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TraceSearchProvider>{children}</TraceSearchProvider>
    );
    const { result } = renderHook(() => useTraceSearch(), { wrapper });

    act(() => {
      result.current!.register(mockCallbacks);
    });

    result.current!.scrollToSpan('my-span-id');
    expect(mockScrollToSpan).toHaveBeenCalledTimes(1);
    expect(mockScrollToSpan).toHaveBeenCalledWith('my-span-id');
  });

  it('scrollToSpan can be called multiple times with the same id (no dedup)', () => {
    const mockScrollToSpan = jest.fn();
    const mockCallbacks: TraceControlCallbacks = { scrollToSpan: mockScrollToSpan };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TraceSearchProvider>{children}</TraceSearchProvider>
    );
    const { result } = renderHook(() => useTraceSearch(), { wrapper });

    act(() => {
      result.current!.register(mockCallbacks);
    });

    result.current!.scrollToSpan('same-id');
    result.current!.scrollToSpan('same-id');
    expect(mockScrollToSpan).toHaveBeenCalledTimes(2);
  });

  it('scrollToSpan after provider unmount is a no-op (does not throw)', () => {
    const mockScrollToSpan = jest.fn();
    const mockCallbacks: TraceControlCallbacks = { scrollToSpan: mockScrollToSpan };

    let capturedScrollToSpan: ((id: string) => void) | null = null;

    function Consumer() {
      const search = useTraceSearch();
      React.useEffect(() => {
        search!.register(mockCallbacks);
        capturedScrollToSpan = (id) => search!.scrollToSpan(id);
      }, [search]);
      return null;
    }

    const { unmount } = render(
      <TraceSearchProvider>
        <Consumer />
      </TraceSearchProvider>,
    );

    expect(capturedScrollToSpan).not.toBeNull();

    // Unmount the provider — ref.current is still populated (ref lives in the closure),
    // but calling scrollToSpan through the cached closure must not throw.
    unmount();
    expect(() => capturedScrollToSpan!('post-unmount-id')).not.toThrow();
  });

  it('register is stable across re-renders (same function reference)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TraceSearchProvider>{children}</TraceSearchProvider>
    );
    const { result, rerender } = renderHook(() => useTraceSearch(), { wrapper });

    const register1 = result.current!.register;
    rerender();
    const register2 = result.current!.register;

    expect(register1).toBe(register2);
  });
});
