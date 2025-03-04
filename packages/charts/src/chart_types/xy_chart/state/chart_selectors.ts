/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartDimensionsSelector } from './selectors/compute_chart_dimensions';
import { computeLegendSelector } from './selectors/compute_legend';
import { computeSeriesDomainsSelector } from './selectors/compute_series_domains';
import { getBrushAreaSelector } from './selectors/get_brush_area';
import { getChartTypeDescriptionSelector } from './selectors/get_chart_type_description';
import { getPointerCursorSelector } from './selectors/get_cursor_pointer';
import { getDebugStateSelector } from './selectors/get_debug_state';
import { getLegendItemExtraValuesSelector } from './selectors/get_legend_item_extra_values';
import { getSeriesSpecsSelector } from './selectors/get_specs';
import { getTooltipAnchorPositionSelector } from './selectors/get_tooltip_anchor_position';
import { getTooltipInfoSelector } from './selectors/get_tooltip_values_highlighted_geoms';
import { isBrushAvailableSelector } from './selectors/is_brush_available';
import { isChartEmptySelector } from './selectors/is_chart_empty';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnBrushEndCaller } from './selectors/on_brush_end_caller';
import { createOnClickCaller } from './selectors/on_click_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { createOnPointerMoveCaller } from './selectors/on_pointer_move_caller';
import { createOnProjectionAreaCaller } from './selectors/on_projection_area_caller';
import { createChartSelectorsFactory } from '../../../state/chart_selectors';
import type { GlobalChartState } from '../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../state/selectors/get_chart_container_dimensions';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { isBrushingSelector } from '../../../state/selectors/is_brushing';

/** @internal */
export const chartSelectorsFactory = createChartSelectorsFactory({
  isInitialized: (state: GlobalChartState) =>
    getSeriesSpecsSelector(state).length > 0 ? InitStatus.Initialized : InitStatus.SpecNotInitialized,

  isBrushAvailable: isBrushAvailableSelector,
  isBrushing: (globalState: GlobalChartState) =>
    isBrushAvailableSelector(globalState) && isBrushingSelector(globalState),
  isChartEmpty: isChartEmptySelector,

  getLegendItems: computeLegendSelector,
  getLegendExtraValues: getLegendItemExtraValuesSelector,
  getPointerCursor: getPointerCursorSelector,

  isTooltipVisible: isTooltipVisibleSelector,
  getTooltipInfo: getTooltipInfoSelector,
  getTooltipAnchor: getTooltipAnchorPositionSelector,

  getProjectionContainerArea: getChartContainerDimensionsSelector,
  getMainProjectionArea: (state: GlobalChartState) => computeChartDimensionsSelector(state).chartDimensions,
  getBrushArea: getBrushAreaSelector,

  getDebugState: getDebugStateSelector,
  getChartTypeDescription: getChartTypeDescriptionSelector,
  getSmallMultiplesDomains: computeSeriesDomainsSelector,

  eventCallbacks: (state: GlobalChartState) => {
    const onClickCaller = createOnClickCaller();
    const onElementOverCaller = createOnElementOverCaller();
    const onElementOutCaller = createOnElementOutCaller();
    const onBrushEndCaller = createOnBrushEndCaller();
    const onPointerMoveCaller = createOnPointerMoveCaller();
    const onProjectionAreaCaller = createOnProjectionAreaCaller();

    console.log('xy eventCallbacks');
    onClickCaller(state);
    onElementOverCaller(state);
    onElementOutCaller(state);
    onBrushEndCaller(state);
    onPointerMoveCaller(state);
    onProjectionAreaCaller(state);
  },
});
