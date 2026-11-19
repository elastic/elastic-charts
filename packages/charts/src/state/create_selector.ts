/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { createSelector } from '@reduxjs/toolkit';

import type { GlobalChartState } from './chart_state';

/** What a selector computed: for which state, from which inputs, with which result */
interface Computation {
  state: unknown;
  inputs: unknown[];
  result: unknown;
}

/**
 * How many computations a selector keeps for a chart. Two capture all of the hit rate; each one can hold on to
 * large objects (geometry arrays, scales, tooltip info), for every selector of every chart on the page.
 */
const KEPT = 2;

const keySelector = ({ chartId, selectorCacheKey }: GlobalChartState) => selectorCacheKey ?? chartId;

/**
 * What the selectors remember, in one table for each chart: the selectors themselves hold nothing. Dropping
 * the table of a chart drops everything computed for it, and nothing is made for a chart but its table.
 */
class GlobalSelectorCache {
  private readonly charts = new Map<string, Map<unknown, Computation[]>>();

  computations(key: string, selector: unknown): Computation[] {
    let ofChart = this.charts.get(key);
    if (!ofChart) this.charts.set(key, (ofChart = new Map()));
    let computations = ofChart.get(selector);
    if (!computations) ofChart.set(selector, (computations = []));
    return computations;
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
 * It computes again only when an input selector returns something else than for the computations it kept,
 * which it keeps apart for each chart, by `chartId`.
 *
 * Typed as `createSelector` of reselect, whose call signatures and inference its call sites rely on.
 *
 * @internal
 */
export const createCustomCachedSelector = ((...args: any[]) => {
  const combiner: (...inputs: unknown[]) => unknown = args.at(-1);
  const inputSelectors: Array<(...a: unknown[]) => unknown> = args.slice(0, -1).flat();
  let recomputations = 0;

  const selector = (state: GlobalChartState, ...rest: unknown[]) => {
    const kept = globalSelectorCache.computations(keySelector(state), selector);
    // the state it was last asked about: the same result, with no input to look at
    let at = rest.length === 0 ? kept.findIndex((c) => c.state === state) : -1;
    let computation = kept[at];
    if (!computation) {
      const inputs = inputSelectors.map((input) => input(state, ...rest));
      at = kept.findIndex((c) => c.inputs.every((input, i) => input === inputs[i]));
      computation = kept[at];
      if (computation) computation.state = state;
      else {
        recomputations++;
        computation = { state, inputs, result: combiner(...inputs) };
      }
    }
    // the latest first; past what is kept, the oldest goes
    if (at !== 0) {
      if (at > 0) kept.splice(at, 1);
      else if (kept.length === KEPT) kept.pop();
      kept.unshift(computation);
    }
    return computation.result;
  };
  selector.recomputations = () => recomputations;
  return selector;
}) as unknown as typeof createSelector;
