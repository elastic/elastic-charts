/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Size } from '../utils/dimensions';
import { Radian } from './geometry';

/**
 * Find the optimal rotation angle for a set of rectangles without overlapping.
 * The calculation consider equally distant rectangles with the same height and width.
 * The direction of the rotation depends on the selected cartesian quadrant.
 * The optimal rotation is constraint to the selected quadrant.
 * @internal
 * @param cartesianQuadrant
 * @param size The rectangle size
 * @param distance The distance between the rectangles
 */
export function optimalRectSetRotation(
  cartesianQuadrant: 1 | 2 | 3 | 4,
  { height, width }: Size,
  distance: number,
): Radian {
  const isFlat = distance > width;
  const ratio = Math.min(height / distance, 1);
  const sign = cartesianQuadrant === 1 || cartesianQuadrant === 3 ? -1 : 1;
  const rotateBy = cartesianQuadrant === 2 || cartesianQuadrant === 3 ? Math.PI : 0;
  const op = cartesianQuadrant === 1 || cartesianQuadrant === 2 ? 'acos' : 'asin';
  return isFlat ? rotateBy : Math[op](ratio) * sign + rotateBy;
}
