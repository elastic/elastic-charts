/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleType } from './constants';
import type { ScaleBand } from './scale_band';
import type { ScaleContinuous } from './scale_continuous';

/**
 * Check if a scale is logaritmic
 * @internal
 */
export function isLogarithmicScale(scale: ScaleContinuous) {
  return scale.type === ScaleType.Log;
}

/**
 * Check if a scale is Band
 * @internal
 */
export function isBandScale(scale: ScaleContinuous | ScaleBand): scale is ScaleBand {
  return scale.type === ScaleType.Ordinal;
}

/**
 * Check if a scale is continuous
 * @internal
 */
export function isContinuousScale(scale: ScaleContinuous | ScaleBand): scale is ScaleContinuous {
  return scale.type !== ScaleType.Ordinal;
}

/**
 * Options specific to log scales
 * @public
 */
export interface LogScaleOptions {
  /**
   * Min value to render on log scale
   *
   * Defaults to min value of domain, or LOG_MIN_ABS_DOMAIN if mixed polarity
   */
  logMinLimit?: number;
  /**
   * Base for log scale
   *
   * @defaultValue 10
   * (i.e. log base 10)
   */
  logBase?: number;
}
