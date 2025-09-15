/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartTypeDescriptionSelector } from './selectors/get_chart_type_description';
import { getGoalSpecSelector } from './selectors/get_goal_spec';
import { getScreenReaderDataSelector } from './selectors/get_screen_reader_data';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnElementClickCaller } from './selectors/on_element_click_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { getTooltipInfoSelector } from './selectors/tooltip';
import { createChartSelectorsFactory } from '../../../state/chart_selectors';
import type { GlobalChartState } from '../../../state/chart_state';
import { getActivePointerPosition } from '../../../state/selectors/get_active_pointer_position';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';

/** @internal */
export const chartSelectorsFactory = createChartSelectorsFactory(
  // selectors
  {
    isInitialized: (state: GlobalChartState) =>
      getGoalSpecSelector(state) !== null ? InitStatus.Initialized : InitStatus.ChartNotInitialized,

    isChartEmpty: () => false,

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

    getChartTypeDescription: getChartTypeDescriptionSelector,
    getScreenReaderData: getScreenReaderDataSelector,

    // TODO enable for small multiples
    canDisplayChartTitles: () => false,
  },
  // event callbacks
  [createOnElementClickCaller, createOnElementOverCaller, createOnElementOutCaller],
);
