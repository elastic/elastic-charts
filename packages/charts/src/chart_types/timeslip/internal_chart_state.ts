/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TimeslipWithTooltip } from './timeslip_chart';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { EMPTY_LEGEND_ITEM_EXTRA_VALUES, EMPTY_LEGEND_LIST } from '../../common/legend';
import { InternalChartState } from '../../state/internal_chart_state';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { EMPTY_LEGEND_ITEM_LIST } from '../../state/selectors/get_legend_items_labels';
import { ChartType } from '..';

/** @internal */
export class TimeslipState implements InternalChartState {
  chartType = ChartType.Timeslip;
  getChartTypeDescription = () => 'Timeslip chart';
  chartRenderer = TimeslipWithTooltip;

  // default empty properties, unused in Timeslip
  eventCallbacks = () => {};
  isInitialized = () => InitStatus.Initialized;
  isBrushAvailable = () => false;
  isBrushing = () => false;
  isChartEmpty = () => false;
  getLegendItemsLabels = () => EMPTY_LEGEND_ITEM_LIST;
  getLegendItems = () => EMPTY_LEGEND_LIST;
  getLegendExtraValues = () => EMPTY_LEGEND_ITEM_EXTRA_VALUES;
  getPointerCursor = () => DEFAULT_CSS_CURSOR;
  getTooltipAnchor = () => ({ x: 0, y: 0, width: 0, height: 0 });
  isTooltipVisible = () => ({
    visible: false,
    isExternal: false,
    displayOnly: false,
    isPinnable: false,
  });

  getTooltipInfo = () => ({ header: null, values: [] });
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

  canDisplayChartTitles = () => true;
}
