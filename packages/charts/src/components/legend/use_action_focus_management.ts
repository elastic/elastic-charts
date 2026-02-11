/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { KeyboardEvent, ReactNode, RefObject } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Time window (ms) to ignore focus restoration after clicking outside.
 * Some modals/popovers restore focus to their trigger after close animations,
 * so we need a window long enough to capture these delayed focus events.
 */
const FOCUS_IGNORE_WINDOW_MS = 250;

interface ActiveEntry {
  ref: RefObject<HTMLDivElement | null>;
  deactivate: () => void;
}

interface ActionFocusContextValue {
  registerActive: (entry: ActiveEntry) => void;
  unregisterActive: (ref: RefObject<HTMLDivElement | null>) => void;
}

const ActionFocusContext = createContext<ActionFocusContextValue | null>(null);

/**
 * Provider that manages document-level listeners for legend action focus behavior.
 *
 * Instead of each legend item attaching its own pointerdown/focusin listeners (2 per item),
 * this provider attaches 2 listeners (only when enabled) and coordinates which legend action
 * is currently active.
 *
 * @param enabled - When false, no listeners are attached and the context is null.
 *   Should be false when there is no legend action or legendActionOnHover is disabled.
 * @internal
 */
export function ActionFocusProvider({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const activeEntryRef = useRef<ActiveEntry | null>(null);
  const lastDeactivatedElementRef = useRef<HTMLDivElement | null>(null);
  const ignoreFocusUntilRef = useRef(0);

  const registerActive = useCallback((entry: ActiveEntry) => {
    // Deactivate previous active item if it's a different one
    const current = activeEntryRef.current;
    if (current && current.ref !== entry.ref) {
      current.deactivate();
    }
    activeEntryRef.current = entry;
    // Clear any pending ignore window since a new action is now active
    ignoreFocusUntilRef.current = 0;
    lastDeactivatedElementRef.current = null;
  }, []);

  const unregisterActive = useCallback((ref: RefObject<HTMLDivElement | null>) => {
    if (activeEntryRef.current?.ref === ref) {
      activeEntryRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Clean up any active entry when the provider is disabled
      if (activeEntryRef.current) {
        activeEntryRef.current.deactivate();
        activeEntryRef.current = null;
      }
      ignoreFocusUntilRef.current = 0;
      lastDeactivatedElementRef.current = null;
      return;
    }

    const onPointerDown = (e: PointerEvent) => {
      const entry = activeEntryRef.current;
      if (!entry) return;

      const actionElement = entry.ref.current;
      if (!actionElement?.contains(e.target as Node)) {
        entry.deactivate();
        lastDeactivatedElementRef.current = actionElement;
        activeEntryRef.current = null;
        // Some popover/modal implementations restore focus to the trigger *after* they close
        // (often on `click`, after our `pointerdown` runs). That can re-trigger `:focus-within`
        // and keep the actions visible. Mark a short window in which we will ignore that
        // restored focus and immediately blur it.
        ignoreFocusUntilRef.current = Date.now() + FOCUS_IGNORE_WINDOW_MS;
      } else {
        // Clicking inside should allow normal focus behavior
        ignoreFocusUntilRef.current = 0;
        lastDeactivatedElementRef.current = null;
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      if (ignoreFocusUntilRef.current === 0) return;
      if (Date.now() > ignoreFocusUntilRef.current) {
        ignoreFocusUntilRef.current = 0;
        lastDeactivatedElementRef.current = null;
        return;
      }

      const lastDeactivated = lastDeactivatedElementRef.current;
      if (!lastDeactivated) return;

      const target = e.target as HTMLElement | null;
      if (target && lastDeactivated.contains(target)) {
        target.blur();
      }
    };

    // Use capture phase to intercept events before they bubble
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('focusin', onFocusIn, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
    };
  }, [enabled]);

  const value = useMemo(() => ({ registerActive, unregisterActive }), [registerActive, unregisterActive]);

  return React.createElement(ActionFocusContext.Provider, { value: enabled ? value : null }, children);
}

/**
 * Hook to manage focus behavior for legend action items.
 *
 * Must be used within an {@link ActionFocusProvider}. When the provider is
 * disabled (no action or legendActionOnHover is false), the hook is a no-op.
 *
 * This also handles the edge case where modals/popovers restore focus to their trigger
 * after closing. Without this, the `:focus-within` CSS would keep the action visible
 * even after clicking outside to dismiss the modal.
 *
 * @internal
 */
export function useActionFocusManagement() {
  const [isActive, setIsActive] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);
  const ctx = useContext(ActionFocusContext);
  // Keep a ref to ctx so the unmount cleanup always uses the latest value
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const activate = useCallback(() => {
    if (!ctx) return; // no-op when provider is disabled
    setIsActive(true);
    ctx.registerActive({
      ref: actionRef,
      deactivate: () => setIsActive(false),
    });
  }, [ctx]);

  // Unregister on unmount so the provider doesn't hold a stale entry
  useEffect(() => {
    return () => {
      ctxRef.current?.unregisterActive(actionRef);
    };
  }, []);

  const handlePointerDown = useCallback(() => {
    activate();
  }, [activate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        activate();
      } else if (e.currentTarget.contains(e.target as Node)) {
        setIsActive(false);
        ctx?.unregisterActive(actionRef);
      }
    },
    [activate, ctx],
  );

  return {
    isActive,
    actionRef,
    handlePointerDown,
    handleKeyDown,
  };
}
