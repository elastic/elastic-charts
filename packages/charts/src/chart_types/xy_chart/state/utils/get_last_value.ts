/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LastValues } from './types';
import { SeriesKey } from '../../../../common/series_id';
import { XDomain } from '../../domains/types';
import { isDatumFilled } from '../../rendering/utils';
import { DataSeries, getSeriesKey, XYChartSeriesIdentifier } from '../../utils/series';
import { StackMode } from '../../utils/specs';

/**
 * @internal
 * @param dataSeries
 * @param xDomain
 */
export function getLastValues(dataSeries: DataSeries[], xDomain: XDomain): Map<SeriesKey, LastValues> {
  const lastValues = new Map<SeriesKey, LastValues>();

  // we need to get the latest
  dataSeries.forEach((series) => {
    if (series.data.length === 0) {
      return;
    }

    const last = series.data.at(-1);
    if (!last) {
      return;
    }
    if (isDatumFilled(last)) {
      return;
    }

    if (last.x !== xDomain.domain.at(-1)) {
      // we have a dataset that is not filled with all x values
      // and the last value of the series is not the last value for every series
      // let's skip it
      return;
    }

    const { y0, y1, initialY0, initialY1 } = last;
    const seriesKey = getSeriesKey(series as XYChartSeriesIdentifier, series.groupId);

    if (series.stackMode === StackMode.Percentage) {
      const y1InPercentage = y1 === null || y0 === null ? null : y1 - y0;
      lastValues.set(seriesKey, { y0, y1: y1InPercentage });
      return;
    }
    if (initialY0 !== null || initialY1 !== null) {
      lastValues.set(seriesKey, { y0: initialY0, y1: initialY1 });
    }
  });
  return lastValues;
}
