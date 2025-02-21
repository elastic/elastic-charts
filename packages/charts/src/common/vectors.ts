/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Radian } from './geometry';

/** @internal */
export type Vec2 = [number, number];

/**
 * Rotate a Vec2 vector by radians
 * @internal
 */
export function rotate2(radian: Radian, vector: Vec2): Vec2 {
  return [
    Math.cos(radian) * vector[0] - Math.sin(radian) * vector[1],
    Math.sin(radian) * vector[0] + Math.cos(radian) * vector[1],
  ];
}

/**
 * Subtract vector b from a
 * @internal
 */
export function sub2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}
