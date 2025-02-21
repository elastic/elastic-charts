/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { LegacyRef } from 'react';
import { useRef } from 'react';

/**
 * This hook handles a11y focus management closing of the action popover
 * @param ref - pass this ref to button for focus to be returned once popover is closed
 * @param onClose - callback to trigger the focus on popover close
 * @public
 */
export function useLegendAction<T extends HTMLElement>(): [ref: LegacyRef<T>, onClose: () => void] {
  const ref = useRef<T>(null);
  const onClose = () => {
    if (ref.current) {
      requestAnimationFrame(() => ref?.current?.focus?.());
    }
  };

  return [ref, onClose];
}
