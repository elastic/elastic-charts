/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { createSelector } from '@reduxjs/toolkit';
import { isDraft, original } from '@reduxjs/toolkit';

import type { GlobalChartState } from './chart_state';
import { Logger } from '../utils/logger';

/** What a selector computed: for which state, from which inputs, with which result */
interface Computation {
  state: unknown;
  inputs: unknown[];
  result: unknown;
}

/**
 * The key by which the selectors keep what they computed for the chart of a state
 * @internal
 */
export const keySelector = ({ chartId, selectorCacheKey }: GlobalChartState) => selectorCacheKey ?? chartId;

/**
 * What the selectors remember, in one table for each chart: the selectors themselves hold nothing. Dropping
 * the table of a chart drops everything computed for it, and nothing is made for a chart but its table.
 */
class GlobalSelectorCache {
  private readonly charts = new Map<string, Map<unknown, Computation>>();

  /** what the selectors last computed for a chart */
  ofChart(key: string): Map<unknown, Computation> {
    let ofChart = this.charts.get(key);
    if (!ofChart) this.charts.set(key, (ofChart = new Map()));
    return ofChart;
  }

  removeKeyFromAll(key: string) {
    this.charts.delete(key);
  }
}

/**
 * Global singleton to manage state of selector caches
 *
 * @internal
 */
export const globalSelectorCache = new GlobalSelectorCache();

/**
 * Makes a memoized selector of the chart state: `createCustomCachedSelector([...inputSelectors], combiner)`.
 * It keeps its last computation for each chart, and computes again only when an input selector returns
 * something else than it did for that one.
 *
 * One computation is enough because a selector is asked about one line of states: those that the store of
 * a chart holds, one after the other. A reducer has to ask about the state it was given, not about the draft
 * it writes to, of which every object is new: an answer about a draft would be computed from scratch, and
 * would replace the computation that the next state could have used. Asked about a draft all the same, it
 * logs an error and answers about the state the reducer was given.
 *
 * Typed as `createSelector` of reselect, whose call signatures and inference its call sites rely on.
 *
 * @internal
 */
export const createCustomCachedSelector = ((...args: any[]) => {
  const combiner: (...inputs: unknown[]) => unknown = args.at(-1);
  const inputSelectors: Array<(...a: unknown[]) => unknown> = args.slice(0, -1).flat();
  let recomputations = 0;

  const selector = (asked: GlobalChartState, ...rest: unknown[]) => {
    let state = asked;
    if (isDraft(asked)) {
      Logger.error('A selector was asked about the draft of a reducer. It answers about the state the reducer got.');
      state = original(asked) ?? asked;
    }
    const ofChart = globalSelectorCache.ofChart(keySelector(state));
    const last = ofChart.get(selector);
    // the state it was last asked about: the same result, with no input to look at
    if (last && last.state === state && rest.length === 0) return last.result;
    const inputs = inputSelectors.map((input) => input(state, ...rest));
    if (last && last.inputs.every((input, i) => input === inputs[i])) {
      last.state = state;
      return last.result;
    }
    recomputations++;
    const result = combiner(...inputs);
    ofChart.set(selector, { state, inputs, result });
    return result;
  };
  selector.recomputations = () => recomputations;
  return selector;
}) as unknown as typeof createSelector;
