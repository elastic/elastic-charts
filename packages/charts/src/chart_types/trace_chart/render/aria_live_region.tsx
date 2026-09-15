/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

/**
 * Visually-hidden `aria-live="polite"` region that announces focused span name + duration on
 * each keyboard lane move. The parent class writes `divRef.current.textContent = …` (never
 * innerHTML — guarded against XSS via span names). forwardRef exposes the div so the class can
 * hold a stable React.createRef<HTMLDivElement> to it.
 * @internal
 */
export const AriaLiveRegion = React.forwardRef<HTMLDivElement>(function AriaLiveRegion(_, ref) {
  return (
    <div
      ref={ref}
      aria-live="polite"
      aria-atomic="true"
      style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
    />
  );
});
