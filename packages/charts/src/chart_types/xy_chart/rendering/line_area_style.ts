/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RecursivePartial, mergePartial } from '../../../utils/common';
import { AreaSeriesStyle, LineSeriesStyle } from '../../../utils/themes/theme';

// Typings does play well here
// /** @internal */
// export function getLineAreaSeriesStyles<T extends LineSeriesStyle | AreaSeriesStyle>(
//   baseStyle: T,
//   seriesStyle?: RecursivePartial<T>,
// ): T {
//   if (!seriesStyle) return baseStyle;

//   const isolatedPointStyleOverrides = mergePartial<T['isolatedPoint']>(
//     baseStyle.isolatedPoint,
//     seriesStyle.isolatedPoint,
//     undefined,
//     seriesStyle.point ? [seriesStyle.point] : [],
//   );
//   console.log(isolatedPointStyleOverrides);

//   return mergePartial(baseStyle, { isolatedPoint: isolatedPointStyleOverrides }, undefined, [seriesStyle]);
// }

/** @internal */
export function getLineSeriesStyles(
  baseStyle: LineSeriesStyle,
  seriesStyle?: RecursivePartial<LineSeriesStyle>,
): LineSeriesStyle {
  if (!seriesStyle) return baseStyle;

  const isolatedPointStyleOverrides = mergePartial<LineSeriesStyle['isolatedPoint']>(
    baseStyle.isolatedPoint,
    seriesStyle.isolatedPoint,
    undefined,
    seriesStyle.point ? [seriesStyle.point] : [],
  );

  return mergePartial(baseStyle, { isolatedPoint: isolatedPointStyleOverrides }, undefined, [seriesStyle]);
}

/** @internal */
export function getAreaSeriesStyles(
  baseStyle: AreaSeriesStyle,
  seriesStyle?: RecursivePartial<AreaSeriesStyle>,
): AreaSeriesStyle {
  if (!seriesStyle) return baseStyle;

  const isolatedPointStyleOverrides = mergePartial<AreaSeriesStyle['isolatedPoint']>(
    baseStyle.isolatedPoint,
    seriesStyle.isolatedPoint,
    undefined,
    seriesStyle.point ? [seriesStyle.point] : [],
  );

  return mergePartial(baseStyle, { isolatedPoint: isolatedPointStyleOverrides }, undefined, [seriesStyle]);
}
