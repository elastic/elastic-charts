/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItem } from '../../../../common/legend';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getDeselectedSeriesSelector } from '../../../../state/selectors/get_deselected_data_series';
import { getColorScale } from './get_color_scale';
import { getSpecOrNull } from './heatmap_spec';

const EMPTY_LEGEND: LegendItem[] = [];
/** @internal */
export const computeLegendSelector = createCustomCachedSelector(
  [getSpecOrNull, getColorScale, getDeselectedSeriesSelector],
  (spec, { bands, scale }, deselectedDataSeries): LegendItem[] => {
    if (spec === null) {
      return EMPTY_LEGEND;
    }

    return bands.map(({ start, formattedStart }, i) => {
      const color = scale(start);
      const seriesIdentifier = {
        key: String(start),
        specId: String(start),
      };

      return {
        color,
        label: `${i === 0 ? '≥' : '>'} ${formattedStart}`,
        seriesIdentifiers: [seriesIdentifier],
        isSeriesHidden: deselectedDataSeries.some((dataSeries) => dataSeries.key === seriesIdentifier.key),
        isToggleable: true,
        path: [{ index: 0, value: seriesIdentifier.key }],
        keys: [],
      };
    });
  },
);
