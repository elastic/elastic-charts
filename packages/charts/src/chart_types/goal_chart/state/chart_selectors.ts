/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartTypeDescriptionSelector } from './selectors/get_chart_type_description';
import { getGoalSpecSelector } from './selectors/get_goal_spec';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnElementClickCaller } from './selectors/on_element_click_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { getTooltipInfoSelector } from './selectors/tooltip';
import { DEFAULT_CSS_CURSOR } from '../../../common/constants';
import { EMPTY_LEGEND_LIST, EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../../../common/legend';
import type { ChartSelectorsFactory } from '../../../state/chart_selectors';
import type { GlobalChartState } from '../../../state/chart_state';
import { getActivePointerPosition } from '../../../state/selectors/get_active_pointer_position';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { EMPTY_LEGEND_ITEM_LIST } from '../../../state/selectors/shared';

/** @internal */
export const chartSelectorsFactory: ChartSelectorsFactory = () => {
  const onElementClickCaller = createOnElementClickCaller();
  const onElementOverCaller = createOnElementOverCaller();
  const onElementOutCaller = createOnElementOutCaller();

  return {
    isInitialized: (state: GlobalChartState) =>
      getGoalSpecSelector(state) !== null ? InitStatus.Initialized : InitStatus.ChartNotInitialized,

    isBrushAvailable: () => false,
    isBrushing: () => false,
    isChartEmpty: () => false,

    getLegendItems: () => EMPTY_LEGEND_LIST,
    getLegendItemsLabels: () => EMPTY_LEGEND_ITEM_LIST,
    getLegendExtraValues: () => EMPTY_LEGEND_ITEM_EXTRA_VALUES,
    getPointerCursor: () => DEFAULT_CSS_CURSOR,

    isTooltipVisible: (state: GlobalChartState) => ({
      visible: isTooltipVisibleSelector(state),
      isExternal: false,
      displayOnly: false,
      isPinnable: false,
    }),
    getTooltipInfo: getTooltipInfoSelector,
    getTooltipAnchor: (state: GlobalChartState) => {
      const position = getActivePointerPosition(state);
      return {
        isRotated: false,
        x: position.x,
        width: 0,
        y: position.y,
        height: 0,
      };
    },

    eventCallbacks: (globalState: GlobalChartState) => {
      onElementOverCaller(globalState);
      onElementOutCaller(globalState);
      onElementClickCaller(globalState);
    },

    getChartTypeDescription: getChartTypeDescriptionSelector,

    // TODO
    getProjectionContainerArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),

    // TODO
    getMainProjectionArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),

    // TODO
    getBrushArea: () => null,

    // TODO
    getDebugState: () => ({}),
    getSmallMultiplesDomains: () => ({
      smHDomain: [],
      smVDomain: [],
    }),

    // TODO enable for small multiples
    canDisplayChartTitles: () => false,
  };
};
