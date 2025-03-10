/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { canDisplayChartTitles } from './selectors/can_display_chart_titles';
import { ChartType } from '../..';
import { DEFAULT_CSS_CURSOR } from '../../../common/constants';
import { EMPTY_LEGEND_LIST, EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../../../common/legend';
import type { GlobalChartState, InternalChartState } from '../../../state/chart_state';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { EMPTY_LEGEND_ITEM_LIST } from '../../../state/selectors/get_legend_items_labels';
import { Metric } from '../renderer/dom';

/** @internal */
export class MetricState implements InternalChartState {
  chartType = ChartType.Metric;
  getChartTypeDescription = () => 'Metric chart';
  chartRenderer = () => <Metric />;
  isInitialized = () => InitStatus.Initialized;
  isBrushAvailable = () => false;
  isBrushing = () => false;
  isChartEmpty = () => false;
  getLegendItems = () => EMPTY_LEGEND_LIST;
  getLegendItemsLabels = () => EMPTY_LEGEND_ITEM_LIST;
  getLegendExtraValues = () => EMPTY_LEGEND_ITEM_EXTRA_VALUES;
  getPointerCursor = () => DEFAULT_CSS_CURSOR;
  isTooltipVisible = () => ({
    visible: false,
    isExternal: false,
    displayOnly: false,
    isPinnable: false,
  });

  getTooltipInfo = () => undefined;
  getTooltipAnchor = () => null;
  eventCallbacks = () => {};
  getProjectionContainerArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
  getMainProjectionArea = () => ({ width: 0, height: 0, top: 0, left: 0 });
  getBrushArea = () => null;
  getDebugState = () => ({});
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
