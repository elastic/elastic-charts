/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeLegendSelector } from './selectors/compute_legend';
import { getChartTypeDescriptionSelector } from './selectors/get_chart_type_description';
import { getPointerCursorSelector } from './selectors/get_cursor_pointer';
import { getDebugStateSelector } from './selectors/get_debug_state';
import { getLegendItemsLabels } from './selectors/get_legend_items_labels';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnElementClickCaller } from './selectors/on_element_click_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { getPartitionSpec } from './selectors/partition_spec';
import { getTooltipInfoSelector } from './selectors/tooltip';
import { createChartSelectorsFactory } from '../../../state/chart_selectors';
import type { GlobalChartState } from '../../../state/chart_state';
import { getActivePointerPosition } from '../../../state/selectors/get_active_pointer_position';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';

/** @internal */
export const chartSelectorsFactory = createChartSelectorsFactory({
  isInitialized: (state: GlobalChartState) =>
    getPartitionSpec(state) !== null ? InitStatus.Initialized : InitStatus.SpecNotInitialized,

  isChartEmpty: () => false,

  getLegendItems: computeLegendSelector,
  // order doesn't matter, but it needs to return the highest depth of the label occurrence so enough horizontal width is allocated
  // the label item strings needs to be a concatenation of the label + the extra formatted value if available.
  // this is required to compute the legend automatic width
  getLegendItemsLabels,
  getPointerCursor: getPointerCursorSelector,

  isTooltipVisible: (globalState: GlobalChartState) => ({
    visible: isTooltipVisibleSelector(globalState),
    isExternal: false,
    displayOnly: false,
    isPinnable: true,
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

  eventCallbacks: (state: GlobalChartState) => {
    const onElementClickCaller = createOnElementClickCaller();
    const onElementOverCaller = createOnElementOverCaller();
    const onElementOutCaller = createOnElementOutCaller();

    onElementOverCaller(state);
    onElementOutCaller(state);
    onElementClickCaller(state);
  },

  // TODO
  getProjectionContainerArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),

  // TODO
  getMainProjectionArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),

  // TODO
  getBrushArea: () => null,

  getDebugState: getDebugStateSelector,
  getChartTypeDescription: getChartTypeDescriptionSelector,
});
