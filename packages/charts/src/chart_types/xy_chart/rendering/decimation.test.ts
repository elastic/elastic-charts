/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { decimateDataSeries } from './decimation';
import type { DataSeriesDatum } from '../utils/series';

function datum(x: number, y1: number | null): DataSeriesDatum {
  return { x, y1, y0: null, initialY1: y1, initialY0: null, mark: null, datum: { x, y: y1 } };
}

describe('decimateDataSeries', () => {
  it('returns the original array when below the threshold', () => {
    const data = [datum(0, 1), datum(1, 2), datum(2, 3)];
    const result = decimateDataSeries(data, 100);
    expect(result).toBe(data);
  });

  it('reduces the point count for large datasets', () => {
    const panelWidth = 10;
    const data = Array.from({ length: 1000 }, (_, i) => datum(i, i));
    const result = decimateDataSeries(data, panelWidth);
    expect(result.length).toBeLessThanOrEqual(panelWidth * 4);
    expect(result.length).toBeGreaterThanOrEqual(panelWidth);
  });

  it('preserves peaks and valleys', () => {
    const panelWidth = 5;
    // 100 points across 5 buckets (20 per bucket), with a spike at index 10
    const data = Array.from({ length: 100 }, (_, i) => datum(i, i === 10 ? 999 : 1));
    const result = decimateDataSeries(data, panelWidth);
    expect(result.some((d) => d.y1 === 999)).toBe(true);
  });

  it('preserves the first and last data points', () => {
    const data = Array.from({ length: 1000 }, (_, i) => datum(i, i));
    const result = decimateDataSeries(data, 10);
    expect(result[0]).toBe(data[0]);
    expect(result.at(-1)).toBe(data.at(-1));
  });

  it('handles null y1 values', () => {
    const data = Array.from({ length: 100 }, (_, i) => datum(i, i % 3 === 0 ? null : i));
    expect(() => decimateDataSeries(data, 5)).not.toThrow();
  });

  it('emits first, min, max, last in data order', () => {
    const panelWidth = 1;
    // Single bucket: first=0, min at index 1, max at index 3, last=4
    const data = [datum(0, 50), datum(1, -10), datum(2, 3), datum(3, 100), datum(4, 50)];
    const result = decimateDataSeries(data, panelWidth);
    expect(result).toEqual([data[0], data[1], data[3], data[4]]);
  });

  it('deduplicates when first or last coincides with min or max', () => {
    const panelWidth = 1;
    // Min is the first point, max is the last point
    const data = [datum(0, -10), datum(1, 5), datum(2, 3), datum(3, 7), datum(4, 100)];
    const result = decimateDataSeries(data, panelWidth);
    expect(result).toEqual([data[0], data[4]]);
  });
});
