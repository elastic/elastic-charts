/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export function sum<D>(arr: D[], accessor: (d: D) => number | null): { sum: number; validCount: number } {
  return arr.reduce<{ sum: number; validCount: number }>(
    (acc, d) => {
      const value = accessor(d);
      return {
        sum: acc.sum + (value !== null ? value : 0),
        validCount: value !== null ? acc.validCount + 1 : acc.validCount,
      };
    },
    { sum: 0, validCount: 0 },
  );
}

/** @internal */
export function average<D>(arr: D[], accessor: (d: D) => number | null): number {
  const total = sum(arr, accessor);
  if (total.validCount === 0) return NaN;
  return total.sum / total.validCount;
}

/** @internal */
export function median<D>(input: D[], accessor: (d: D) => number | null): number {
  const arr: number[] = input.reduce<number[]>((acc, d) => {
    const value = accessor(d);
    if (value !== null) {
      acc.push(value);
    }
    return acc;
  }, []);
  if (!arr.length) return NaN;
  const s = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  if (s.length % 2) {
    return s[mid] ?? NaN;
  }
  return ((s[mid - 1] ?? NaN) + (s[mid] ?? NaN)) / 2;
}

/** @internal */
export function min<D>(arr: D[], accessor: (d: D) => number | null): number {
  if (arr.length === 0) return NaN;
  return arr.reduce<number>((m, d) => {
    const value = accessor(d);
    return value !== null ? Math.min(m, value) : m;
  }, +Infinity);
}
/** @internal */
export function max<D>(arr: D[], accessor: (d: D) => number | null): number {
  if (arr.length === 0) return NaN;
  return arr.reduce<number>((m, d) => {
    const value = accessor(d);
    return value !== null ? Math.max(m, value) : m;
  }, -Infinity);
}

/** @internal */
export function range<D>(arr: D[], accessor: (d: D) => number | null): number {
  if (arr.length === 0) return NaN;
  const minMax = arr.reduce<{ min: number; max: number }>(
    (m, d) => {
      const value = accessor(d);
      return {
        max: value !== null ? Math.max(m.max, value) : m.max,
        min: value !== null ? Math.min(m.min, value) : m.min,
      };
    },
    { min: +Infinity, max: -Infinity },
  );
  return minMax.max - minMax.min;
}

/** @internal */
export function countNonNull<D>(arr: D[], accessor: (d: D) => number | null): number {
  return arr.filter((d) => accessor(d) !== null).length;
}
/** @internal */
export function distinctCount<D>(arr: D[], accessor: (d: D) => number | null): number {
  return new Set(nonNullArray(arr, accessor)).size;
}

/** @internal */
export function nonNullArray<D>(arr: D[], accessor: (d: D) => number | null): number[] {
  return arr.reduce<number[]>((acc, d) => {
    const value = accessor(d);
    if (value !== null) {
      acc.push(value);
    }
    return acc;
  }, []);
}

/** @internal */
export function variance<D>(arr: D[], accessor: (d: D) => number | null): number {
  const nonNullArr = nonNullArray(arr, accessor);
  const ddof = 1;
  const total = sum(nonNullArr, (d) => d);
  const avg = total.sum / total.validCount;
  const squareDiffs = nonNullArr.map((d) => {
    return Math.abs(Math.pow(d - avg, 2));
  });
  const totalSumOfSquareDiffs = sum(squareDiffs, (d: number) => d);
  return totalSumOfSquareDiffs.sum / (totalSumOfSquareDiffs.validCount - ddof);
}

/** @internal */
export function stdDeviation<D>(arr: D[], accessor: (d: D) => number | null): number {
  const v = variance(arr, accessor);
  const std = Math.sqrt(v);
  return std;
}

/** @internal */
export function firstNonNull<D>(arr: D[], accessor: (d: D) => number | null): number | null {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (!item) continue;
    const value = accessor(item);
    if (value) {
      return value;
    }
  }
  return null;
}

/** @internal */
export function lastNonNull<D>(arr: D[], accessor: (d: D) => number | null): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];
    if (!item) continue;
    const value = accessor(item);
    if (value) {
      return value;
    }
  }
  return null;
}

/** @internal */
export function difference<D>(arr: D[], accessor: (d: D) => number | null): number | null {
  const first = firstNonNull(arr, accessor);
  const last = lastNonNull(arr, accessor);
  if (first !== null && last !== null) {
    return last - first;
  }
  return null;
}

/** @internal */
export function differencePercent<D>(arr: D[], accessor: (d: D) => number | null): number | null {
  const first = firstNonNull(arr, accessor);
  const last = lastNonNull(arr, accessor);
  if (first !== null && last !== null) {
    return (last - first) / last;
  }
  return null;
}
