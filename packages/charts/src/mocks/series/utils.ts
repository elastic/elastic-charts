/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getYDatumValueFn } from '../../chart_types/xy_chart/rendering/utils';
import type { DataSeriesDatum } from '../../chart_types/xy_chart/utils/series';

/**
 * Helper function to return array of rendered y1 values
 * @internal
 */
export const getFilledNullData = (data: DataSeriesDatum[]): (number | undefined)[] =>
  data.filter(({ filled }) => filled?.y1 !== undefined).map(({ filled }) => filled?.y1);

/**
 * Helper function to return array of rendered y1 values
 * @internal
 */
export const getFilledNonNullData = (data: DataSeriesDatum[]): (number | undefined)[] =>
  data.filter(({ y1, filled }) => y1 !== null && filled?.y1 === undefined).map(({ filled }) => filled?.y1);

/**
 * Helper function to return array of rendered x values
 * @internal
 */
export const getXValueData = (data: DataSeriesDatum[]): (number | string)[] => data.map(({ x }) => x);

/**
 * Returns value of `y1` or `filled.y1` or null
 * @internal
 */
export const getYResolvedData = (data: DataSeriesDatum[]): (number | null)[] => {
  const datumAccessor = getYDatumValueFn();
  return data.map((d) => {
    return datumAccessor(d);
  });
};
