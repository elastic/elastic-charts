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

import type { HeadlessRender } from '../components/headless_context';
import { HeadlessContext } from '../components/headless_context';
import type { Spec } from '../specs/spec_type';
import { updateParentDimensions, updateRenderer } from '../state/actions/chart_settings';
import { specParsed, upsertSpecs } from '../state/actions/specs';
import { globalSelectorCache } from '../state/create_selector';

/**
 * Renders a chart to markup without a DOM: one root element holding the chart drawn as an inline
 * `<svg>` and, as HTML, its legend or its metric panels. Style it with the Charts stylesheet.
 *
 * The element is a `Chart` with a `size` in pixels, or a tree that renders exactly one.
 * @public
 */
export function renderChart(chart: ReactElement): string {
  // effects do not run here, so a first pass gathers what they would have put into the store
  const specs = new Map<string, Spec>();
  const collecting: HeadlessRender = { charts: 0, collect: (spec) => specs.set(spec.id, spec) };
  renderToStaticMarkup(<HeadlessContext.Provider value={collecting}>{chart}</HeadlessContext.Provider>);

  const { store, size, charts } = collecting;
  if (!store || charts !== 1) throw new Error(`renderChart expects one Chart, the element rendered ${charts}`);
  if (!size) throw new Error('renderChart needs a Chart with a size in pixels');

  store.dispatch(updateRenderer('svg'));
  store.dispatch(upsertSpecs([...specs.values()]));
  store.dispatch(specParsed());
  store.dispatch(updateParentDimensions({ ...size, top: 0, left: 0 }));

  try {
    return renderToStaticMarkup(
      <HeadlessContext.Provider value={{ charts: 1, store }}>{chart}</HeadlessContext.Provider>,
    );
  } finally {
    // nothing unmounts here, which is what frees a chart's memoized selectors in a browser
    globalSelectorCache.removeKeyFromAll(store.getState().chartId);
  }
}
