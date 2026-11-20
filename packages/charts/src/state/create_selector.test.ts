/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { GlobalChartState } from './chart_state';
import { createChartStore } from './chart_state';
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

  it('computes once for a state, and again only when an input is another object', () => {
    const selector = createCustomCachedSelector([(state: GlobalChartState) => state.parentDimensions], ({ width }) => ({
      width,
    }));
    const state = getState('chart-memo', 1);
    const result = selector(state);
    expect(selector(state)).toBe(result);
    // another state with the same input
    expect(selector({ ...state })).toBe(result);
    expect(selector.recomputations()).toBe(1);

    expect(selector({ ...state, parentDimensions: { ...state.parentDimensions } })).not.toBe(result);
    expect(selector.recomputations()).toBe(2);
    // the one before is kept too
    expect(selector(state)).toBe(result);
    expect(selector.recomputations()).toBe(2);

    globalSelectorCache.removeKeyFromAll('chart-memo');
  });

  it('keeps what it computed for one chart apart from another chart', () => {
    const selector = createCustomCachedSelector(
      [(state: GlobalChartState) => state.parentDimensions.width],
      (width) => ({ width }),
    );
    const one = getState('chart-one', 1);
    const other = getState('chart-other', 1);
    const result = selector(one);
    expect(selector(other)).not.toBe(result);
    expect(selector(other)).toEqual(result);

    globalSelectorCache.removeKeyFromAll('chart-other');
    expect(selector(one)).toBe(result);
    globalSelectorCache.removeKeyFromAll('chart-one');
  });

  it('keeps what it computed for each of several charts that share an id', () => {
    const selector = createCustomCachedSelector([(state: GlobalChartState) => state.interactions], (interactions) => ({
      interactions,
    }));
    const states = [1, 2, 3, 4].map(() => createChartStore('shared-id').getState());
    const results = states.map((state) => selector(state));
    // every chart asks again about its state, which has not changed
    expect(states.map((state) => selector(state))).toEqual(results);
    states.forEach((state, i) => expect(selector(state)).toBe(results[i]));
    expect(selector.recomputations()).toBe(4);

    states.forEach((state) => globalSelectorCache.removeKeyFromAll(state.selectorCacheKey ?? state.chartId));
  });
});
