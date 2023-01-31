/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesDomainsSelector } from './compute_series_domains';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { DataSeries, getSeriesKey } from '../../utils/series';

/** @internal */
export const getSiDataSeriesMapSelector = createCustomCachedSelector(
  [computeSeriesDomainsSelector],
  ({ formattedDataSeries }) => {
    return formattedDataSeries.reduce<Record<string, DataSeries>>((acc, dataSeries) => {
      const seriesKey = getSeriesKey(dataSeries, dataSeries.groupId);
      acc[seriesKey] = dataSeries;
      return acc;
    }, {});
  },
);
