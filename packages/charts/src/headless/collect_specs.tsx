/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactNode } from 'react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';

import type { Spec } from '../specs/spec_type';
import { createChartStore } from '../state/chart_state';
import { SpecCollectorContext } from '../state/spec_factory';

/**
 * Collects the specs that `element` declares (`<Settings>`, `<Axis>`, `<LineSeries>`, ...), with
 * their defaults applied, by rendering it on the server. `element` can be bare spec components or
 * a component that renders a `<Chart>`; nothing is mounted and no DOM is needed.
 * @public
 */
export function collectSpecs(element: ReactNode): Spec[] {
  const specs = new Map<string, Spec>();
  const collect = (spec: Spec) => specs.set(spec.id, spec);
  // Spec components need a chart store in context even though nothing is dispatched to it here.
  const store = createChartStore('headless-specs');
  renderToStaticMarkup(
    <Provider store={store}>
      <SpecCollectorContext.Provider value={collect}>{element}</SpecCollectorContext.Provider>
    </Provider>,
  );
  return [...specs.values()];
}
