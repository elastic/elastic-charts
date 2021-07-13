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

/** @internal */
export const computeLegendSelector = createCustomCachedSelector(
  [getSpecOrNull, getColorScale, getDeselectedSeriesSelector],
  (spec, colorScale, deselectedDataSeries): LegendItem[] => {
    const legendItems: LegendItem[] = [];

    if (colorScale === null || spec === null) {
      return legendItems;
    }

    return colorScale.ticks.map((tick) => {
      const color = colorScale.config(tick);
      const seriesIdentifier = {
        key: String(tick),
        specId: String(tick),
      };

      return {
        color,
        label: `> ${spec.valueFormatter ? spec.valueFormatter(tick) : tick}`,
        seriesIdentifiers: [seriesIdentifier],
        isSeriesHidden: deselectedDataSeries.some((dataSeries) => dataSeries.key === seriesIdentifier.key),
        isToggleable: true,
        path: [{ index: 0, value: seriesIdentifier.key }],
        keys: [],
      };
    });
  },
);
