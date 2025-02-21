/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { extent } from 'd3-array';

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import type { SmallMultiplesSeriesDomains } from '../../../../common/panel_utils';
import { getPredicateFn, Predicate } from '../../../../common/predicate';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSmallMultiplesIndexOrderSelector } from '../../../../state/selectors/get_small_multiples_index_order';
import { getAccessorValue } from '../../../../utils/accessor';
import { addIntervalToTime, timeRange } from '../../../../utils/chrono/elasticsearch';
import { isFiniteNumber, isNil, isNonNullablePrimitiveValue } from '../../../../utils/common';
import type { HeatmapCellDatum } from '../../layout/viewmodel/viewmodel';

/**
 * @internal
 */
export interface HeatmapTable extends SmallMultiplesSeriesDomains {
  table: Array<HeatmapCellDatum>;
  yValues: Array<string | number>;
  xValues: Array<string | number>;
  xNumericExtent: [number, number];
  extent: [number, number];
}

/**
 * Extracts axis and cell values from the input data.
 * @internal
 */
export const getHeatmapTableSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector, getSettingsSpecSelector, getSmallMultiplesIndexOrderSelector],
  (spec, { xDomain, locale }, smallMultiples): HeatmapTable => {
    const { data, valueAccessor, xAccessor, yAccessor, xSortPredicate, ySortPredicate, xScale, timeZone } = spec;
    const smVValues = new Set<string | number>();
    const smHValues = new Set<string | number>();
    const resultData = data.reduce<HeatmapTable>(
      (acc, curr, index) => {
        const x = getAccessorValue(curr, xAccessor);
        const y = getAccessorValue(curr, yAccessor);
        const value = getAccessorValue(curr, valueAccessor);

        if (!isNonNullablePrimitiveValue(x) || !isNonNullablePrimitiveValue(y)) {
          return acc;
        }
        // add a cell and update extent only if the value is finite
        if (isFiniteNumber(value)) {
          acc.extent = [Math.min(acc.extent[0], value), Math.max(acc.extent[1], value)];

          // extract small multiples aggregation values
          const smH = smallMultiples?.horizontal?.by?.(spec, curr);
          const smV = smallMultiples?.vertical?.by?.(spec, curr);

          if (!isNil(smH)) smHValues.add(smH);
          if (!isNil(smV)) smVValues.add(smV);

          acc.table.push({
            x,
            y,
            value,
            originalIndex: index,
            smVerticalAccessorValue: smV,
            smHorizontalAccessorValue: smH,
          });
        }
        // the x and y values are used for the scale domain, and we want to keep track of every element, even non-finite values
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
        smHDomain: [],
        smVDomain: [],
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
      resultData.xValues.sort(getPredicateFn(xSortPredicate, locale));
    }

    // sort Y values by their predicates
    resultData.yValues.sort(getPredicateFn(ySortPredicate, locale));

    // sort small multiples values
    const horizontalPredicate = smallMultiples?.horizontal?.sort ?? Predicate.DataIndex;
    const smHDomain = [...smHValues].sort(getPredicateFn(horizontalPredicate, locale));

    const verticalPredicate = smallMultiples?.vertical?.sort ?? Predicate.DataIndex;
    const smVDomain = [...smVValues].sort(getPredicateFn(verticalPredicate, locale));

    return {
      ...resultData,
      smHDomain,
      smVDomain,
    };
  },
);
