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
 * The unique key of the chart a state belongs to: its chart ID, where no store gave it one
 * @internal
 */
export const uniqueChartKeyOf = ({ chartId, uniqueChartKey }: GlobalChartState) => uniqueChartKey ?? chartId;

/**
 * What the selectors computed, in one table for each chart instance: the selectors themselves hold nothing.
 * Deleting the table of a chart frees all that was computed for it; a chart adds nothing here but its table.
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
 * For each chart it keeps its latest computation, and computes again only when an input selector returns
 * something other than it did for that computation.
 *
 * One computation is enough because the states it is asked about form a single sequence: those that the
 * store of the chart holds, one after the other. So a reducer has to ask about the state it was given, not
 * the draft it writes to. Every object of a draft is new: an answer about one is computed from scratch, and
 * replaces the computation that the next state could have reused. If asked about a draft anyway, the
 * selector logs an error and answers about the state the reducer was given.
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
      Logger.error(
        'A selector was called with a draft state, from inside a reducer. It used the state the draft was made from; pass that state instead.',
      );
      state = original(asked) ?? asked;
    }
    const ofChart = globalSelectorCache.ofChart(uniqueChartKeyOf(state));
    const last = ofChart.get(selector);
    // the same state as the last time: the same result, without asking the input selectors
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
