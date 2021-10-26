/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegacyRef, useRef } from 'react';

/**
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
