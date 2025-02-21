/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Required, Assign } from 'utility-types';

/**
 * Base configurable bounds based on greater than, less than (equal to)
 *
 * `T` may be set to any value to be used as needed
 * @public
 */
export type BaseBoundsConfig<T = number> = {
  /**
   * Less than - The max value of the range, exclusive
   */
  lt?: T;
  /**
   * Less than or equal - The max value of the range, inclusive
   */
  lte?: T;
  /**
   * Greater than - The min value of the range, exclusive
   */
  gt?: T;
  /**
   * Greater than or equal - The min value of the range, inclusive
   */
  gte?: T;
};

/** @public */
export type BoundsLimiter<T, U extends keyof BaseBoundsConfig<T>> = Assign<
  BaseBoundsConfig<never>,
  Required<Pick<BaseBoundsConfig<T>, U>>
>;

/**
 * Allowed combination to define closed-ended/two-sided bounds
 * @public
 */
export type ClosedBoundsConfig<T> =
  | BoundsLimiter<T, 'lt' | 'gt'>
  | BoundsLimiter<T, 'lt' | 'gte'>
  | BoundsLimiter<T, 'lte' | 'gt'>
  | BoundsLimiter<T, 'lte' | 'gte'>;

/**
 * Allowed combination to define open-ended/one-sided bounds
 * @public
 */
export type OpenBoundsConfig<T> =
  | BoundsLimiter<T, 'lt'>
  | BoundsLimiter<T, 'lte'>
  | BoundsLimiter<T, 'gt'>
  | BoundsLimiter<T, 'gte'>;

/**
 * Open and closed bound configurations
 * @public
 */
export type OpenClosedBoundsConfig<T> = OpenBoundsConfig<T> | ClosedBoundsConfig<T>;
