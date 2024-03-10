/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject } from 'react';

import { BulletRenderer } from './renderer/canvas';
import { canDisplayChartTitles } from './selectors/can_display_chart_titles';
import { getDebugStateSelector } from './selectors/get_debug_state';
import { getTooltipAnchor } from './selectors/get_tooltip_anchor';
import { getTooltipInfo } from './selectors/get_tooltip_info';
import { isTooltipVisible } from './selectors/is_tooltip_visible';
import { ChartType } from '../../chart_types';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { LegendItem } from '../../common/legend';
import { Tooltip } from '../../components/tooltip/tooltip';
import { BackwardRef, GlobalChartState, InternalChartState } from '../../state/chart_state';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { LegendItemLabel } from '../../state/selectors/get_legend_items_labels';

const EMPTY_MAP = new Map();
const EMPTY_LEGEND_LIST: LegendItem[] = [];
const EMPTY_LEGEND_ITEM_LIST: LegendItemLabel[] = [];

/** @internal */
export class BulletState implements InternalChartState {
  chartType = ChartType.Bullet;
  getChartTypeDescription = () => 'Bullet chart';
  chartRenderer = (containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) => (
    <>
      <BulletRenderer forwardStageRef={forwardStageRef} />
      <Tooltip getChartContainerRef={containerRef} />
    </>
  );

  isInitialized = () => InitStatus.Initialized;
  isBrushAvailable = () => false;
  isBrushing = () => false;
  isChartEmpty = () => false;
  getLegendItems = () => EMPTY_LEGEND_LIST;
  getLegendItemsLabels = () => EMPTY_LEGEND_ITEM_LIST;
  getLegendExtraValues = () => EMPTY_MAP;
  getPointerCursor = () => DEFAULT_CSS_CURSOR;
  isTooltipVisible(globalState: GlobalChartState) {
    return isTooltipVisible(globalState);
  }

  getTooltipInfo(globalState: GlobalChartState) {
    return getTooltipInfo(globalState);
  }

  getTooltipAnchor(globalState: GlobalChartState) {
    return getTooltipAnchor(globalState);
  }

  eventCallbacks = () => {};
  getProjectionContainerArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
  getMainProjectionArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
  getBrushArea = () => null;
  getDebugState = (state: GlobalChartState) => getDebugStateSelector(state);
  getSmallMultiplesDomains() {
    return {
      smHDomain: [],
      smVDomain: [],
    };
  }

  canDisplayChartTitles(globalState: GlobalChartState) {
    return canDisplayChartTitles(globalState);
  }
}
