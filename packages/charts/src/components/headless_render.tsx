/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactElement } from 'react';
import React from 'react';

import type { ChartProps } from './chart';
import type { HeadlessRender } from './headless_context';
import { HeadlessContext } from './headless_context';
import { ChartType } from '../chart_types';
import type { Spec } from '../specs/spec_type';
import { updateParentDimensions, updateRenderer } from '../state/actions/chart_settings';
import { specParsed, upsertSpecs } from '../state/actions/specs';
import { selectorMemos } from '../state/create_selector';

/** these draw on a canvas of their own (word cloud layout, WebGL), which needs a DOM */
const NEEDS_A_DOM: ReadonlySet<ChartType | null> = new Set([ChartType.Wordcloud, ChartType.Flame, ChartType.Timeslip]);

/**
 * Renders a `Chart` element to markup without a DOM, given the function that writes an element as markup.
 *
 * It is here and not in the headless entry so that the entry needs nothing of the chart but the `Chart` class:
 * a chart keeps module state (its store, the memoized selectors), of which there has to be one copy.
 * @internal
 */
export function renderHeadless(chart: ReactElement<ChartProps>, toMarkup: (element: ReactElement) => string): string {
  // The title and description are HTML outside the measured chart area. Omit them from both
  // passes so that neither the markup nor chart-specific layout reserves room for them.
  const headlessChart = React.cloneElement(chart, { title: undefined, description: undefined });

  // effects do not run here, so a first pass gathers what they would have put into the store
  const specs = new Map<string, Spec>();
  const collecting: HeadlessRender = { charts: 0, collect: (spec) => specs.set(spec.id, spec) };
  try {
    toMarkup(<HeadlessContext.Provider value={collecting}>{headlessChart}</HeadlessContext.Provider>);

    const { store, size, charts } = collecting;
    if (!store || charts !== 1) throw new Error(`renderChart expects one Chart, the element rendered ${charts}`);
    if (!size || !(size.width > 0 && size.height > 0 && Number.isFinite(size.width + size.height))) {
      throw new Error('renderChart needs a Chart with positive numeric width and height in pixels');
    }

    store.dispatch(updateRenderer('svg'));
    store.dispatch(upsertSpecs([...specs.values()]));
    store.dispatch(specParsed());
    store.dispatch(updateParentDimensions({ ...size, top: 0, left: 0 }));

    const { chartType } = store.getState();
    if (NEEDS_A_DOM.has(chartType)) throw new Error(`renderChart does not support ${chartType} charts`);

    return toMarkup(<HeadlessContext.Provider value={{ charts: 1, store }}>{headlessChart}</HeadlessContext.Provider>);
  } finally {
    // The memos of this chart go at once, on every way out. Its states would keep them for a while: React
    // holds on to the store of a render that threw until it renders again.
    const key = collecting.store?.getState().uniqueChartKey;
    if (key) selectorMemos.release(key);
  }
}
