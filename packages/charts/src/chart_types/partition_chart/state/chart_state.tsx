/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RefObject } from 'react';

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
import { EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../../../common/legend';
import { GlobalChartState } from '../../../state/chart_state';
import { BackwardRef, InternalChartState } from '../../../state/internal_chart_state';
import { getActivePointerPosition } from '../../../state/selectors/get_active_pointer_position';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { DebugState } from '../../../state/types';
import { Dimensions } from '../../../utils/dimensions';
import { ChartType } from '../../chart_type';
import { render } from '../renderer/dom/layered_partition_chart';

/** @internal */
export class PartitionState implements InternalChartState {
  chartType = ChartType.Partition;

  onElementClickCaller: (state: GlobalChartState) => void;

  onElementOverCaller: (state: GlobalChartState) => void;

  onElementOutCaller: (state: GlobalChartState) => void;

  constructor() {
    this.onElementClickCaller = createOnElementClickCaller();
    this.onElementOverCaller = createOnElementOverCaller();
    this.onElementOutCaller = createOnElementOutCaller();
  }

  isInitialized(globalState: GlobalChartState) {
    return getPartitionSpec(globalState) !== null ? InitStatus.Initialized : InitStatus.SpecNotInitialized;
  }

  isBrushAvailable() {
    return false;
  }

  isBrushing() {
    return false;
  }

  isChartEmpty() {
    return false;
  }

  getLegendItemsLabels(globalState: GlobalChartState) {
    // order doesn't matter, but it needs to return the highest depth of the label occurrence so enough horizontal width is allocated
    // the label item strings needs to be a concatenation of the label + the extra formatted value if available.
    // this is required to compute the legend automatic width
    return getLegendItemsLabels(globalState);
  }

  getLegendItems(globalState: GlobalChartState) {
    return computeLegendSelector(globalState);
  }

  getLegendExtraValues() {
    return EMPTY_LEGEND_ITEM_EXTRA_VALUES;
  }

  chartRenderer(containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) {
    return render(containerRef, forwardStageRef);
  }

  getPointerCursor(globalState: GlobalChartState) {
    return getPointerCursorSelector(globalState);
  }

  isTooltipVisible(globalState: GlobalChartState) {
    return {
      visible: isTooltipVisibleSelector(globalState),
      isExternal: false,
      displayOnly: false,
      isPinnable: true,
    };
  }

  getTooltipInfo(globalState: GlobalChartState) {
    return getTooltipInfoSelector(globalState);
  }

  getTooltipAnchor(state: GlobalChartState) {
    const position = getActivePointerPosition(state);
    return {
      isRotated: false,
      x: position.x,
      width: 0,
      y: position.y,
      height: 0,
    };
  }

  eventCallbacks(globalState: GlobalChartState) {
    this.onElementOverCaller(globalState);
    this.onElementOutCaller(globalState);
    this.onElementClickCaller(globalState);
  }

  // TODO
  getProjectionContainerArea(): Dimensions {
    return { width: 0, height: 0, top: 0, left: 0 };
  }

  // TODO
  getMainProjectionArea(): Dimensions {
    return { width: 0, height: 0, top: 0, left: 0 };
  }

  // TODO
  getBrushArea(): Dimensions | null {
    return null;
  }

  getDebugState(state: GlobalChartState): DebugState {
    return getDebugStateSelector(state);
  }

  getChartTypeDescription(state: GlobalChartState): string {
    return getChartTypeDescriptionSelector(state);
  }

  getSmallMultiplesDomains() {
    return {
      smHDomain: [],
      smVDomain: [],
    };
  }

  canDisplayChartTitles = () => true;
}
