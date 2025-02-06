/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject } from 'react';

import { getChartTypeDescriptionSelector } from './selectors/get_chart_type_description';
import { getGoalSpecSelector } from './selectors/get_goal_spec';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnElementClickCaller } from './selectors/on_element_click_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { getTooltipInfoSelector } from './selectors/tooltip';
import { ChartType } from '../..';
import { DEFAULT_CSS_CURSOR } from '../../../common/constants';
import { EMPTY_LEGEND_LIST, EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../../../common/legend';
import { Tooltip } from '../../../components/tooltip/tooltip';
import { InternalChartState, GlobalChartState, BackwardRef, TooltipVisibility } from '../../../state/chart_state';
import { getActivePointerPosition } from '../../../state/selectors/get_active_pointer_position';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { EMPTY_LEGEND_ITEM_LIST } from '../../../state/selectors/get_legend_items_labels';
import { DebugState } from '../../../state/types';
import { Dimensions } from '../../../utils/dimensions';
import { Goal } from '../renderer/canvas/connected_component';

/** @internal */
export class GoalState implements InternalChartState {
  chartType = ChartType.Goal;

  onElementClickCaller: (state: GlobalChartState) => void;

  onElementOverCaller: (state: GlobalChartState) => void;

  onElementOutCaller: (state: GlobalChartState) => void;

  constructor() {
    this.onElementClickCaller = createOnElementClickCaller();
    this.onElementOverCaller = createOnElementOverCaller();
    this.onElementOutCaller = createOnElementOutCaller();
  }

  isInitialized(globalState: GlobalChartState) {
    return getGoalSpecSelector(globalState) !== null ? InitStatus.Initialized : InitStatus.ChartNotInitialized;
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

  getLegendItems() {
    return EMPTY_LEGEND_LIST;
  }

  getLegendItemsLabels() {
    return EMPTY_LEGEND_ITEM_LIST;
  }

  getLegendExtraValues() {
    return EMPTY_LEGEND_ITEM_EXTRA_VALUES;
  }

  chartRenderer(containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) {
    return (
      <>
        <Tooltip getChartContainerRef={containerRef} />
        <Goal forwardStageRef={forwardStageRef} />
      </>
    );
  }

  getPointerCursor() {
    return DEFAULT_CSS_CURSOR;
  }

  isTooltipVisible(globalState: GlobalChartState): TooltipVisibility {
    return {
      visible: isTooltipVisibleSelector(globalState),
      isExternal: false,
      displayOnly: false,
      isPinnable: false,
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

  getChartTypeDescription(globalState: GlobalChartState) {
    return getChartTypeDescriptionSelector(globalState);
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

  // TODO
  getDebugState(): DebugState {
    return {};
  }

  getSmallMultiplesDomains() {
    return {
      smHDomain: [],
      smVDomain: [],
    };
  }

  // TODO enable for small multiples
  canDisplayChartTitles = () => false;
}
