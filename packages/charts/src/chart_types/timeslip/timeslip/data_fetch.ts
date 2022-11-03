/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BinUnit, Interval } from '../../xy_chart/axes/timeslip/continuous_time_rasters';
import { GetData } from '../timeslip_api';
import { DataDemand } from './render/cartesian';
import { BoxplotRow } from './render/glyphs/boxplot';

type DataResponse = { stats: { minValue: number; maxValue: number }; rows: TimeslipDataRows };

/** @public */
export type TimeslipDataRows = Array<{ epochMs: number; boxplot?: BoxplotRow['boxplot']; value?: number }>;

/** @internal */
export interface DataState {
  valid: boolean;
  pending: boolean;
  lo: (Interval & Partial<Record<BinUnit, number>>) | null;
  hi: (Interval & Partial<Record<BinUnit, number>>) | null;
  binUnit: BinUnit;
  binUnitCount: number;
  dataResponse: DataResponse;
}

/** @internal */
export const invalid = (dataState: DataState, dataDemand: DataDemand) =>
  !dataState.valid ||
  dataState.binUnit !== dataDemand.binUnit ||
  dataState.binUnitCount !== dataDemand.binUnitCount ||
  (dataDemand.lo?.minimum ?? -Infinity) < (dataState.lo?.minimum ?? -Infinity) ||
  (dataDemand.hi?.minimum ?? Infinity) > (dataState.hi?.minimum ?? Infinity);

/** @internal */
export const updateDataState = (
  dataState: DataState,
  dataDemand: Parameters<GetData>[0],
  dataResponse: DataResponse,
) => {
  dataState.pending = false;
  dataState.valid = true;
  dataState.lo = dataDemand.lo;
  dataState.hi = dataDemand.hi;
  dataState.binUnit = dataDemand.binUnit;
  dataState.binUnitCount = dataDemand.binUnitCount;
  dataState.dataResponse = dataResponse;
};

/** @internal */
export const getNullDataState = (): DataState => ({
  valid: false,
  pending: false,
  lo: { minimum: Infinity, supremum: Infinity },
  hi: { minimum: -Infinity, supremum: -Infinity },
  binUnit: 'year',
  binUnitCount: NaN,
  dataResponse: { stats: { minValue: NaN, maxValue: NaN }, rows: [] },
});
