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

import { ScaleType } from '../../../..';
import { LegendItem } from '../../../../commons/legend';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { BandedAccessorType } from '../../../../utils/geometry';
import { getColorScale } from './color_scale';

/** @internal */
export const computeLegendSelector = createCachedSelector([getColorScale], (colorScale): LegendItem[] => {
  let legendItems: LegendItem[] = [];

  if (colorScale === null) {
    return legendItems;
  }

  if (colorScale.type === ScaleType.Linear) {
    const ticks = colorScale.config.ticks(6);

    legendItems = ticks.map((tick) => {
      return {
        color: colorScale.config(tick),
        label: `> ${tick}`,
        seriesIdentifier: {
          key: `d`,
          specId: '',
        },
        childId: BandedAccessorType.Y1,
        // isSeriesHidden,
        // isItemHidden: hideInLegend,
        isToggleable: true,
      };
    });
  } else if (colorScale.type === ScaleType.Quantile) {
    const ticks = colorScale.config.quantiles();

    legendItems = ticks.map((tick) => {
      return {
        color: colorScale.config(tick),
        label: `> ${tick}`,
        seriesIdentifier: {
          key: `d`,
          specId: '',
        },
        childId: BandedAccessorType.Y1,
        // isSeriesHidden,
        // isItemHidden: hideInLegend,
        isToggleable: true,
      };
    });
  } else if (colorScale.type === ScaleType.Quantize) {
    const ticks = colorScale.config.ticks(6);

    legendItems = ticks.map((tick) => {
      return {
        color: colorScale.config(tick),
        label: `> ${tick}`,
        seriesIdentifier: {
          key: `d`,
          specId: '',
        },
        childId: BandedAccessorType.Y1,
        // isSeriesHidden,
        // isItemHidden: hideInLegend,
        isToggleable: true,
      };
    });
  }
  return legendItems;
})(getChartIdSelector);
