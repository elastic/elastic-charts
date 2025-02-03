/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSpecsFromStore } from './utils/get_specs_from_store';
import { ChartType } from '../chart_types/chart_type';
import { SpecType } from '../specs/spec_type';

describe('State utils', () => {
  it('getSpecsFromStore shall return always the same object reference excluding the array', () => {
    const spec1 = { id: 'id1', chartType: ChartType.XYAxis, specType: SpecType.Series };
    const specs = getSpecsFromStore({ id1: spec1 }, ChartType.XYAxis, SpecType.Series);
    expect(specs[0]).toBe(spec1);
  });
});
