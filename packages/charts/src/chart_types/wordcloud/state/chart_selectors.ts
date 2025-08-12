/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getWordcloudSpecSelector } from './selectors/wordcloud_spec';
import { createChartSelectorsFactory } from '../../../state/chart_selectors';
import type { GlobalChartState } from '../../../state/chart_state';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';

/** @internal */
export const chartSelectorsFactory = createChartSelectorsFactory({
  isInitialized: (state: GlobalChartState) =>
    getWordcloudSpecSelector(state) !== null ? InitStatus.Initialized : InitStatus.ChartNotInitialized,
  isChartEmpty: () => false,
  getTooltipAnchor: (state: GlobalChartState) => {
    const { position } = state.interactions.pointer.current;
    return {
      isRotated: false,
      x: position.x,
      width: 0,
      y: position.y,
      height: 0,
    };
  },
  getChartTypeDescription: () => 'Word cloud chart',
});
