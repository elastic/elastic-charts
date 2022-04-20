/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject } from 'react';

import { ChartType } from '../..';
import { DEFAULT_CSS_CURSOR } from '../../../common/constants';
import { LegendItem } from '../../../common/legend';
import { SpecType } from '../../../specs';
import { InternalChartState, GlobalChartState, BackwardRef } from '../../../state/chart_state';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { LegendItemLabel } from '../../../state/selectors/get_legend_items_labels';
import { DebugState } from '../../../state/types';
import { getSpecsFromStore } from '../../../state/utils';
import { Dimensions } from '../../../utils/dimensions';
import { Viz } from '../renderer/canvas/viz';
import { NewVizSpec } from '../specs';

const EMPTY_MAP = new Map();
const EMPTY_LEGEND_LIST: LegendItem[] = [];
const EMPTY_LEGEND_ITEM_LIST: LegendItemLabel[] = [];

/** @internal */
export class NewVizState implements InternalChartState {
  chartType = ChartType.Goal;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    // TODO add selectors that needs initialization
  }

  isInitialized(globalState: GlobalChartState) {
    return getSpecsFromStore<NewVizSpec>(globalState.specs, ChartType.NewViz, SpecType.Series).length > 0
      ? InitStatus.Initialized
      : InitStatus.ChartNotInitialized;
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
        <Viz forwardStageRef={forwardStageRef} />
      </>
    );
  }

  getPointerCursor() {
    return DEFAULT_CSS_CURSOR;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isTooltipVisible(globalState: GlobalChartState) {
    return { visible: false, isExternal: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTooltipInfo(globalState: GlobalChartState) {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTooltipAnchor(globalState: GlobalChartState) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eventCallbacks(globalState: GlobalChartState) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChartTypeDescription(globalState: GlobalChartState) {
    return 'TODO new chart type';
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
}
