/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartDimensionsSelector } from './selectors/compute_chart_dimensions';
import { computeLegendSelector } from './selectors/compute_legend';
import { getBrushAreaSelector } from './selectors/get_brush_area';
import { getPointerCursorSelector } from './selectors/get_cursor_pointer';
import { getDebugStateSelector } from './selectors/get_debug_state';
import { getHeatmapTableSelector } from './selectors/get_heatmap_table';
import { getLegendItemsLabelsSelector } from './selectors/get_legend_items_labels';
import { getTooltipAnchorSelector } from './selectors/get_tooltip_anchor';
import { isBrushAvailableSelector } from './selectors/is_brush_available';
import { isEmptySelector } from './selectors/is_empty';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnBrushEndCaller } from './selectors/on_brush_end_caller';
import { createOnElementClickCaller } from './selectors/on_element_click_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { createOnPointerUpdateCaller } from './selectors/on_pointer_update_caller';
import { getTooltipInfoSelector } from './selectors/tooltip';
import { EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../../../common/legend';
import type { ChartSelectorsFactory } from '../../../state/chart_selectors';
import type { GlobalChartState } from '../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../state/selectors/get_chart_container_dimensions';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { isBrushingSelector } from '../../../state/selectors/is_brushing';

/** @internal */
export const chartSelectorsFactory: ChartSelectorsFactory = () => {
  const onElementClickCaller = createOnElementClickCaller();
  const onElementOverCaller = createOnElementOverCaller();
  const onElementOutCaller = createOnElementOutCaller();
  const onBrushEndCaller = createOnBrushEndCaller();
  const onPointerUpdate = createOnPointerUpdateCaller();

  return {
    isInitialized: () => InitStatus.Initialized,
    isBrushAvailable: isBrushAvailableSelector,
    isBrushing: isBrushingSelector,
    isChartEmpty: isEmptySelector,
    getLegendItems: computeLegendSelector,
    getLegendItemsLabels: getLegendItemsLabelsSelector,
    getLegendExtraValues: () => EMPTY_LEGEND_ITEM_EXTRA_VALUES,
    getPointerCursor: getPointerCursorSelector,
    isTooltipVisible: isTooltipVisibleSelector,
    getTooltipInfo: getTooltipInfoSelector,
    getTooltipAnchor: getTooltipAnchorSelector,
    getProjectionContainerArea: getChartContainerDimensionsSelector,
    getMainProjectionArea: (state: GlobalChartState) => computeChartDimensionsSelector(state).chartDimensions,
    getBrushArea: getBrushAreaSelector,
    getDebugState: getDebugStateSelector,
    getChartTypeDescription: () => 'Heatmap chart',
    getSmallMultiplesDomains: getHeatmapTableSelector,
    eventCallbacks: (state: GlobalChartState) => {
      onElementOverCaller(state);
      onElementOutCaller(state);
      onElementClickCaller(state);
      onBrushEndCaller(state);
      onPointerUpdate(state);
    },
    canDisplayChartTitles: () => true,
  };
};
