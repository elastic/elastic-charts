/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';

import type { DebugState } from '@elastic/charts';
import { debounce } from '@elastic/charts/src/utils/debounce';

export const getDebugStateLogger = (debugState: boolean) => {
  const dataStateAction = action('DataState');
  return debounce(() => {
    if (!debugState) return;
    const statusEl = document.querySelector<HTMLDivElement>('.echChartStatus');

    if (statusEl) {
      const dataState = statusEl.dataset.echDebugState
        ? (JSON.parse(statusEl.dataset.echDebugState) as DebugState)
        : null;
      if (dataState) dataStateAction(dataState);
    }
  }, 100) as () => void;
};
