/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChartSelectorsFactory } from './chart_selectors';

/** @internal */
export const chartSelectorsBaseFactory: ChartSelectorsFactory = () => ({
  getChartTypeDescription: () => 'default',
  isInitialized: () => 'Initialized',

  isBrushAvailable: () => false,
  isBrushing: () => false,
  isChartEmpty: () => true,

  getLegendItemsLabels: () => [],
  getLegendItems: () => [],
  getLegendExtraValues: () => new Map(),

  getPointerCursor: () => 'default',
  isTooltipVisible: () => ({
    visible: false,
    isExternal: false,
    displayOnly: false,
    isPinnable: false,
  }),
  getTooltipInfo: () => ({ header: null, values: [] }),
  getTooltipAnchor: () => ({ x: 0, y: 0, width: 0, height: 0 }),

  eventCallbacks: () => {},

  getProjectionContainerArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),
  getMainProjectionArea: () => ({ width: 0, height: 0, top: 0, left: 0 }),
  getBrushArea: () => null,
  getDebugState: () => ({}),

  getSmallMultiplesDomains: () => ({
    smHDomain: [],
    smVDomain: [],
  }),
  canDisplayChartTitles: () => true,
});
