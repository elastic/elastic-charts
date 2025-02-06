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
import { ChartType } from '../..';
import { LegendItemExtraValues } from '../../../common/legend';
import { SeriesKey } from '../../../common/series_id';
import { BrushTool } from '../../../components/brush/brush';
import { Tooltip } from '../../../components/tooltip/tooltip';
import { GlobalChartState, InternalChartState, BackwardRef } from '../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../state/selectors/get_chart_container_dimensions';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { EMPTY_LEGEND_ITEM_LIST } from '../../../state/selectors/get_legend_items_labels';
import { isBrushingSelector } from '../../../state/selectors/is_brushing';
import { htmlIdGenerator } from '../../../utils/common';
import { XYChart } from '../renderer/canvas/xy_chart';
import { Annotations } from '../renderer/dom/annotations';
import { CursorBand } from '../renderer/dom/cursor_band';
import { CursorCrossLine } from '../renderer/dom/cursor_crossline';
import { CursorLine } from '../renderer/dom/cursor_line';
import { Highlighter } from '../renderer/dom/highlighter';

/** @internal */
export class XYAxisChartState implements InternalChartState {
  chartType: ChartType;

  legendId: string;

  onClickCaller: (state: GlobalChartState) => void;

  onElementOverCaller: (state: GlobalChartState) => void;

  onElementOutCaller: (state: GlobalChartState) => void;

  onBrushEndCaller: (state: GlobalChartState) => void;

  onPointerMoveCaller: (state: GlobalChartState) => void;

  onProjectionAreaCaller: (state: GlobalChartState) => void;

  constructor() {
    this.onClickCaller = createOnClickCaller();
    this.onElementOverCaller = createOnElementOverCaller();
    this.onElementOutCaller = createOnElementOutCaller();
    this.onBrushEndCaller = createOnBrushEndCaller();
    this.onPointerMoveCaller = createOnPointerMoveCaller();
    this.onProjectionAreaCaller = createOnProjectionAreaCaller();
    this.chartType = ChartType.XYAxis;
    this.legendId = htmlIdGenerator()('legend');
  }

  isInitialized(globalState: GlobalChartState) {
    return getSeriesSpecsSelector(globalState).length > 0 ? InitStatus.Initialized : InitStatus.SpecNotInitialized;
  }

  isBrushAvailable(globalState: GlobalChartState) {
    return isBrushAvailableSelector(globalState);
  }

  isBrushing(globalState: GlobalChartState) {
    return this.isBrushAvailable(globalState) && isBrushingSelector(globalState);
  }

  isChartEmpty(globalState: GlobalChartState) {
    return isChartEmptySelector(globalState);
  }

  getMainProjectionArea(globalState: GlobalChartState) {
    return computeChartDimensionsSelector(globalState).chartDimensions;
  }

  getProjectionContainerArea(globalState: GlobalChartState) {
    return getChartContainerDimensionsSelector(globalState);
  }

  getBrushArea(globalState: GlobalChartState) {
    return getBrushAreaSelector(globalState);
  }

  getLegendItemsLabels() {
    return EMPTY_LEGEND_ITEM_LIST;
  }

  getLegendItems(globalState: GlobalChartState) {
    return computeLegendSelector(globalState);
  }

  getLegendExtraValues(globalState: GlobalChartState): Map<SeriesKey, LegendItemExtraValues> {
    return getLegendItemExtraValuesSelector(globalState);
  }

  chartRenderer(containerRef: BackwardRef, forwardCanvasRef: RefObject<HTMLCanvasElement>) {
    return (
      <>
        <CursorBand />
        <XYChart forwardCanvasRef={forwardCanvasRef} />
        <CursorLine />
        <CursorCrossLine />
        <Tooltip getChartContainerRef={containerRef} />
        <Annotations getChartContainerRef={containerRef} chartAreaRef={forwardCanvasRef} />
        <Highlighter />
        <BrushTool />
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
    return getTooltipAnchorPositionSelector(globalState);
  }

  getSmallMultiplesDomains(globalState: GlobalChartState) {
    return computeSeriesDomainsSelector(globalState);
  }

  eventCallbacks(globalState: GlobalChartState) {
    this.onElementOverCaller(globalState);
    this.onElementOutCaller(globalState);
    this.onClickCaller(globalState);
    this.onBrushEndCaller(globalState);
    this.onPointerMoveCaller(globalState);
    this.onProjectionAreaCaller(globalState);
  }

  getDebugState(globalState: GlobalChartState) {
    return getDebugStateSelector(globalState);
  }

  getChartTypeDescription(globalState: GlobalChartState) {
    return getChartTypeDescriptionSelector(globalState);
  }

  canDisplayChartTitles = () => true;
}
