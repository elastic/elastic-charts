/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactElement } from 'react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ChartType } from '../chart_types';
import { Chart, type ChartProps } from '../components/chart';
import type { HeadlessRender } from '../components/headless_context';
import { HeadlessContext } from '../components/headless_context';
import type { Spec } from '../specs/spec_type';
import { updateParentDimensions, updateRenderer } from '../state/actions/chart_settings';
import { specParsed, upsertSpecs } from '../state/actions/specs';
import { globalSelectorCache } from '../state/create_selector';

/** these draw on a canvas of their own (word cloud layout, WebGL), which needs a DOM */
const NEEDS_A_DOM: ReadonlySet<ChartType | null> = new Set([ChartType.Wordcloud, ChartType.Flame, ChartType.Timeslip]);

/**
 * Renders a chart to markup without a DOM: one root element holding the chart drawn as an inline
 * `<svg>` and, as HTML, its legend or its metric panels. Style it with the Charts stylesheet.
 *
 * The element must be a `Chart` with numeric width and height in pixels. Use the same module format and installed
 * copy of Charts for the renderer and every chart component. Its title and description are omitted.
 * Word cloud, flame and timeslip charts are not supported: they draw on a canvas of their own.
 *
 * Text is measured with Helvetica's advance widths, whatever the font of the theme, so
 * layout that depends on text width is close to a browser's but not identical.
 * @public
 */
export function renderChart(chart: ReactElement): string {
  if (!React.isValidElement<ChartProps>(chart) || chart.type !== Chart) {
    throw new Error('renderChart expects a <Chart> element from the same @elastic/charts build');
  }

  // The title and description are HTML outside the measured chart area. Omit them from both
  // passes so that neither the markup nor chart-specific layout reserves room for them.
  const headlessChart = React.cloneElement(chart, { title: undefined, description: undefined });

  // effects do not run here, so a first pass gathers what they would have put into the store
  const specs = new Map<string, Spec>();
  const collecting: HeadlessRender = { charts: 0, collect: (spec) => specs.set(spec.id, spec) };
  renderToStaticMarkup(<HeadlessContext.Provider value={collecting}>{headlessChart}</HeadlessContext.Provider>);

  const { store, size, charts } = collecting;
  if (!store || charts !== 1) throw new Error(`renderChart expects one Chart, the element rendered ${charts}`);
  if (!size) throw new Error('renderChart needs a Chart with numeric width and height in pixels');

  // from here on the chart's memoized selectors fill up, so everything is inside the `try`
  const { chartId } = store.getState();
  try {
    store.dispatch(updateRenderer('svg'));
    store.dispatch(upsertSpecs([...specs.values()]));
    store.dispatch(specParsed());
    store.dispatch(updateParentDimensions({ ...size, top: 0, left: 0 }));

    const { chartType } = store.getState();
    if (NEEDS_A_DOM.has(chartType)) throw new Error(`renderChart does not support ${chartType} charts`);

    return renderToStaticMarkup(
      <HeadlessContext.Provider value={{ charts: 1, store }}>{headlessChart}</HeadlessContext.Provider>,
    );
  } finally {
    // nothing unmounts here, which is what frees a chart's memoized selectors in a browser;
    // a render that fails must free them too
    globalSelectorCache.removeKeyFromAll(chartId);
  }
}
