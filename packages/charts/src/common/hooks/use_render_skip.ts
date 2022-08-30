/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useEffect, useState } from 'react';

/**
 * Helper hook to skips n renders
 * @internal
 */
export function useRenderSkip(rendersToSkip: number = 1) {
  const [renderCount, setRenderCount] = useState(0);
  useEffect(
    () => {
      if (renderCount >= rendersToSkip) return;
      setRenderCount((n) => n + 1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    rendersToSkip === 1 ? [] : undefined,
  );
  return renderCount >= rendersToSkip;
}
