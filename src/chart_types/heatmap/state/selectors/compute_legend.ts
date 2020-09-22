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

import { LegendItem } from '../../../../commons/legend';
import { ScaleType } from '../../../../scales/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { LegendItemLabel } from '../../../../state/selectors/get_legend_items_labels';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getColorScale } from './get_color_scale';
import { getSpecOrNull } from './heatmap_spec';

export const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;

/** @internal */
export const computeLegendSelector = createCachedSelector(
  [getSpecOrNull, getColorScale, getDeselectedSeriesSelector],
  (spec, colorScale, deselectedDataSeries): LegendItem[] => {
    const legendItems: LegendItem[] = [];

    if (colorScale === null || spec === null) {
      return legendItems;
    }

    let ticks: number[] = [];

    if (colorScale.type === ScaleType.Linear) {
      ticks = colorScale.config.ticks(6);
    } else if (colorScale.type === ScaleType.Quantile) {
      ticks = colorScale.config.quantiles();
    } else if (colorScale.type === ScaleType.Quantize) {
      ticks = colorScale.config.ticks(spec.colors.length);
    } else if (colorScale.type === ScaleType.Threshold) {
      ticks = colorScale.config.domain();
    }
    return ticks.map((tick) => {
      const seriesIdentifier = {
        key: `from_${tick}`,
        specId: String(tick),
      };

      return {
        color: colorScale.config(tick),
        label: `> ${tick}`,
        seriesIdentifier,
        isSeriesHidden: deselectedDataSeries.some((dataSeries) => dataSeries.key === seriesIdentifier.key),
        isToggleable: true,
      };
    });
  },
)(getChartIdSelector);

export const getLegendItemsLabelsSelector = createCachedSelector(
  [computeLegendSelector, getSettingsSpecSelector],
  (legendItems, { showLegendExtra }): LegendItemLabel[] =>
    legendItems.map(({ label, defaultExtra }) => {
      if (defaultExtra?.formatted != null) {
        return { label: `${label}${showLegendExtra ? defaultExtra.formatted : ''}`, depth: 0 };
      }
      return { label, depth: 0 };
    }),
)(getChartIdSelector);
