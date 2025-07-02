/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesDomainsSelector } from './compute_series_domains';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { createAxisDescriptions } from '../../../../components/accessibility/axis_summary_utils';
import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';

/** @internal */
export interface XYChartScreenReaderData {
  seriesSpecs: ReturnType<typeof getSeriesSpecsSelector>;
  axisSpecs: ReturnType<typeof getAxisSpecsSelector>;
  seriesDomains: ReturnType<typeof computeSeriesDomainsSelector>;
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getSeriesSpecsSelector, getAxisSpecsSelector, computeSeriesDomainsSelector],
  (seriesSpecs, axisSpecs, seriesDomains): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

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
