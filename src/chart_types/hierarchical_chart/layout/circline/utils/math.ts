import { wrapToTau } from '../geometry';

export const rightAngle = Math.PI / 2;
export const goldenRatio = 1.618;
export const tau = 2 * Math.PI;

export const trueBearingToStandardPositionAngle = (alphaIn: number) => wrapToTau(rightAngle - alphaIn);

export const logarithm = (base: number, y: number) => Math.log(y) / Math.log(base);
