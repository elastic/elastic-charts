/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { fitFunction } from './fit_function';
import type { DataSeries } from './series';
import { isAreaSeriesSpec, isLineSeriesSpec } from './specs';
import type { ScaleType } from '../../../scales/constants';

/** @internal */
export const applyFitFunctionToDataSeries = (dataSeries: DataSeries[], xScaleType: ScaleType): DataSeries[] =>
  dataSeries.map((series) => {
    const { spec, data } = series;
    if ((!isAreaSeriesSpec(spec) && !isLineSeriesSpec(spec)) || spec.fit === undefined) return series;
    return { ...series, data: fitFunction(data, spec.fit, xScaleType, true) };
  });
