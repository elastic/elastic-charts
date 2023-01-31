/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSpecsFromStore } from './utils';
import { ChartType } from '../chart_types';
import { SpecType } from '../specs/constants';

describe('State utils', () => {
  it('getSpecsFromStore shall return always the same object reference excluding the array', () => {
    const spec1 = { id: 'id1', chartType: ChartType.XYAxis, specType: SpecType.Series };
    const specs = getSpecsFromStore({ id1: spec1 }, ChartType.XYAxis, SpecType.Series);
    expect(specs[0]).toBe(spec1);
  });
});
