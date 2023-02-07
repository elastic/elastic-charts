/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GeometriesCounts } from './types';
import { LegendItem } from '../../../../common/legend';
import { getDistance, Rotation } from '../../../../utils/common';
import { Point } from '../../../../utils/point';
import { BasicSeriesSpec, SeriesType } from '../../utils/specs';

/** @internal */
export const MAX_ANIMATABLE_BARS = 300;
/** @internal */
export const MAX_ANIMATABLE_LINES_AREA_POINTS = 600;

/** @internal */
export function isHorizontalRotation(chartRotation: Rotation) {
  return chartRotation === 0 || chartRotation === 180;
}

/** @internal */
export function isVerticalRotation(chartRotation: Rotation) {
  return chartRotation === -90 || chartRotation === 90;
}
/**
 * Check if a specs map contains only line or area specs
 * @param specs Map<SpecId, BasicSeriesSpec>
 * @internal
 */
export function isLineAreaOnlyChart(specs: BasicSeriesSpec[]) {
  return !specs.some((spec) => spec.seriesType === SeriesType.Bar);
}

/** @internal */
export function isChartAnimatable(geometriesCounts: GeometriesCounts, animationEnabled: boolean): boolean {
  if (!animationEnabled) {
    return false;
  }
  const { bars, linePoints, areasPoints } = geometriesCounts;
  const isBarsAnimatable = bars <= MAX_ANIMATABLE_BARS;
  const isLinesAndAreasAnimatable = linePoints + areasPoints <= MAX_ANIMATABLE_LINES_AREA_POINTS;
  return isBarsAnimatable && isLinesAndAreasAnimatable;
}

/** @internal */
export function isAllSeriesDeselected(legendItems: LegendItem[]): boolean {
  // eslint-disable-next-line no-restricted-syntax
  for (const legendItem of legendItems) {
    if (!legendItem.isSeriesHidden) {
      return false;
    }
  }
  return true;
}

/**
 * Sorts points in order from closest to farthest from cursor
 * @internal
 */
export const sortClosestToPoint =
  (cursor: Point) =>
  (a: Point, b: Point): number => {
    return getDistance(cursor, a) - getDistance(cursor, b);
  };
