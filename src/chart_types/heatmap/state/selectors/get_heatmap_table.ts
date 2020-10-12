/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import createCachedSelector from 're-reselect';

import { ScaleType } from '../../../../scales/constants';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getAccessorValue } from '../../../../utils/accessor';
import { mergeXDomain } from '../../../xy_chart/domains/x_domain';
import { getPredicateFn } from '../../utils/commons';
import { HeatmapTable } from './compute_chart_dimensions';
import { getHeatmapSpecSelector } from './get_heatmap_spec';

/**
 * Extracts axis and cell values from the input data.
 * @internal
 */
export const getHeatmapTableSelector = createCachedSelector(
  [getHeatmapSpecSelector, getSettingsSpecSelector],
  (spec, settingsSpec): HeatmapTable => {
    const { data, valueAccessor, xAccessor, yAccessor, xSortPredicate, ySortPredicate } = spec;
    const { xDomain } = settingsSpec;

    const resultData = data.reduce(
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

    // FIXME, typing for mergeXDomain without seriesType
    // @ts-ignore
    resultData.xDomain = mergeXDomain([{ xScaleType: spec.xScaleType }], resultData.xValues, xDomain);

    // sort values by their predicates
    if (spec.xScaleType === ScaleType.Ordinal) {
      resultData.xDomain.domain.sort(getPredicateFn(xSortPredicate));
    }
    resultData.yValues.sort(getPredicateFn(ySortPredicate));

    return resultData;
  },
)(getChartIdSelector);
