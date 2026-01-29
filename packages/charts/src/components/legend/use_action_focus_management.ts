/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Time window (ms) to ignore focus restoration after clicking outside.
 * Some modals/popovers restore focus to their trigger after close animations,
 * so we need a window long enough to capture these delayed focus events.
 */
const FOCUS_IGNORE_WINDOW_MS = 250;

/**
 * Hook to manage focus behavior for legend action items.
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
  const ignoreFocusUntilRef = useRef(0);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const actionElement = actionRef.current;
      if (!actionElement?.contains(e.target as Node)) {
        setIsActive(false);
        // Some popover/modal implementations restore focus to the trigger *after* they close
        // (often on `click`, after our `pointerdown` runs). That can re-trigger `:focus-within`
        // and keep the actions visible. Mark a short window in which we will ignore that
        // restored focus and immediately blur it.
        ignoreFocusUntilRef.current = Date.now() + FOCUS_IGNORE_WINDOW_MS;
      } else {
        // Clicking inside should allow normal focus behavior.
        ignoreFocusUntilRef.current = 0;
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      const actionElement = actionRef.current;
      if (!actionElement) return;
      if (ignoreFocusUntilRef.current === 0) return;
      if (Date.now() > ignoreFocusUntilRef.current) {
        ignoreFocusUntilRef.current = 0;
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target && actionElement.contains(target)) {
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
  }, []);

  const handlePointerDown = useCallback(() => {
    setIsActive(true);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsActive(true);
    } else {
      if (e.currentTarget.contains(e.target as Node)) {
        setIsActive(false);
      }
    }
  }, []);

  return {
    isActive,
    actionRef,
    handlePointerDown,
    handleKeyDown,
  };
}
