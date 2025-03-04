/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChartSliceState } from './chart_slice_state';
import { getInitialPointerState } from './utils/get_initial_pointer_state';
import { getInitialTooltipState } from './utils/get_initial_tooltip_state';
import { DEFAULT_SETTINGS_SPEC } from '../specs/default_settings_spec';

/** @internal */
export const getInitialState = (chartId: string, title?: string, description?: string): ChartSliceState => ({
  chartId,
  title,
  description,
  zIndex: 0,
  specsInitialized: false,
  specParsing: false,
  chartRendered: false,
  chartRenderedCount: 0,
  specs: {
    [DEFAULT_SETTINGS_SPEC.id]: DEFAULT_SETTINGS_SPEC,
  },
  colors: {
    temporary: {},
    persisted: {},
  },
  chartType: null,
  internalChartState: null,
  interactions: {
    pointer: getInitialPointerState(),
    highlightedLegendPath: [],
    deselectedDataSeries: [],
    hoveredDOMElement: null,
    drilldown: [],
    prevDrilldown: [],
    tooltip: getInitialTooltipState(),
  },
  externalEvents: {
    pointer: null,
  },
  parentDimensions: {
    height: 0,
    width: 0,
    left: 0,
    top: 0,
  },
});
