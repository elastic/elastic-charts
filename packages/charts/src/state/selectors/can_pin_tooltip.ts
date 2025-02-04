/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTooltipSpecSelector } from './get_tooltip_spec';
import { isExternalTooltipVisibleSelector } from './is_external_tooltip_visible';
import { ChartType } from '../../chart_types/chart_type';
import { getTooltipInfoAndGeomsSelector } from '../../chart_types/xy_chart/state/selectors/get_tooltip_values_highlighted_geoms';
import { GlobalChartState } from '../chart_state';
import { createCustomCachedSelector } from '../create_selector';

/**
 * Enables tooltip pinning only for certain chart types
 */
const pinnableTooltipCharts = new Set<ChartType>([
  ChartType.XYAxis,
  ChartType.Heatmap,
  ChartType.Partition,
  ChartType.Flame,
]);

const getChartType = ({ chartType }: GlobalChartState) => chartType;

/**
 * @internal
 */
export const isPinnableTooltip = createCustomCachedSelector(
  [getChartType, isExternalTooltipVisibleSelector, getTooltipSpecSelector, getTooltipInfoAndGeomsSelector],
  (
    chartType,
    isExternal,
    { maxVisibleTooltipItems, maxTooltipItems, actions },
    { tooltip, highlightedGeometries },
  ): boolean => {
    const isPinnableChartType = Boolean(chartType && pinnableTooltipCharts.has(chartType));
    const actionable = actions.length > 0 || !Array.isArray(actions);
    let hasHiddenSeries = false;

    if (chartType === ChartType.XYAxis) {
      const infoCount = tooltip.values.length;
      const highlightCount = highlightedGeometries.length;
      hasHiddenSeries =
        (infoCount > highlightCount && infoCount > maxTooltipItems) || infoCount > maxVisibleTooltipItems;
    }

    return isPinnableChartType && !isExternal && (hasHiddenSeries || actionable);
  },
);
