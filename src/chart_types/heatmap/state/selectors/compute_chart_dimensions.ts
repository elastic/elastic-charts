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
import { max as d3Max } from 'd3-array';
import createCachedSelector from 're-reselect';

import { ChartTypes } from '../../..';
import { ScaleType } from '../../../../scales/constants';
import { SpecTypes } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getLegendSizeSelector } from '../../../../state/selectors/get_legend_size';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../../../state/utils';
import { mergePartial } from '../../../../utils/commons';
import { Dimensions } from '../../../../utils/dimensions';
import { Box } from '../../../partition_chart/layout/types/types';
import { measureText } from '../../../partition_chart/layout/utils/measure';
import { XDomain } from '../../../xy_chart/domains/types';
import { mergeXDomain } from '../../../xy_chart/domains/x_domain';
import { config as defaultConfig } from '../../layout/config/config';
import { Config } from '../../layout/types/config_types';
import { HeatmapCellDatum } from '../../layout/viewmodel/viewmodel';
import { HeatmapSpec } from '../../specs';
import { getPredicateFn } from '../../utils/commons';

/** @internal */
export interface HeatmapTable {
  table: Array<HeatmapCellDatum>;
  // unique set of column values
  xDomain: XDomain;
  // unique set of row values
  yValues: Array<string | number>;
  extent: [number, number];
}

const getSpecs = (state: GlobalChartState) => state.specs;

/** @internal */
export const getHeatmapSpec = createCachedSelector([getSpecs], (specs) => {
  const spec = getSpecsFromStore<HeatmapSpec>(specs, ChartTypes.Heatmap, SpecTypes.Series);
  return spec[0];
})(getChartIdSelector);

/** @internal */
export const getHeatmapConfig = createCachedSelector(
  [getHeatmapSpec],
  (spec): Config => {
    return mergePartial<Config>(defaultConfig, spec.config);
  },
)(getChartIdSelector);

/**
 * Extracts axis and cell values from the input data.
 * @internal
 */
export const getHeatmapTable = createCachedSelector(
  [getHeatmapSpec, getSettingsSpecSelector],
  (spec, settingsSpec): HeatmapTable => {
    const { data, valueAccessor, xAccessor, yAccessor, xSortPredicate, ySortPredicate } = spec;
    const { xDomain } = settingsSpec;

    const resultData = data.reduce(
      (acc, curr, index) => {
        const x = xAccessor(curr);

        const y = yAccessor(curr);
        const value = valueAccessor(curr);

        // compute the data domain extent
        const [min, max] = acc.extent;
        acc.extent = [Math.min(min, value), Math.max(max, value)];

        acc.table.push({
          x,
          y,
          value: valueAccessor(curr),
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

/**
 * Gets charts dimensions excluding legend and X,Y axis labels and paddings.
 * @internal
 */
export const computeChartDimensionsSelector = createCachedSelector(
  [getChartContainerDimensionsSelector, getLegendSizeSelector, getHeatmapTable, getHeatmapConfig],
  (chartContainerDimensions, legendSize, heatmapTable, config): Dimensions => {
    let { height, width, left } = chartContainerDimensions;
    const { top } = chartContainerDimensions;

    const textMeasurer = document.createElement('canvas');
    const textMeasurerCtx = textMeasurer.getContext('2d');
    const textMeasure = measureText(textMeasurerCtx!);

    if (config.yAxisLabel.visible) {
      // measure the text width of all rows values to get the grid area width
      const boxedYValues = heatmapTable.yValues.map<Box & { value: string | number }>((value) => {
        return {
          text: String(value),
          value,
          ...config.yAxisLabel,
        };
      });
      const measuredYValues = textMeasure(config.yAxisLabel.fontSize, boxedYValues);
      const maxTextWidth = d3Max(measuredYValues, ({ width }) => width) ?? 0;

      // let yColumnWidth: number = maxTextWidth;
      let yColumnWidth: number = maxTextWidth + config.yAxisLabel.padding;
      if (typeof config.yAxisLabel.maxWidth === 'number' && yColumnWidth > config.yAxisLabel.maxWidth) {
        yColumnWidth = config.yAxisLabel.maxWidth;
      }

      width -= yColumnWidth;
      left += yColumnWidth;
    }

    if (config.xAxisLabel.visible) {
      // compute the grid area height removing the bottom axis
      const maxTextHeight = config.yAxisLabel?.fontSize;
      height -= maxTextHeight + config.yAxisLabel.padding * 2;
    }

    const result = {
      height,
      width,
      top,
      left,
    };

    return result;
  },
)(getChartIdSelector);
