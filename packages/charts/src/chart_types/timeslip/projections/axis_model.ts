/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isDefined } from '../../../utils/common';

/** @internal */
export const oneTwoFive = (mantissa: number) => (mantissa > 5 ? 10 : mantissa > 2 ? 5 : mantissa > 1 ? 2 : 1);
/** @internal */
export const oneFive = (mantissa: number) => (mantissa > 5 ? 10 : mantissa > 1 ? 5 : 1);

const getNiceTicksForApproxCount = (
  domainMin: number,
  domainMax: number,
  approxDesiredTickCount: number,
  mantissaFun = oneTwoFive,
) => {
  const diff = domainMax - domainMin;
  const rawPitch = diff / approxDesiredTickCount;
  const exponent = Math.floor(Math.log10(rawPitch));
  const orderOfMagnitude = 10 ** exponent; // this represents the order of magnitude eg. 10000, so that...
  const mantissa = rawPitch / orderOfMagnitude; // it's always the case that 1 <= mantissa <= 9.99999999999
  const niceMantissa = mantissaFun(mantissa); // snap to 10, 5, 2 or 1
  const tickInterval = niceMantissa * orderOfMagnitude;
  if (!isFinite(tickInterval)) {
    return [];
  }
  const result = [];
  for (let i = Math.floor(domainMin / tickInterval); i <= Math.ceil(domainMax / tickInterval); i++) {
    result.push(i * tickInterval);
  }
  return result;
};

/** @internal */
export const getDecimalTicks = (
  domainMin: number,
  domainMax: number,
  maximumTickCount: number,
  mantissaFun = oneTwoFive,
): number[] => {
  let bestCandidate: number[] = [];
  for (let i = 0; i <= maximumTickCount; i++) {
    const candidate = getNiceTicksForApproxCount(domainMin, domainMax, maximumTickCount - i, mantissaFun);
    if (candidate.length <= maximumTickCount && candidate.length > 0) return candidate;
    if (bestCandidate.length === 0 || maximumTickCount - candidate.length < maximumTickCount - bestCandidate.length) {
      bestCandidate = candidate;
    }
  }
  return bestCandidate.length > maximumTickCount
    ? [
        ...(maximumTickCount > 1 && isDefined(bestCandidate[0]) ? [bestCandidate[0]] : []),
        bestCandidate[bestCandidate.length - 1] ?? NaN,
      ]
    : [];
};

/** @internal */
export const axisModel = (
  domainLandmarks: number[],
  desiredTickCount: number,
): { niceDomainMin: number; niceDomainMax: number; niceTicks: number[] } => {
  const domainMin = Math.min(...domainLandmarks);
  const domainMax = Math.max(...domainLandmarks);
  const niceTicks = getDecimalTicks(domainMin, domainMax, desiredTickCount);
  const niceDomainMin = niceTicks.length >= 2 ? niceTicks[0]! : domainMin;
  const niceDomainMax = niceTicks.length >= 2 ? niceTicks[niceTicks.length - 1]! : domainMax;
  return { niceDomainMin, niceDomainMax, niceTicks };
};
