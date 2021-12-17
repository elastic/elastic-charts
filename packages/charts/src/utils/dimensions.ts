/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export interface Dimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** @internal */
export interface Size {
  width: number;
  height: number;
}

/**
 * fixme consider switching from `number` to `Pixels` or similar, once nominal typing is added
 * @public
 */
export interface PerSideDistance {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * fixme consider deactivating \@typescript-eslint/no-empty-interface
 * see https://github.com/elastic/elastic-charts/pull/660#discussion_r419474171
 * @public
 */
export type Margins = PerSideDistance;

/**
 * todo seperate type with parition padding type that allows number
 * @public
 */
export type Padding = PerSideDistance;

/**
 * Simple padding declaration
 * @public
 */
export interface SimplePadding {
  outer: number;
  inner: number;
}

/** @internal */
export const innerPad = (padding: number | Partial<SimplePadding>, minPadding = 0) =>
  Math.max(minPadding, typeof padding === 'number' ? padding : padding?.inner ?? 0);

/** @internal */
export const outerPad = (padding: number | Partial<SimplePadding>, minPadding = 0) =>
  Math.max(minPadding, typeof padding === 'number' ? padding : padding?.outer ?? 0);
