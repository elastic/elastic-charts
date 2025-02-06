/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject } from 'react';

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
import { ChartType } from '../..';
import { EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../../../common/legend';
import { SmallMultiplesSeriesDomains } from '../../../common/panel_utils';
import { BrushTool } from '../../../components/brush/brush';
import { Tooltip } from '../../../components/tooltip/tooltip';
import { GlobalChartState, InternalChartState, BackwardRef } from '../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../state/selectors/get_chart_container_dimensions';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { isBrushingSelector } from '../../../state/selectors/is_brushing';
import { Dimensions } from '../../../utils/dimensions';
import { Heatmap } from '../renderer/canvas/connected_component';
import { CursorBand } from '../renderer/dom/cursor_band';
import { HighlighterFromBrush } from '../renderer/dom/highlighter_brush';

/** @internal */
export class HeatmapState implements InternalChartState {
  chartType = ChartType.Heatmap;

  onElementClickCaller: (state: GlobalChartState) => void = createOnElementClickCaller();

  onElementOverCaller: (state: GlobalChartState) => void = createOnElementOverCaller();

  onElementOutCaller: (state: GlobalChartState) => void = createOnElementOutCaller();

  onBrushEndCaller: (state: GlobalChartState) => void = createOnBrushEndCaller();

  onPointerUpdate: (state: GlobalChartState) => void = createOnPointerUpdateCaller();

  isInitialized() {
    return InitStatus.Initialized;
  }

  isBrushAvailable(globalState: GlobalChartState) {
    return isBrushAvailableSelector(globalState);
  }

  isBrushing(globalState: GlobalChartState) {
    return isBrushingSelector(globalState);
  }

  isChartEmpty(globalState: GlobalChartState) {
    return isEmptySelector(globalState);
  }

  getLegendItems(globalState: GlobalChartState) {
    return computeLegendSelector(globalState);
  }

  getLegendItemsLabels(globalState: GlobalChartState) {
    return getLegendItemsLabelsSelector(globalState);
  }

  getLegendExtraValues() {
    return EMPTY_LEGEND_ITEM_EXTRA_VALUES;
  }

  chartRenderer(containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) {
    return (
      <>
        <Tooltip getChartContainerRef={containerRef} />
        <Heatmap forwardStageRef={forwardStageRef} />
        <CursorBand />
        <BrushTool />
        <HighlighterFromBrush />
      </>
    );
  }

  getPointerCursor(globalState: GlobalChartState) {
    return getPointerCursorSelector(globalState);
  }

  isTooltipVisible(globalState: GlobalChartState) {
    return isTooltipVisibleSelector(globalState);
  }

  getTooltipInfo(globalState: GlobalChartState) {
    return getTooltipInfoSelector(globalState);
  }

  getTooltipAnchor(globalState: GlobalChartState) {
    return getTooltipAnchorSelector(globalState);
  }

  getProjectionContainerArea(globalState: GlobalChartState): Dimensions {
    return getChartContainerDimensionsSelector(globalState);
  }

  getMainProjectionArea(globalState: GlobalChartState): Dimensions {
    return computeChartDimensionsSelector(globalState).chartDimensions;
  }

  getBrushArea(globalState: GlobalChartState): Dimensions | null {
    return getBrushAreaSelector(globalState);
  }

  getDebugState(globalState: GlobalChartState) {
    return getDebugStateSelector(globalState);
  }

  getChartTypeDescription() {
    return 'Heatmap chart';
  }

  getSmallMultiplesDomains(globalState: GlobalChartState): SmallMultiplesSeriesDomains {
    return getHeatmapTableSelector(globalState);
  }

  eventCallbacks(globalState: GlobalChartState) {
    this.onElementOverCaller(globalState);
    this.onElementOutCaller(globalState);
    this.onElementClickCaller(globalState);
    this.onBrushEndCaller(globalState);
    this.onPointerUpdate(globalState);
  }

  canDisplayChartTitles = () => true;
}
