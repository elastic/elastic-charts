/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// In preparation of nominal types in future TS versions
// https://github.com/microsoft/TypeScript/pull/33038
// eg. to avoid adding angles and coordinates and similar inconsistent number/number ops.
// could in theory be three-valued (in,on,out)
// It also serves as documentation.

import { RIGHT_ANGLE, TAU } from './constants';

/** @public */
export type Pixels = number;
/**
 * A finite number that expresses a ratio
 * @public
 */
export type Ratio = number;
/** @public */
export type SizeRatio = Ratio;
/** @public */
export type Cartesian = number;
/** @internal */
export type Coordinate = Cartesian;
/** @public */
export type Radius = Cartesian;
/** @public */
export type Radian = Cartesian; // we measure angle in radians, and there's unity between radians and cartesian distances which is the whole point of radians; this is also relevant as we use small-angle approximations
/** @public */
export type Distance = Cartesian;

/** @internal */
export interface PointObject {
  x: Coordinate;
  y: Coordinate;
}

/** @internal */
export type PointTuple = [Coordinate, Coordinate];

/** @internal */
export type PointTuples = [PointTuple, ...PointTuple[]]; // at least one point

/** @internal */
export class Circline {
  x: Coordinate = NaN;

  y: Coordinate = NaN;

  r: Radius = NaN;
}

/** @internal */
export interface CirclinePredicate extends Circline {
  inside: boolean;
}

/** @internal */
export interface CirclineArc extends Circline {
  from: Radian;
  to: Radian;
}

/** @internal */
type CirclinePredicateSet = CirclinePredicate[];

/** @internal */
export type RingSectorConstruction = CirclinePredicateSet;

/** @public */
export type TimeMs = number;

/** @internal */
export function wrapToTau(a: Radian) {
  if (0 <= a && a <= TAU) return a; // efficient shortcut
  if (a < 0) a -= TAU * Math.floor(a / TAU);
  return a > TAU ? a % TAU : a;
}

/** @internal */
export function diffAngle(a: Radian, b: Radian) {
  return ((a - b + Math.PI + TAU) % TAU) - Math.PI;
}

/** @internal */
export function meanAngle(a: Radian, b: Radian) {
  return (TAU + b + diffAngle(a, b) / 2) % TAU;
}

/** @internal */
export function trueBearingToStandardPositionAngle(alphaIn: number) {
  return wrapToTau(RIGHT_ANGLE - alphaIn);
}
