/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Radian } from './geometry';

/** @internal */
export type Vec2 = [number, number];

/**
 * Rotate a Vec2 vector by radians
 * @param radian
 * @param vec2
 */
function rotate2(radian: Radian, vec2: Vec2): Vec2 {
  return [
    Math.cos(radian) * vec2[0] - Math.sin(radian) * vec2[1],
    Math.sin(radian) * vec2[0] + Math.cos(radian) * vec2[1],
  ];
}

/**
 * Add two Vec2
 * @param a Vec2
 * @param b Vec2
 */
function add2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}

/**
 * Add Vec2 b from a
 * @param a Vec2
 * @param b Vec2
 */
function sub2(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

/**
 * Rotate a Vec2 around an origin
 * @internal
 */
export function transform2(point: Vec2, radians: Radian, origin: Vec2): Vec2 {
  const t1 = sub2(point, origin);
  const r1 = rotate2(radians, t1);
  return add2(r1, origin);
}
