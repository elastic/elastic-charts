/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSeriesSpecsSelector } from './get_specs';
import { MockSeriesSpec } from '../../../../mocks/specs';
import { getInitialState } from '../../../../state/get_initial_state';

describe('selector - get_specs', () => {
  const state = getInitialState('chartId1');
  beforeEach(() => {
    state.specs.bars1 = MockSeriesSpec.bar({ id: 'bars1' });
    state.specs.bars2 = MockSeriesSpec.bar({ id: 'bars2' });
  });
  it('shall return the same ref objects', () => {
    const series = getSeriesSpecsSelector(state);
    expect(series.length).toBe(2);
    const seriesSecondCall = getSeriesSpecsSelector({ ...state, specsInitialized: true });
    expect(series).toBe(seriesSecondCall);
  });
});
