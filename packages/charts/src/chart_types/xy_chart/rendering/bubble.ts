/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../../common/colors';
import { Scale } from '../../../scales';
import { Dimensions } from '../../../utils/dimensions';
import { BubbleGeometry } from '../../../utils/geometry';
import { BubbleSeriesStyle } from '../../../utils/themes/theme';
import { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import { DataSeries } from '../utils/series';
import { PointStyleAccessor } from '../utils/specs';
import { renderPoints } from './points';
import { MarkSizeOptions } from './utils';

/** @internal */
export function renderBubble(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale<number | string>,
  yScale: Scale<number>,
  color: Color,
  panel: Dimensions,
  hasY0Accessors: boolean,
  xScaleOffset: number,
  seriesStyle: BubbleSeriesStyle,
  markSizeOptions: MarkSizeOptions,
  isMixedChart: boolean,
  pointStyleAccessor?: PointStyleAccessor,
): {
  bubbleGeometry: BubbleGeometry;
  indexedGeometryMap: IndexedGeometryMap;
} {
  const { pointGeometries, indexedGeometryMap } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    panel,
    color,
    seriesStyle.point,
    hasY0Accessors,
    markSizeOptions,
    pointStyleAccessor,
    !isMixedChart,
  );

  const bubbleGeometry = {
    points: pointGeometries,
    color,
    seriesIdentifier: {
      key: dataSeries.key,
      specId: dataSeries.specId,
      yAccessor: dataSeries.yAccessor,
      splitAccessors: dataSeries.splitAccessors,
      seriesKeys: dataSeries.seriesKeys,
      smHorizontalAccessorValue: dataSeries.smHorizontalAccessorValue,
      smVerticalAccessorValue: dataSeries.smVerticalAccessorValue,
    },
    seriesPointStyle: seriesStyle.point,
  };
  return {
    bubbleGeometry,
    indexedGeometryMap,
  };
}
