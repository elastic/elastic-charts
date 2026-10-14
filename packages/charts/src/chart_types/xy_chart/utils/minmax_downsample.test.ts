/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { minMaxDownsample, pixelBucketCount } from './minmax_downsample';

type Row = [number, number | null];

const x = (d: Row) => d[0];
const y = (d: Row) => d[1];

describe('minMaxDownsample', () => {
  test('pixelBucketCount floors and rejects non-positive widths', () => {
    expect(pixelBucketCount(800.9)).toBe(800);
    expect(pixelBucketCount(0)).toBe(0);
    expect(pixelBucketCount(-10)).toBe(0);
  });

  test('returns the input when there are at most two points per bucket', () => {
    const data: Row[] = [
      [0, 1],
      [1, 2],
      [2, 3],
    ];
    const result = minMaxDownsample(data, x, y, 2);
    expect(result.data).toBe(data);
  });

  test('keeps first, last, and the global y extrema', () => {
    const data: Row[] = Array.from({ length: 100 }, (_, i) => [i, i === 40 ? 1000 : i === 70 ? -50 : 0]);
    const { data: sampled } = minMaxDownsample(data, x, y, 10);
    expect(sampled.length).toBeLessThan(data.length);
    expect(sampled[0]).toBe(data[0]);
    expect(sampled.at(-1)).toBe(data[99]);
    expect(sampled).toContain(data[40]);
    expect(sampled).toContain(data[70]);
  });

  test('does not copy rows', () => {
    const data: Row[] = Array.from({ length: 50 }, (_, i) => [i, Math.sin(i)]);
    const { data: sampled } = minMaxDownsample(data, x, y, 5);
    sampled.forEach((row) => {
      expect(data).toContain(row);
    });
  });

  test('keeps a null so path gaps survive', () => {
    const data: Row[] = Array.from({ length: 50 }, (_, i) => [i, i === 25 ? null : i]);
    const { data: sampled } = minMaxDownsample(data, x, y, 5);
    expect(sampled.some((row) => row[1] === null)).toBe(true);
  });

  test('reports the original adjacent x interval', () => {
    const data: Row[] = Array.from({ length: 200 }, (_, i) => [i * 3, i]);
    const { minInterval } = minMaxDownsample(data, x, y, 8);
    expect(minInterval).toBe(3);
  });
});
