/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChartType } from '../../chart_types';
import type { ChartSelectors } from '../chart_selectors';
import type { GlobalChartState } from '../chart_state';

type ChartSelectorFactories = Record<ChartType, () => ChartSelectors | null>;

const chartSelectorsRegistryFactory = () => {
  let chartSelectorFactories: ChartSelectorFactories;

  return {
    setChartSelectors: (d: ChartSelectorFactories) => (chartSelectorFactories = d),
    getChartSelectors: (chartType: ChartType) => {
      if (!chartSelectorFactories?.[chartType]) {
        throw new Error(`No chart selector factory found for chart type ${chartType}`);
      }
      return chartSelectorFactories[chartType]();
    },
  };
};

/** @internal */
export const chartSelectorsRegistry = chartSelectorsRegistryFactory();

/** @internal */
export const getInternalChartStateSelector = (state: GlobalChartState) => {
  if (state.chartType === null) {
    return null;
  }

  return chartSelectorsRegistry.getChartSelectors(state.chartType);
};
