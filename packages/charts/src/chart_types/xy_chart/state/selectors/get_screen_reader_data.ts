/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesDomainsSelector } from './compute_series_domains';
import { getChartTypeDescriptionSelector } from './get_chart_type_description';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { createChartTypeDescription } from '../../../../components/accessibility/chart_summary_utils';
import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { createAxisDescriptions } from '../../utils/axis_summary_utils';

/** @internal */
export interface XYChartScreenReaderData {
  seriesSpecs: ReturnType<typeof getSeriesSpecsSelector>;
  axisSpecs: ReturnType<typeof getAxisSpecsSelector>;
  seriesDomains: ReturnType<typeof computeSeriesDomainsSelector>;
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getSeriesSpecsSelector, getAxisSpecsSelector, computeSeriesDomainsSelector, getChartTypeDescriptionSelector],
  (seriesSpecs, axisSpecs, seriesDomains, chartTypeDescription): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

    // Chart type description with series details
    const chartDescription = createChartTypeDescription(chartTypeDescription, seriesSpecs, seriesDomains);
    if (chartDescription) {
      summaryParts.push(chartDescription);
    }

    // Axis descriptions
    if (axisSpecs.length > 0) {
      const axisDescriptions = createAxisDescriptions(axisSpecs, seriesDomains);
      summaryParts.push(...axisDescriptions);
    }

    return {
      data: {
        seriesSpecs,
        axisSpecs,
        seriesDomains,
      } as XYChartScreenReaderData,
      summaryParts,
    };
  },
);
