/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ScaleType } from './constants';

/** @public */
export type ScaleContinuousType =
  | typeof ScaleType.LinearBinary
  | typeof ScaleType.Linear
  | typeof ScaleType.Time
  | typeof ScaleType.Log
  | typeof ScaleType.Sqrt;

/** @public */
export type ScaleOrdinalType = typeof ScaleType.Ordinal;

/** @public */
export type ScaleBandType = ScaleOrdinalType;

/** @internal */
export { ScaleBand } from './scale_band';

/** @internal */
export { ScaleContinuous } from './scale_continuous';

export type { LogScaleOptions } from './types';
