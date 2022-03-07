/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Radian } from '../../../../common/geometry';
import { round } from '../../../../utils/common';

/**
 * Set to half circle such that anything smaller than a half circle will not
 * continue to increase offset
 */
const LIMITING_ANGLE = Math.PI / 2;

const hasTopGap = (startAngle: Radian, endAngle: Radian): boolean => {
  const [a, b] = [startAngle, endAngle].sort();
  return a <= -Math.PI / 2 && a >= (-Math.PI * 3) / 2 && b >= -Math.PI / 2 && b <= Math.PI / 2;
};

const hasBottomGap = (startAngle: Radian, endAngle: Radian): boolean => {
  const [a, b] = [startAngle, endAngle].sort();
  return a >= -Math.PI / 2 && a <= Math.PI / 2 && b < (Math.PI * 3) / 2 && b >= Math.PI / 2;
};

const isOnlyTopHalf = (startAngle: Radian, endAngle: Radian): boolean => {
  const [a, b] = [startAngle, endAngle].sort();
  return a >= 0 && b <= Math.PI;
};

const isOnlyBottomHalf = (startAngle: Radian, endAngle: Radian): boolean => {
  const [a, b] = [startAngle, endAngle].sort();
  return (a >= Math.PI && b <= 2 * Math.PI) || (a >= -Math.PI && b <= 0);
};

const isWithinLimitedDomain = (startAngle: Radian, endAngle: Radian): boolean => {
  const [a, b] = [startAngle, endAngle].sort();
  return a > -2 * Math.PI && b < 2 * Math.PI;
};

/** @internal */
export const getTranformDirection = (startAngle: Radian, endAngle: Radian): 1 | -1 =>
  hasTopGap(startAngle, endAngle) || isOnlyBottomHalf(startAngle, endAngle) ? -1 : 1;

/**
 * Returns limiting angle form π/2 towards 3/2π from left and right, top and bottom
 */
const controllingAngle = (startAngle: Radian, endAngle: Radian): number => {
  if (!isWithinLimitedDomain(startAngle, endAngle)) return LIMITING_ANGLE * 2;
  if (isOnlyTopHalf(startAngle, endAngle) || isOnlyBottomHalf(startAngle, endAngle)) return LIMITING_ANGLE;
  if (!hasTopGap(startAngle, endAngle) && !hasBottomGap(startAngle, endAngle)) return LIMITING_ANGLE * 2;
  const offset = hasBottomGap(startAngle, endAngle) ? -Math.PI / 2 : Math.PI / 2;
  return Math.max(Math.abs(startAngle + offset), Math.abs(endAngle + offset), LIMITING_ANGLE);
};

/** @internal */
export function getSagitta(angle: Radian, radius: number, fractionDigits: number = 1) {
  const arcLength = angle * radius;
  const halfCord = radius * Math.sin(arcLength / (2 * radius));
  const lengthMiltiplier = arcLength > Math.PI ? 1 : -1;
  const sagitta = radius + lengthMiltiplier * Math.sqrt(Math.pow(radius, 2) - Math.pow(halfCord, 2));
  return round(sagitta, fractionDigits);
}

/** @internal */
export function getMinSagitta(startAngle: Radian, endAngle: Radian, radius: number, fractionDigits?: number) {
  const limitingAngle = controllingAngle(startAngle, endAngle);
  return getSagitta(limitingAngle * 2, radius, fractionDigits);
}
