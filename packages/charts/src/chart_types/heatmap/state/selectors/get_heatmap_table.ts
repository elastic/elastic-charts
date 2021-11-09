/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { extent } from 'd3-array';

import { getPredicateFn } from '../../../../common/predicate';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getAccessorValue } from '../../../../utils/accessor';
import { addIntervalToTime, timeRange } from '../../../../utils/chrono/elasticsearch';
import { HeatmapTable } from './compute_chart_dimensions';
import { getHeatmapConfigSelector } from './get_heatmap_config';
import { getHeatmapSpecSelector } from './get_heatmap_spec';

/**
 * Extracts axis and cell values from the input data.
 * @internal
 */
export const getHeatmapTableSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector, getSettingsSpecSelector, getHeatmapConfigSelector],
  (
    { data, valueAccessor, xAccessor, yAccessor, xSortPredicate, ySortPredicate, xScale },
    { xDomain },
    { timeZone },
  ): HeatmapTable => {
    const resultData = data.reduce<HeatmapTable>(
      (acc, curr, index) => {
        const x = getAccessorValue(curr, xAccessor);
        const y = getAccessorValue(curr, yAccessor);
        const value = getAccessorValue(curr, valueAccessor);

        // compute the data domain extent
        const [min, max] = acc.extent;
        acc.extent = [Math.min(min, value), Math.max(max, value)];

        acc.table.push({
          x,
          y,
          value,
          originalIndex: index,
        });

        if (!acc.xValues.includes(x)) {
          acc.xValues.push(x);
        }
        if (!acc.yValues.includes(y)) {
          acc.yValues.push(y);
        }

        return acc;
      },
      {
        table: [],
        xValues: [],
        yValues: [],
        extent: [+Infinity, -Infinity],
        xNumericExtent: [+Infinity, -Infinity],
      },
    );
    if (xScale.type === ScaleType.Time) {
      const [xDataMin = NaN, xDataMax = NaN] = extent(resultData.xValues as number[]);
      // to correctly compute the time extent from data, we need to add an interval to the max value of the dataset
      const dataMaxExtended = xDataMax ? addIntervalToTime(xDataMax, xScale.interval, timeZone) : NaN;

      const [customMin, customMax] = !Array.isArray(xDomain) ? [xDomain?.min ?? NaN, xDomain?.max ?? NaN] : [NaN, NaN];
      const [min, max] = extent([xDataMin, customMin, customMax, dataMaxExtended]);
      resultData.xNumericExtent = [min ?? NaN, max ?? NaN];
      resultData.xValues =
        isFiniteNumber(min) && isFiniteNumber(max) ? timeRange(min, max, xScale.interval, timeZone) : [];
    } else if (xScale.type === ScaleType.Ordinal) {
      resultData.xValues.sort(getPredicateFn(xSortPredicate));
    }

    // sort Y values by their predicates
    resultData.yValues.sort(getPredicateFn(ySortPredicate));

    return resultData;
  },
);

function isFiniteNumber(value: number | undefined): value is number {
  return Number.isFinite(value);
}
