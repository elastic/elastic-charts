/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  curveBasis,
  curveCardinal,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from 'd3-shape';
import type { $Values } from 'utility-types';

/** @public */
export const CurveType = Object.freeze({
  CURVE_CARDINAL: 0 as const,
  CURVE_NATURAL: 1 as const,
  CURVE_MONOTONE_X: 2 as const,
  CURVE_MONOTONE_Y: 3 as const,
  CURVE_BASIS: 4 as const,
  CURVE_CATMULL_ROM: 5 as const,
  CURVE_STEP: 6 as const,
  CURVE_STEP_AFTER: 7 as const,
  CURVE_STEP_BEFORE: 8 as const,
  LINEAR: 9 as const,
});

/** @public */
export type CurveType = $Values<typeof CurveType>;

/** @internal */
export function getCurveFactory(curveType: CurveType = CurveType.LINEAR) {
  switch (curveType) {
    case CurveType.CURVE_CARDINAL:
      return curveCardinal;
    case CurveType.CURVE_NATURAL:
      return curveNatural;
    case CurveType.CURVE_MONOTONE_X:
      return curveMonotoneX;
    case CurveType.CURVE_MONOTONE_Y:
      return curveMonotoneY;
    case CurveType.CURVE_BASIS:
      return curveBasis;
    case CurveType.CURVE_CATMULL_ROM:
      return curveCatmullRom;
    case CurveType.CURVE_STEP:
      return curveStep;
    case CurveType.CURVE_STEP_AFTER:
      return curveStepAfter;
    case CurveType.CURVE_STEP_BEFORE:
      return curveStepBefore;
    case CurveType.LINEAR:
    default:
      return curveLinear;
  }
}
