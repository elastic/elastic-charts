import { wrapToTau } from '../geometry';

export const rightAngle = Math.PI / 2;
export const goldenRatio = 1.618;
export const tau = 2 * Math.PI;

export function trueBearingToStandardPositionAngle(alphaIn: number) {
  return wrapToTau(rightAngle - alphaIn);
}

export function logarithm(base: number, y: number) {
  return Math.log(y) / Math.log(base);
}
