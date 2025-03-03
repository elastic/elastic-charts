/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { canDisplayChartTitles } from './selectors/can_display_chart_titles';
import { getDebugStateSelector } from './selectors/get_debug_state';
import { getTooltipAnchor } from './selectors/get_tooltip_anchor';
import { getTooltipInfo } from './selectors/get_tooltip_info';
import { isTooltipVisible } from './selectors/is_tooltip_visible';
import { createChartSelectorsFactory } from '../../state/chart_selectors';
import type { GlobalChartState } from '../../state/chart_state';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';

/** @internal */
export const chartSelectorsFactory = createChartSelectorsFactory({
  getChartTypeDescription: () => 'Bullet chart',
  isInitialized: () => InitStatus.Initialized,
  isChartEmpty: () => false,
  isTooltipVisible,
  getTooltipInfo,
  getTooltipAnchor,
  getDebugState: (state: GlobalChartState) => getDebugStateSelector(state),
  canDisplayChartTitles,
});
