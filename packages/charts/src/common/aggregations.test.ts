/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  countNonNull,
  sum,
  average,
  median,
  min,
  max,
  range,
  distinctCount,
  stdDeviation,
  variance,
  difference,
  differencePercent,
} from './aggregations';
const numericArray = [3, 4, 5, 6, 6, 7, 7.5, 8, 1, 2, 9];
const numericAccessor = (d: number) => d;
const numericArrayWithNull = [3, null, 5, 6, null, 7, 7.5, 8, 1, 2, 9];
const numericAccessorWithNull = (d: number | null) => d;
const objectArray = [
  { y: 3 },
  { y: 4 },
  { y: 5 },
  { y: 6 },
  { y: 6 },
  { y: 7 },
  { y: 7.5 },
  { y: 8 },
  { y: 1 },
  { y: 2 },
  { y: 9 },
];
const objArrayAccessor = (d: { y: number | null }) => d.y;

const objectArrayWithNull = [
  { y: 3 },
  { y: null },
  { y: 5 },
  { y: 6 },
  { y: null },
  { y: 7 },
  { y: 7.5 },
  { y: 8 },
  { y: 1 },
  { y: 2 },
  { y: 9 },
];

describe('Aggregations', () => {
  it('sum', () => {
    expect(sum(numericArray, numericAccessor).sum).toBe(58.5);
    expect(sum(objectArray, objArrayAccessor).sum).toBe(58.5);
    expect(sum(numericArrayWithNull, numericAccessorWithNull).sum).toBe(48.5);
    expect(sum(objectArrayWithNull, objArrayAccessor).sum).toBe(48.5);
    expect(sum(numericArrayWithNull, numericAccessorWithNull).validCount).toBe(9);
    expect(sum(objectArrayWithNull, objArrayAccessor).validCount).toBe(9);
  });
  it('count', () => {
    expect(countNonNull(numericArray, numericAccessor)).toBe(11);
    expect(countNonNull(objectArray, objArrayAccessor)).toBe(11);
    expect(countNonNull(numericArrayWithNull, numericAccessorWithNull)).toBe(9);
    expect(countNonNull(objectArrayWithNull, objArrayAccessor)).toBe(9);
  });
  it('distinct count', () => {
    expect(distinctCount(numericArray, numericAccessorWithNull)).toBe(10);
    expect(distinctCount(objectArray, objArrayAccessor)).toBe(10);
    expect(distinctCount(numericArrayWithNull, numericAccessorWithNull)).toBe(9);
    expect(distinctCount(objectArrayWithNull, objArrayAccessor)).toBe(9);
  });
  it('average', () => {
    expect(average(numericArray, numericAccessorWithNull)).toBeCloseTo(5.318);
    expect(average(objectArray, objArrayAccessor)).toBeCloseTo(5.318);
    expect(average(numericArrayWithNull, numericAccessorWithNull)).toBeCloseTo(5.388);
    expect(average(objectArrayWithNull, objArrayAccessor)).toBeCloseTo(5.388);
  });
  it('median', () => {
    expect(median(numericArray, numericAccessorWithNull)).toBe(6);
    expect(median(objectArray, objArrayAccessor)).toBe(6);
    expect(median(numericArrayWithNull, numericAccessorWithNull)).toBe(6);
    expect(median(objectArrayWithNull, objArrayAccessor)).toBe(6);
  });
  it('min', () => {
    expect(min(numericArray, numericAccessorWithNull)).toBe(1);
    expect(min(objectArray, objArrayAccessor)).toBe(1);
    expect(min(numericArrayWithNull, numericAccessorWithNull)).toBe(1);
    expect(min(objectArrayWithNull, objArrayAccessor)).toBe(1);
  });
  it('max', () => {
    expect(max(numericArray, numericAccessorWithNull)).toBe(9);
    expect(max(objectArray, objArrayAccessor)).toBe(9);
    expect(max(numericArrayWithNull, numericAccessorWithNull)).toBe(9);
    expect(max(objectArrayWithNull, objArrayAccessor)).toBe(9);
  });
  it('range', () => {
    expect(range(numericArray, numericAccessorWithNull)).toBe(8);
    expect(range(objectArray, objArrayAccessor)).toBe(8);
    expect(range(numericArrayWithNull, numericAccessorWithNull)).toBe(8);
    expect(range(objectArrayWithNull, objArrayAccessor)).toBe(8);
  });
  it('diff', () => {
    expect(difference(numericArray, numericAccessorWithNull)).toBe(6);
    expect(difference(objectArray, objArrayAccessor)).toBe(6);
    expect(difference(numericArrayWithNull, numericAccessorWithNull)).toBe(6);
    expect(difference(objectArrayWithNull, objArrayAccessor)).toBe(6);
  });
  it('diff percent', () => {
    expect(differencePercent(numericArray, numericAccessorWithNull)).toBeCloseTo(0.666);
    expect(differencePercent(objectArray, objArrayAccessor)).toBeCloseTo(0.666);
    expect(differencePercent(numericArrayWithNull, numericAccessorWithNull)).toBeCloseTo(0.666);
    expect(differencePercent(objectArrayWithNull, objArrayAccessor)).toBeCloseTo(0.666);
  });
  it('variance', () => {
    expect(variance(numericArray, numericAccessorWithNull)).toBeCloseTo(6.613);
    expect(variance(objectArray, objArrayAccessor)).toBeCloseTo(6.613);
    expect(variance(numericArrayWithNull, numericAccessorWithNull)).toBeCloseTo(7.986);
    expect(variance(objectArrayWithNull, objArrayAccessor)).toBeCloseTo(7.986);
  });
  it('std deviation', () => {
    expect(stdDeviation(numericArray, numericAccessorWithNull)).toBeCloseTo(2.5716);
    expect(stdDeviation(objectArray, objArrayAccessor)).toBeCloseTo(2.5716);
    expect(stdDeviation(numericArrayWithNull, numericAccessorWithNull)).toBeCloseTo(2.8259);
    expect(stdDeviation(objectArrayWithNull, objArrayAccessor)).toBeCloseTo(2.8259);
  });
});
