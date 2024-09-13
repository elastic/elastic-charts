/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { groupBy, GroupKeysOrKeyFn } from '../../chart_types/xy_chart/utils/group_data_series';
import { isFiniteNumber } from '../common';

/**
 * The function computes the participation ratio of a value in the total sum of its membership group.
 * It returns a shallow copy of the input array where each object is augmented with the computed ratio.
 *
 * @remarks
 * The ratio is computed using absolute values.
 * Product A made a profit of $200, and product B has a loss of $300. In total, the company lost $100 ($200 – $300).
 * Product A has a weight of: abs(200) / ( abs(200) + abs(-300) ) * 100% = 40%
 * Product B has a weight of: abs(-300) / ( abs(200) + abs(-300) ) * 100% = 60%
 * Product A and product B have respectively a weight of 40% and 60% in the formation of the overall total loss of $100.
 *
 * We don't compute the ratio for non-finite values. In this case, we return the original non-finite value.
 *
 * If the sum of the group values is 0, each ratio is considered 0.
 *
 * @public
 * @param data - an array of objects
 * @param groupAccessors - an array of accessor keys or a fn to describe an unique id for each group
 * @param valueGetterSetters - an array of getter and setter functions for the metric and ratio values
 */
export function computeRatioByGroups<T extends Record<string, unknown>>(
  data: T[],
  groupAccessors: GroupKeysOrKeyFn<T>,
  valueGetterSetters: Array<[(datum: T) => unknown, (datum: T, value: number) => T]>,
): T[] {
  return groupBy(data, groupAccessors, true).flatMap((groupedData) => {
    const groupSum = groupedData.reduce((sum, datum) => {
      return (
        valueGetterSetters.reduce((valueSum, [getter]) => {
          const value = getter(datum);
          return valueSum + (isFiniteNumber(value) ? Math.abs(value) : 0);
        }, 0) + sum
      );
    }, 0);
    return groupedData.map((datum) => {
      return valueGetterSetters.reduce<T>((acc, [getter, setter]) => {
        const value = getter(acc);
        return isFiniteNumber(value) ? setter(acc, groupSum === 0 ? 0 : Math.abs(value) / groupSum) : acc;
      }, datum);
    });
  });
}

/** @internal */
export type SortedArray<T> = Array<T>;

/** @internal */
export function inplaceInsertInSortedArray<T>(
  arr: SortedArray<T>,
  obj: T,
  accessor: (element?: T) => number,
): SortedArray<T> {
  let left = 0;
  let right = arr.length - 1;
  const value = accessor(obj);

  // Perform a binary search to find the correct insertion index
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (accessor(arr[mid]) < value) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  // Insert the object at the found index
  arr.splice(left, 0, obj);
  return arr;
}
