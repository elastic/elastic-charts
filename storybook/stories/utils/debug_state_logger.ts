/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { debounce } from 'ts-debounce';

import { DebugState } from '@elastic/charts';

export const debugstateLogger = debounce(() => {
  const statusEl = document.querySelector<HTMLDivElement>('.echChartStatus');

  if (statusEl) {
    const dataState = statusEl.dataset.echDebugState
      ? (JSON.parse(statusEl.dataset.echDebugState) as DebugState)
      : null;

    if (dataState) action('DebugState')(dataState);
  }
}, 100);
