/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

/**
 * The scale type
 * @public
 */
export const ScaleType = Object.freeze({
  /**
   * Treated as linear scale with ticks in base 2
   */
  LinearBinary: 'linear_binary' as const,
  Linear: 'linear' as const,
  Ordinal: 'ordinal' as const,
  Log: 'log' as const,
  Sqrt: 'sqrt' as const,
  Time: 'time' as const,
  Quantize: 'quantize' as const,
  Quantile: 'quantile' as const,
  Threshold: 'threshold' as const,
});

/**
 * The scale type
 * @public
 */
export type ScaleType = $Values<typeof ScaleType>;

/** @internal */
export const LOG_MIN_ABS_DOMAIN = 1;
