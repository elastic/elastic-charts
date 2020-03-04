import React, { RefObject } from 'react';
import { XYChart } from '../renderer/canvas/xy_chart';
import { Highlighter } from '../renderer/dom/highlighter';
import { Crosshair } from '../renderer/dom/crosshair';
import { BrushTool } from '../renderer/dom/brush';
import { InternalChartState, GlobalChartState, BackwardRef } from '../../../state/chart_state';
import { TooltipLegendValue } from '../tooltip/tooltip';
import { ChartTypes } from '../..';
import { AnnotationTooltip } from '../renderer/dom/annotation_tooltips';
import { isBrushAvailableSelector } from './selectors/is_brush_available';
import { isChartEmptySelector } from './selectors/is_chart_empty';
import { computeLegendSelector } from './selectors/compute_legend';
import { getLegendTooltipValuesSelector } from './selectors/get_legend_tooltip_values';
import { getPointerCursorSelector } from './selectors/get_cursor_pointer';
import { isBrushingSelector } from './selectors/is_brushing';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { getTooltipInfoSelector } from './selectors/get_tooltip_values_highlighted_geoms';
import { htmlIdGenerator } from '../../../utils/commons';
import { Tooltip } from '../../../components/tooltip';
import { getTooltipAnchorPositionSelector } from './selectors/get_tooltip_position';
import { SeriesKey } from '../utils/series';
import { createOnElementClickCaller } from './selectors/on_element_click_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnBrushEndCaller } from './selectors/on_brush_end_caller';
import { createOnPointerMoveCaller } from './selectors/on_pointer_move_caller';

export class XYAxisChartState implements InternalChartState {
  onElementClickCaller: (state: GlobalChartState) => void;
  onElementOverCaller: (state: GlobalChartState) => void;
  onElementOutCaller: (state: GlobalChartState) => void;
  onBrushEndCaller: (state: GlobalChartState) => void;
  onPointerMoveCaller: (state: GlobalChartState) => void;
  chartType: ChartTypes;
  legendId: string;

  constructor() {
    this.onElementClickCaller = createOnElementClickCaller();
    this.onElementOverCaller = createOnElementOverCaller();
    this.onElementOutCaller = createOnElementOutCaller();
    this.onBrushEndCaller = createOnBrushEndCaller();
    this.onPointerMoveCaller = createOnPointerMoveCaller();
    this.chartType = ChartTypes.XYAxis;
    this.legendId = htmlIdGenerator()('legend');
  }

  isBrushAvailable(globalState: GlobalChartState) {
    return isBrushAvailableSelector(globalState);
  }
  isBrushing(globalState: GlobalChartState) {
    return isBrushingSelector(globalState);
  }
  isChartEmpty(globalState: GlobalChartState) {
    return isChartEmptySelector(globalState);
  }
  getLegendItems(globalState: GlobalChartState) {
    return computeLegendSelector(globalState);
  }
  getLegendItemsValues(globalState: GlobalChartState): Map<SeriesKey, TooltipLegendValue> {
    return getLegendTooltipValuesSelector(globalState);
  }
  chartRenderer(containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) {
    return (
      <React.Fragment>
        <Crosshair />
        <XYChart forwardStageRef={forwardStageRef} />
        <Tooltip getChartContainerRef={containerRef} />
        <AnnotationTooltip getChartContainerRef={containerRef} />
        <Highlighter />
        <BrushTool />
      </React.Fragment>
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
  eventCallbacks(globalState: GlobalChartState) {
    this.onElementOverCaller(globalState);
    this.onElementOutCaller(globalState);
    this.onElementClickCaller(globalState);
    this.onBrushEndCaller(globalState);
    this.onPointerMoveCaller(globalState);
  }
}
