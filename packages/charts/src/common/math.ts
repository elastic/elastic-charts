/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export function logarithm(base: number, y: number) {
  return Math.log(y) / Math.log(base);
}

/**
 * Computes the min and max values of an array of numbers
 * @internal
 */
export function extent(array: number[]): [min: number, max: number] {
  const len = array.length;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < len; i += 1) {
    const value = array[i] ?? NaN;
    if (min > value) min = value;
    if (max < value) max = value;
  }
  return [min, max];
}
