/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getPredicateFn } from '../../../../common/predicate';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getAccessorValue } from '../../../../utils/accessor';
import { mergeXDomain } from '../../../xy_chart/domains/x_domain';
import { getXNiceFromSpec, getXScaleTypeFromSpec } from '../../../xy_chart/scales/get_api_scales';
import { X_SCALE_DEFAULT } from '../../specs/scale_defaults';
import { HeatmapTable } from './compute_chart_dimensions';
import { getHeatmapSpecSelector } from './get_heatmap_spec';

/**
 * Extracts axis and cell values from the input data.
 * @internal
 */
export const getHeatmapTableSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector, getSettingsSpecSelector],
  (spec, settingsSpec): HeatmapTable => {
    const { data, valueAccessor, xAccessor, yAccessor, xSortPredicate, ySortPredicate } = spec;

    const { table, xValues, yValues, extent } = data.reduce<
      Omit<HeatmapTable, 'xDomain'> & { xValues: Array<string | number> }
    >(
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
      },
    );

    const xDomain = mergeXDomain(
      {
        type: getXScaleTypeFromSpec(spec.xScaleType),
        nice: getXNiceFromSpec(),
        isBandScale: false,
        desiredTickCount: X_SCALE_DEFAULT.desiredTickCount,
        customDomain: settingsSpec.xDomain,
      },
      new Set(xValues),
    );

    const resultData: HeatmapTable = {
      table,
      xDomain,
      yValues,
      extent,
    };

    // sort values by their predicates
    if (spec.xScaleType === ScaleType.Ordinal) {
      resultData.xDomain.domain.sort(getPredicateFn(xSortPredicate));
    }
    resultData.yValues.sort(getPredicateFn(ySortPredicate));

    return resultData;
  },
);
