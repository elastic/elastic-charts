/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderPoints } from './points';
import type { MarkSizeOptions } from './utils';
import type { Color } from '../../../common/colors';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import type { Dimensions } from '../../../utils/dimensions';
import type { BubbleGeometry } from '../../../utils/geometry';
import type { BubbleSeriesStyle } from '../../../utils/themes/theme';
import type { IndexedGeometryMap } from '../utils/indexed_geometry_map';
import type { DataSeries } from '../utils/series';
import { getSeriesIdentifierFromDataSeries } from '../utils/series';
import type { PointStyleAccessor } from '../utils/specs';

/** @internal */
export function renderBubble(
  shift: number,
  dataSeries: DataSeries,
  xScale: ScaleContinuous | ScaleBand,
  yScale: ScaleContinuous,
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
    // there is no concept of isolated point in bubble chart, so we mark it as invisible
    { ...seriesStyle.point, visible: 'never' },
    // there is no need to know the line stroke width to compute the isolated point radius
    NaN,
    hasY0Accessors,
    markSizeOptions,
    !isMixedChart,
    // don't allow rendering of isolated points
    false,
    pointStyleAccessor,
  );

  const bubbleGeometry = {
    points: pointGeometries,
    color,
    seriesIdentifier: getSeriesIdentifierFromDataSeries(dataSeries),
    seriesPointStyle: seriesStyle.point,
  };
  return {
    bubbleGeometry,
    indexedGeometryMap,
  };
}
