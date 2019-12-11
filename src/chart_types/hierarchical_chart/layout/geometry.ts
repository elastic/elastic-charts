import { Radian } from './types/GeometryTypes';
import { tau } from './utils/math';

export const wrapToTau = (a: Radian) => {
  if (0 <= a && a <= tau) return a; // efficient shortcut
  if (a < 0) a -= tau * Math.floor(a / tau);
  return a > tau ? a % tau : a;
};

export const diffAngle = (a: Radian, b: Radian) => ((a - b + Math.PI + tau) % tau) - Math.PI;

export const meanAngle = (a: Radian, b: Radian) => (tau + b + diffAngle(a, b) / 2) % tau;
