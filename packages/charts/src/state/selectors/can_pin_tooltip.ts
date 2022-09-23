/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 're-reselect';

import { ChartType } from '../../chart_types';
import { GlobalChartState } from '../chart_state';

/**
 * Enables tooltip pinning only for certain chart types
 */
const pinnableTooltipCharts = new Set<ChartType>([ChartType.XYAxis, ChartType.Heatmap, ChartType.Partition]);

/**
 * @internal
 */
export const isPinnableTooltip: Selector<GlobalChartState, boolean> = ({ chartType }) => {
  return Boolean(chartType && pinnableTooltipCharts.has(chartType));
};
