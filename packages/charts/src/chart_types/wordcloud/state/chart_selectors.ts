/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getWordcloudSpecSelector } from './selectors/wordcloud_spec';
import { DEFAULT_CSS_CURSOR } from '../../../common/constants';
import { EMPTY_LEGEND_ITEM_EXTRA_VALUES, EMPTY_LEGEND_LIST } from '../../../common/legend';
import type { ChartSelectorsFactory } from '../../../state/chart_selectors';
import type { GlobalChartState } from '../../../state/chart_state';
import { InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { EMPTY_LEGEND_ITEM_LIST } from '../../../state/selectors/shared';

const EMPTY_TOOLTIP = Object.freeze({ header: null, values: [] });

/** @internal */
export const chartSelectorsFactory: ChartSelectorsFactory = () => ({
  isInitialized: (state: GlobalChartState) =>
    getWordcloudSpecSelector(state) !== null ? InitStatus.Initialized : InitStatus.ChartNotInitialized,
  isBrushAvailable: () => false,
  isBrushing: () => false,
  isChartEmpty: () => false,
  getLegendItems: () => EMPTY_LEGEND_LIST,
  getLegendItemsLabels: () => EMPTY_LEGEND_ITEM_LIST,
  getLegendExtraValues: () => EMPTY_LEGEND_ITEM_EXTRA_VALUES,
  getPointerCursor: () => DEFAULT_CSS_CURSOR,
  isTooltipVisible: () => ({
    visible: false,
    isExternal: false,
    displayOnly: false,
    isPinnable: false,
  }),
  getTooltipInfo: () => EMPTY_TOOLTIP,
  getTooltipAnchor: (state: GlobalChartState) => {
    const { position } = state.interactions.pointer.current;
    return {
      isRotated: false,
      x: position.x,
      width: 0,
      y: position.y,
      height: 0,
    };
  },
  eventCallbacks: () => {},
  getChartTypeDescription: () => 'Word cloud chart',

  // TODO
  getProjectionContainerArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),

  // TODO
  getMainProjectionArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),

  // TODO
  getBrushArea: () => null,

  // TODO
  getDebugState: () => ({}),
  getSmallMultiplesDomains: () => ({
    smHDomain: [],
    smVDomain: [],
  }),
  canDisplayChartTitles: () => true,
});
