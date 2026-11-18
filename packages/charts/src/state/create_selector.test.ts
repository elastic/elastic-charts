/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { GlobalChartState } from './chart_state';
import { createCustomCachedSelector, globalSelectorCache } from './create_selector';
import { getInitialState } from './get_initial_state';

const getState = (chartId: string, width: number): GlobalChartState => ({
  ...getInitialState(chartId),
  parentDimensions: {
    top: 0,
    left: 0,
    width,
    height: 100,
  },
});

describe('createCustomCachedSelector', () => {
  it('keeps empty selector caches registered so future chart ids can be cleaned up', () => {
    const selector = createCustomCachedSelector(
      [(state: GlobalChartState) => state.parentDimensions.width],
      (width) => ({ width }),
    );

    selector(getState('chart-a', 1));
    expect(selector.recomputations()).toBe(1);

    globalSelectorCache.removeKeyFromAll('chart-a');

    selector(getState('chart-b', 2));
    expect(selector.recomputations()).toBe(2);

    globalSelectorCache.removeKeyFromAll('chart-b');

    selector(getState('chart-b', 2));
    expect(selector.recomputations()).toBe(3);
  });

  it('limits each chart id memo cache to two input combinations', () => {
    const selector = createCustomCachedSelector(
      [(state: GlobalChartState) => state.parentDimensions.width],
      (width) => ({ width }),
    );

    selector(getState('chart-lru', 1));
    selector(getState('chart-lru', 2));
    selector(getState('chart-lru', 3));
    expect(selector.recomputations()).toBe(3);

    selector(getState('chart-lru', 1));
    expect(selector.recomputations()).toBe(4);

    globalSelectorCache.removeKeyFromAll('chart-lru');
  });
});
