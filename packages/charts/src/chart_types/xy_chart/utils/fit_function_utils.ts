/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { fitFunction } from './fit_function';
import type { DataSeries } from './series';
import type { SeriesSpecs, BasicSeriesSpec } from './specs';
import { isAreaSeriesSpec, isLineSeriesSpec } from './specs';
import type { ScaleType } from '../../../scales/constants';
import { isNil } from '../../../utils/common';
import { getSpecsById } from '../state/utils/spec';

/** @internal */
export const applyFitFunctionToDataSeries = (
  dataSeries: DataSeries[],
  seriesSpecs: SeriesSpecs,
  xScaleType: ScaleType,
): DataSeries[] => {
  return dataSeries.map(({ specId, data, ...rest }) => {
    const spec = getSpecsById<BasicSeriesSpec>(seriesSpecs, specId);

    if (!isNil(spec) && (isAreaSeriesSpec(spec) || isLineSeriesSpec(spec)) && spec.fit !== undefined) {
      const fittedData = fitFunction(data, spec.fit, xScaleType);

      return {
        specId,
        ...rest,
        data: fittedData,
      };
    }
    return { specId, data, ...rest };
  });
};
