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
  getChartTypeDescription: () => 'Flame chart',
  isInitialized: () => InitStatus.Initialized,
  isChartEmpty: () => false,
  getTooltipInfo: () => ({ header: null, values: [] }),
  // Flame pinning is decided in the chart component. Visibility stays false so the shared
  // tooltip does not render, but isPinnable must stay true or isPinnableTooltip disables the menu.
  isTooltipVisible: () => ({
    visible: false,
    isExternal: false,
    displayOnly: false,
    isPinnable: true,
  }),
});
