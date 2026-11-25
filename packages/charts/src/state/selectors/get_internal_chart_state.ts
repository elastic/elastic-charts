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
import { createCustomCachedSelector } from '../create_selector';

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

/**
 * The chart selectors of every chart type that a chart has been. A selector with no input computes once for a
 * chart, so they are made once: a chart that comes back to a type finds them, with what their callbacks remember.
 */
const getChartSelectorsByType = createCustomCachedSelector([], () => new Map<ChartType, ChartSelectors | null>());

/** @internal */
export const getInternalChartStateSelector = (state: GlobalChartState): ChartSelectors | null => {
  const { chartType } = state;
  if (chartType === null) return null;
  const byType = getChartSelectorsByType(state);
  const made = byType.get(chartType);
  if (made !== undefined) return made;
  const chartSelectors = chartSelectorsRegistry.getChartSelectors(chartType);
  byType.set(chartType, chartSelectors);
  return chartSelectors;
};
