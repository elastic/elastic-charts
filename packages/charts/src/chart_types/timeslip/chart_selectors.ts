/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createChartSelectorsFactory } from '../../state/chart_selectors';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';

/** @internal */
export const chartSelectorsFactory = createChartSelectorsFactory({
  getChartTypeDescription: () => 'Timeslip chart',

  isInitialized: () => InitStatus.Initialized,
  isChartEmpty: () => false,
  getTooltipAnchor: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  getTooltipInfo: () => ({ header: null, values: [] }),
});
