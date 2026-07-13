/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { chartSelectorsFactory } from './chart_selectors';
import { MockStore } from '../../mocks/store/store';
import { InitStatus } from '../../state/selectors/get_internal_is_intialized';

describe('Trace chart_selectors', () => {
  const globalState = MockStore.default().getState();

  it('describes itself as a Trace chart', () => {
    const selectors = chartSelectorsFactory();
    expect(selectors.getChartTypeDescription(globalState)).toBe('Trace chart');
  });

  it('reports Initialized', () => {
    const selectors = chartSelectorsFactory();
    expect(selectors.isInitialized(globalState)).toBe(InitStatus.Initialized);
  });
});
