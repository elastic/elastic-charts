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
import { createCustomCachedSelector, selectorMemos } from './create_selector';
import { getInitialState } from './get_initial_state';
import { MockSeriesSpec } from '../mocks/specs';
import { MockStore } from '../mocks/store';
import { Logger } from '../utils/logger';

/** A state of the chart that another state is of, with the width */
const sized = (chart: GlobalChartState, width: number): GlobalChartState => ({
  ...chart,
  parentDimensions: {
    top: 0,
    left: 0,
    width,
    height: 100,
  },
});

/** whether one thing leads to another, through properties and through the keys and values of maps */
const reaches = (from: unknown, to: unknown, seen = new Set<unknown>()): boolean => {
  if (from === to) return true;
  if (typeof from !== 'object' || from === null || seen.has(from)) return false;
  seen.add(from);
  const next: unknown[] = from instanceof Map ? [...from.keys(), ...from.values()] : Object.values(from);
  return next.some((value) => reaches(value, to, seen));
};

describe('createCustomCachedSelector', () => {
  it('computes again for a chart whose memos were released', () => {
    const selector = createCustomCachedSelector(
      [(state: GlobalChartState) => state.parentDimensions.width],
      (width) => ({ width }),
    );
    const state = sized(getInitialState('chart-released'), 1);
    selector(state);
    selector(state);
    expect(selector.computationCount()).toBe(1);

    selectorMemos.release(state.uniqueChartKey);
    selector(state);
    expect(selector.computationCount()).toBe(2);
  });

  it('keeps one computation for a chart: the latest', () => {
    const selector = createCustomCachedSelector(
      [(state: GlobalChartState) => state.parentDimensions.width],
      (width) => ({ width }),
    );
    const chart = getInitialState('chart-one-kept');

    selector(sized(chart, 1));
    selector(sized(chart, 2));
    expect(selector.computationCount()).toBe(2);
    selector(sized(chart, 2));
    expect(selector.computationCount()).toBe(2);

    selector(sized(chart, 1));
    expect(selector.computationCount()).toBe(3);
  });

  it('computes once for a state, and again only when an input is another object', () => {
    const selector = createCustomCachedSelector([(state: GlobalChartState) => state.parentDimensions], ({ width }) => ({
      width,
    }));
    const state = sized(getInitialState('chart-memo'), 1);
    const result = selector(state);
    expect(selector(state)).toBe(result);
    // another state with the same input
    expect(selector({ ...state })).toBe(result);
    expect(selector.computationCount()).toBe(1);

    expect(selector({ ...state, parentDimensions: { ...state.parentDimensions } })).not.toBe(result);
    expect(selector.computationCount()).toBe(2);
  });

  it('keeps what it computed for one chart apart from another chart, even one with the same id', () => {
    const selector = createCustomCachedSelector(
      [(state: GlobalChartState) => state.parentDimensions.width],
      (width) => ({ width }),
    );
    const one = sized(getInitialState('chart'), 1);
    const other = sized(getInitialState('chart'), 1);
    const result = selector(one);
    expect(selector(other)).not.toBe(result);
    expect(selector(other)).toEqual(result);
    expect(selector(one)).toBe(result);
  });

  it('holds on to no state of a chart but the one last asked about', () => {
    const askedOnce = createCustomCachedSelector([(state: GlobalChartState) => state.chartId], (id) => ({ id }));
    const askedAgain = createCustomCachedSelector([(state: GlobalChartState) => state.chartId], (id) => ({ id }));
    const chart = getInitialState('chart-states');
    const earlier = sized(chart, 1);
    const latest = sized(chart, 2);
    askedOnce(earlier);
    askedAgain(earlier);
    askedAgain(latest);
    const memos = selectorMemos.chartMemos(latest);
    expect(reaches(memos, latest)).toBe(true);
    // a selector that is no longer asked would otherwise keep a state for as long as the chart lives
    expect(reaches(memos, earlier)).toBe(false);
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
    expect(selector.computationCount()).toBe(4);
  });
});

describe('selectors and reducers', () => {
  it('a selector asked about the draft of a reducer answers about the state it was given, and logs an error', () => {
    // every object of a draft is new: an answer about one can neither reuse a computation nor be reused
    const error = jest.spyOn(Logger, 'error').mockImplementation(() => {});
    const selector = createCustomCachedSelector([(state: GlobalChartState) => state.parentDimensions], (d) => ({ d }));
    const state = sized(getInitialState('chart-draft'), 1);
    const result = selector(state);
    createNextState(state, (draft) => {
      draft.parentDimensions.width = 2;
      expect(selector(draft as GlobalChartState)).toBe(result);
    });
    expect(error).toHaveBeenCalledTimes(1);
    expect(selector.computationCount()).toBe(1);
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
