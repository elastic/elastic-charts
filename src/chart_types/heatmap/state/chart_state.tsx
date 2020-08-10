/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { RefObject } from 'react';

import { ChartTypes } from '../..';
import { LegendItem } from '../../../commons/legend';
import { Tooltip } from '../../../components/tooltip';
import { InternalChartState, GlobalChartState, BackwardRef } from '../../../state/chart_state';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { LegendItemLabel } from '../../../state/selectors/get_legend_items_labels';
import { Heatmap } from '../renderer/canvas/connected_component';
import { getSpecOrNull } from './selectors/heatmap_spec';
import { isTooltipVisibleSelector } from './selectors/is_tooltip_visible';
import { createOnElementClickCaller } from './selectors/on_element_click_caller';
import { createOnElementOutCaller } from './selectors/on_element_out_caller';
import { createOnElementOverCaller } from './selectors/on_element_over_caller';
import { getTooltipInfoSelector } from './selectors/tooltip';

const EMPTY_MAP = new Map();
const EMPTY_LEGEND_LIST: LegendItem[] = [];
const EMPTY_LEGEND_ITEM_LIST: LegendItemLabel[] = [];

/** @internal */
export class HeatmapState implements InternalChartState {
  chartType = ChartTypes.Heatmap;

  onElementClickCaller: (state: GlobalChartState) => void;
  onElementOverCaller: (state: GlobalChartState) => void;
  onElementOutCaller: (state: GlobalChartState) => void;

  constructor() {
    this.onElementClickCaller = createOnElementClickCaller();
    this.onElementOverCaller = createOnElementOverCaller();
    this.onElementOutCaller = createOnElementOutCaller();
  }

  isInitialized(globalState: GlobalChartState) {
    return getSpecOrNull(globalState) !== null ? InitStatus.Initialized : InitStatus.ChartNotInitialized;
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
    return EMPTY_MAP;
  }

  chartRenderer(containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) {
    return (
      <>
        <Tooltip getChartContainerRef={containerRef} />
        <Heatmap forwardStageRef={forwardStageRef} />
      </>
    );
  }

  getPointerCursor() {
    return 'default';
  }

  isTooltipVisible(globalState: GlobalChartState) {
    return { visible: isTooltipVisibleSelector(globalState), isExternal: false };
  }

  getTooltipInfo(globalState: GlobalChartState) {
    return getTooltipInfoSelector(globalState);
  }

  getTooltipAnchor(state: GlobalChartState) {
    const { position } = state.interactions.pointer.current;
    return {
      isRotated: false,
      x1: position.x,
      y1: position.y,
    };
  }

  eventCallbacks(globalState: GlobalChartState) {
    this.onElementOverCaller(globalState);
    this.onElementOutCaller(globalState);
    this.onElementClickCaller(globalState);
  }
}
