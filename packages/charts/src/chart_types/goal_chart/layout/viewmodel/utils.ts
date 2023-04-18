/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TAU } from '../../../../common/constants';
import { Radian } from '../../../../common/geometry';
import { round } from '../../../../utils/common';

/**
 * Set to half circle such that anything smaller than a half circle will not
 * continue to increase offset
 */
const LIMITING_ANGLE = Math.PI / 2;

/**
 * Angles are relative to mathematical angles of a unit circle from -2π > θ > 2π
 */
const hasTopGap = (angleStart: Radian, angleEnd: Radian): boolean => {
  const [a, b] = ([angleStart, angleEnd] as [number, number]).sort();
  return a <= -Math.PI / 2 && a >= (-Math.PI * 3) / 2 && b >= -Math.PI / 2 && b <= Math.PI / 2;
};

/**
 * Angles are relative to mathematical angles of a unit circle from -2π > θ > 2π
 */
const hasBottomGap = (angleStart: Radian, angleEnd: Radian): boolean => {
  const [a, b] = ([angleStart, angleEnd] as [number, number]).sort();
  return a >= -Math.PI / 2 && a <= Math.PI / 2 && b < (Math.PI * 3) / 2 && b >= Math.PI / 2;
};

/**
 * Angles are relative to mathematical angles of a unit circle from -2π > θ > 2π
 */
const isOnlyTopHalf = (angleStart: Radian, angleEnd: Radian): boolean => {
  const [a, b] = ([angleStart, angleEnd] as [number, number]).sort();
  return a >= 0 && b <= Math.PI;
};

/**
 * Angles are relative to mathematical angles of a unit circle from -2π > θ > 2π
 */
const isOnlyBottomHalf = (angleStart: Radian, angleEnd: Radian): boolean => {
  const [a, b] = ([angleStart, angleEnd] as [number, number]).sort();
  return (a >= Math.PI && b <= 2 * Math.PI) || (a >= -Math.PI && b <= 0);
};

/**
 * Angles are relative to mathematical angles of a unit circle from -2π > θ > 2π
 */
const isWithinLimitedDomain = (angleStart: Radian, angleEnd: Radian): boolean => {
  const [a, b] = ([angleStart, angleEnd] as [number, number]).sort();
  return a > -2 * Math.PI && b < 2 * Math.PI;
};

/** @internal */
export const getTransformDirection = (angleStart: Radian, angleEnd: Radian): 1 | -1 =>
  hasTopGap(angleStart, angleEnd) || isOnlyBottomHalf(angleStart, angleEnd) ? -1 : 1;

/**
 * Returns limiting angle form π/2 towards 3/2π from left and right, top and bottom
 * Angles are relative to mathematical angles of a unit circle from -2π > θ > 2π
 */
const controllingAngle = (angleStart: Radian, angleEnd: Radian): number => {
  if (!isWithinLimitedDomain(angleStart, angleEnd)) return LIMITING_ANGLE * 2;
  if (isOnlyTopHalf(angleStart, angleEnd) || isOnlyBottomHalf(angleStart, angleEnd)) return LIMITING_ANGLE;
  if (!hasTopGap(angleStart, angleEnd) && !hasBottomGap(angleStart, angleEnd)) return LIMITING_ANGLE * 2;
  const offset = hasBottomGap(angleStart, angleEnd) ? -Math.PI / 2 : Math.PI / 2;
  return Math.max(Math.abs(angleStart + offset), Math.abs(angleEnd + offset), LIMITING_ANGLE);
};

/**
 * Normalize angles to minimum equivalent pair within -2π >= θ >= 2π
 * Assumes angles are no more that 2π apart.
 * @internal
 */
export function normalizeAngles(angleStart: Radian, angleEnd: Radian): [angleStart: Radian, angleEnd: Radian] {
  const maxOffset = Math.max(Math.ceil(Math.abs(angleStart) / TAU), Math.ceil(Math.abs(angleEnd) / TAU)) - 1;
  const offsetDirection = angleStart > 0 && angleEnd > 0 ? -1 : 1;
  const offset = offsetDirection * maxOffset * TAU;
  return [angleStart + offset, angleEnd + offset];
}

/**
 * Angles are relative to mathmatical angles of a unit circle from -2π > θ > 2π
 * @internal
 */
export function getSagitta(angle: Radian, radius: number, fractionDigits: number = 1) {
  const arcLength = angle * radius;
  const halfCord = radius * Math.sin(arcLength / (2 * radius));
  const lengthMiltiplier = arcLength > Math.PI ? 1 : -1;
  const sagitta = radius + lengthMiltiplier * Math.sqrt(Math.pow(radius, 2) - Math.pow(halfCord, 2));
  return round(sagitta, fractionDigits);
}

/**
 * Angles are relative to mathmatical angles of a unit circle from -2π > θ > 2π
 * @internal
 */
export function getMinSagitta(angleStart: Radian, angleEnd: Radian, radius: number, fractionDigits?: number) {
  const normalizedAngles = normalizeAngles(angleStart, angleEnd);
  const limitingAngle = controllingAngle(...normalizedAngles);
  return getSagitta(limitingAngle * 2, radius, fractionDigits);
}
