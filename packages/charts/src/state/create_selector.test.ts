/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createNextState } from '@reduxjs/toolkit';

import { onDOMElementLeave } from './actions/dom_element';
import { onKeyPress } from './actions/key';
import { onLegendItemOutAction, onLegendItemOverAction, onToggleDeselectSeriesAction } from './actions/legend';
import { onMouseDown, onMouseUp, onPointerMove } from './actions/mouse';
import { pinTooltip, setSelectedTooltipItems } from './actions/tooltip';
import type { GlobalChartState } from './chart_state';
import { createChartStore } from './chart_state';
import { createCustomCachedSelector, globalSelectorCache } from './create_selector';
import { getInitialState } from './get_initial_state';
import { MockSeriesSpec } from '../mocks/specs';
import { MockStore } from '../mocks/store';
import { Logger } from '../utils/logger';

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

  it('keeps one computation for a chart: the latest', () => {
    const selector = createCustomCachedSelector(
      [(state: GlobalChartState) => state.parentDimensions.width],
      (width) => ({ width }),
    );

    selector(getState('chart-one-kept', 1));
    selector(getState('chart-one-kept', 2));
    expect(selector.recomputations()).toBe(2);
    selector(getState('chart-one-kept', 2));
    expect(selector.recomputations()).toBe(2);

    selector(getState('chart-one-kept', 1));
    expect(selector.recomputations()).toBe(3);

    globalSelectorCache.removeKeyFromAll('chart-one-kept');
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

    states.forEach((state) => globalSelectorCache.removeKeyFromAll(state.uniqueChartKey ?? state.chartId));
  });
});

describe('selectors and reducers', () => {
  it('a selector asked about the draft of a reducer answers about the state it was given, and logs an error', () => {
    // every object of a draft is new: an answer about one can neither reuse a computation nor be reused
    const error = jest.spyOn(Logger, 'error').mockImplementation(() => {});
    const selector = createCustomCachedSelector([(state: GlobalChartState) => state.parentDimensions], (d) => ({ d }));
    const state = getState('chart-draft', 1);
    const result = selector(state);
    createNextState(state, (draft) => {
      draft.parentDimensions.width = 2;
      expect(selector(draft as GlobalChartState)).toBe(result);
    });
    expect(error).toHaveBeenCalledTimes(1);
    expect(selector.recomputations()).toBe(1);
    globalSelectorCache.removeKeyFromAll('chart-draft');
  });

  it('the reducers of interactions ask about the state that the store holds', () => {
    const store = MockStore.default({ width: 100, height: 100, top: 0, left: 0 });
    MockStore.addSpecs([MockSeriesSpec.bar({ data: [{ x: 0, y: 1 }] })], store);
    const at = { position: { x: 50, y: 50 }, time: 0 };
    const actions = [
      onPointerMove(at),
      onMouseDown({ ...at, keyPressed: { shiftKey: false, ctrlKey: false, altKey: false, metaKey: false } }),
      onMouseUp(at),
      onLegendItemOverAction([]),
      onLegendItemOutAction(),
      onToggleDeselectSeriesAction({ legendItemIds: [], metaKey: false }),
      onDOMElementLeave(),
      pinTooltip({ pinned: true }),
      setSelectedTooltipItems([]),
      pinTooltip({ pinned: false, resetPointer: true }),
      onKeyPress('Escape'),
    ];
    const error = jest.spyOn(Logger, 'error').mockImplementation(() => {});
    actions.forEach((action) => store.dispatch(action));
    expect(error).not.toHaveBeenCalled();
  });
});
