/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHierarchyOfArrays } from './hierarchy_of_arrays';
import { CHILDREN_KEY, entryValue } from '../../layout/utils/group_by_rollup';

const rawFacts = [
  { sitc1: '7', exportVal: 0 },
  { sitc1: '3', exportVal: 3 },
  { sitc1: 'G', exportVal: 1 },
  { sitc1: '5', exportVal: -8 },
];

const valueAccessor = (d: any) => d.exportVal;

const groupByRollupAccessors = [() => null, (d: any) => d.sitc1];

describe('Test', () => {
  test('getHierarchyOfArrays should omit negative values', () => {
    const outerResult = getHierarchyOfArrays(rawFacts, valueAccessor, groupByRollupAccessors, [], []);
    expect(outerResult.length).toBe(1);
    const results = entryValue(outerResult[0]);
    expect(results[CHILDREN_KEY].length).toBe(rawFacts.filter((d: any) => valueAccessor(d) >= 0).length);
  });
});
