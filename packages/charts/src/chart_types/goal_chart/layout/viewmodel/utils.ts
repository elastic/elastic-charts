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

/**
 * Returns limiting angle form π/2 towards 3/2π from left and right
 */
const controllingAngle = (...angles: Radian[]): Radian =>
  angles.reduce((limitAngle, a) => {
    if (a >= Math.PI / 2 && a <= (3 / 2) * Math.PI) {
      const newA = Math.abs(a - Math.PI / 2);
      return Math.max(limitAngle, newA);
    }
    if (a >= -Math.PI / 2 && a <= Math.PI / 2) {
      const newA = Math.abs(a - Math.PI / 2);
      return Math.max(limitAngle, newA);
    }
    return limitAngle;
  }, LIMITING_ANGLE);

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
