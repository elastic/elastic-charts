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
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { EMPTY_LEGEND_LIST, EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../../common/legend';
import { chartSelectorRegistry } from '../../state/chart_selector_registry';
import type { ChartSelectorsFactory } from '../../state/chart_selectors';
import type { GlobalChartState } from '../../state/chart_state';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { EMPTY_LEGEND_ITEM_LIST } from '../../state/selectors/shared';

const isInitialized = (state: GlobalChartState) => {
  // First run base initialization checks
  const baseStatus = chartSelectorRegistry.getSelector<InitStatus>('base', 'getIsInitialized')(state);
  return baseStatus !== InitStatus.MissingChartType ? baseStatus : InitStatus.Initialized;
};

/** @internal */
export const chartSelectorsFactory: ChartSelectorsFactory = () => ({
  getChartTypeDescription: () => 'Bullet chart',
  isInitialized,
  isBrushAvailable: () => false,
  isBrushing: () => false,
  isChartEmpty: () => false,
  getLegendItems: () => EMPTY_LEGEND_LIST,
  getLegendItemsLabels: () => EMPTY_LEGEND_ITEM_LIST,
  getLegendExtraValues: () => EMPTY_LEGEND_ITEM_EXTRA_VALUES,
  getPointerCursor: () => DEFAULT_CSS_CURSOR,
  isTooltipVisible,
  getTooltipInfo,
  getTooltipAnchor,
  eventCallbacks: () => {},
  getProjectionContainerArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),
  getMainProjectionArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),
  getBrushArea: () => null,
  getDebugState: (state: GlobalChartState) => getDebugStateSelector(state),
  getSmallMultiplesDomains: () => ({
    smHDomain: [],
    smVDomain: [],
  }),
  canDisplayChartTitles,
});
