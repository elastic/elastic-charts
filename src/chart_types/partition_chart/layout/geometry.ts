import { Radian } from './types/geometry_types';
import { tau } from './utils/math';

export function wrapToTau(a: Radian) {
  if (0 <= a && a <= tau) return a; // efficient shortcut
  if (a < 0) a -= tau * Math.floor(a / tau);
  return a > tau ? a % tau : a;
}

export function diffAngle(a: Radian, b: Radian) {
  return ((a - b + Math.PI + tau) % tau) - Math.PI;
}

export function meanAngle(a: Radian, b: Radian) {
  return (tau + b + diffAngle(a, b) / 2) % tau;
}
