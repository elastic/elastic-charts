import { CirclArc, Circline, CirclinePredicate, Distance, PointObject, RingSector } from './types/geometry_types';
import { tau } from './utils/math';

function euclideanDistance({ x: X, y: Y }: PointObject, { x, y }: PointObject): Distance {
  return Math.sqrt(Math.pow(X - x, 2) + Math.pow(Y - y, 2));
}

function fullyContained(C: Circline, c: Circline): boolean {
  return euclideanDistance(C, c) + c.r <= C.r;
}
function noOverlap(C: Circline, c: Circline): boolean {
  return euclideanDistance(C, c) >= C.r + c.r;
}

function circlineIntersect(c1: Circline, c2: Circline): PointObject[] {
  const D = Math.sqrt((c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y));
  if (c1.r + c2.r >= D && D >= Math.abs(c1.r - c2.r)) {
    const a1 = D + c1.r + c2.r;
    const a2 = D + c1.r - c2.r;
    const a3 = D - c1.r + c2.r;
    const a4 = -D + c1.r + c2.r;
    const area = Math.sqrt(a1 * a2 * a3 * a4) / 4;

    const xAux1 = (c1.x + c2.x) / 2 + ((c2.x - c1.x) * (c1.r * c1.r - c2.r * c2.r)) / (2 * D * D);
    const xAux2 = (2 * (c1.y - c2.y) * area) / (D * D);
    const x1 = xAux1 + xAux2;
    const x2 = xAux1 - xAux2;

    const yAux1 = (c1.y + c2.y) / 2 + ((c2.y - c1.y) * (c1.r * c1.r - c2.r * c2.r)) / (2 * D * D);
    const yAux2 = (2 * (c1.x - c2.x) * area) / (D * D);
    const y1 = yAux1 - yAux2;
    const y2 = yAux1 + yAux2;

    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  } else {
    return [];
  }
}

function circlineValidSectors(C: CirclinePredicate, c: CirclArc): CirclArc[] {
  const { inside } = C;
  const { x, y, r, from, to } = c;
  const fullContainment = fullyContained(C, c);
  const fullyOutside = noOverlap(C, c) || fullyContained(c, C);

  // handle clear cases

  // nothing kept:
  if ((inside && fullContainment) || (!inside && fullyOutside)) {
    return [];
  }

  // the entire sector is kept
  if ((inside && fullyOutside) || (!inside && fullContainment)) {
    return [c];
  }

  // now we know there's intersection and we're supposed to get back two distinct points
  const circlineIntersections = circlineIntersect(C, c);
  // These conditions don't happen; kept for documentation purposes:
  // if (circlineIntersections.length !== 2) throw new Error('Problem in intersection calculation.')
  // if (from > to) throw new Error('From/to problem in intersection calculation.')
  if (circlineIntersections.length !== 2) return [];
  const [p1, p2] = circlineIntersections;
  const aPre1 = Math.atan2(p1.y - c.y, p1.x - c.x);
  const aPre2 = Math.atan2(p2.y - c.y, p2.x - c.x);
  const a1p = Math.max(from, Math.min(to, aPre1 < 0 ? aPre1 + tau : aPre1));
  const a2p = Math.max(from, Math.min(to, aPre2 < 0 ? aPre2 + tau : aPre2));
  const a1 = Math.min(a1p, a2p);
  const a2 = a1p === a2p ? tau : Math.max(a1p, a2p); // make a2 drop out in next step

  // imperative, slightly optimized buildup of `breakpoints` as it's in the hot loop:
  const breakpoints = [from];
  if (from < a1 && a1 < to) breakpoints.push(a1);
  if (from < a2 && a2 < to) breakpoints.push(a2);
  breakpoints.push(to);

  const predicate = inside ? noOverlap : fullyContained;

  // imperative, slightly optimized buildup of `result` as it's in the hot loop:
  const result = [];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const from = breakpoints[i];
    const to = breakpoints[i + 1];
    const midAngle = (from + to) / 2; // no winding clip ie. `meanAngle()` would be wrong here
    const xx = x + r * Math.cos(midAngle);
    const yy = y + r * Math.sin(midAngle);
    if (predicate(C, { x: xx, y: yy, r: 0 })) result.push({ x, y, r, from, to });
  }
  return result;
}

export function conjunctiveConstraint(constraints: RingSector, c: CirclArc): CirclArc[] {
  // imperative, slightly optimized buildup of `valids` as it's in the hot loop:
  let valids = [c];
  for (let i = 0; i < constraints.length; i++) {
    const C = constraints[i];
    const nextValids: CirclArc[] = [];
    for (let j = 0; j < valids.length; j++) {
      const cc = valids[j];
      const currentValids = circlineValidSectors(C, cc);
      nextValids.push(...currentValids);
    }
    valids = nextValids;
  }
  return valids;
}
