/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { TraceColorAccessor } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { NetworkMeta } from './data';
import { CHROME_NETWORK_SPANS } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/** Color accessor: reads `datum.meta.type` to group spans by resource type. */
const BY_RESOURCE_TYPE: TraceColorAccessor = (datum) => (datum.meta as NetworkMeta | undefined)?.type;

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 350 }}>
    <Settings baseTheme={useBaseTheme()} />
    <Trace
      id="trace_chrome_network"
      data={CHROME_NETWORK_SPANS}
      xScaleType="linear"
      colorBy={BY_RESOURCE_TYPE}
      laneOrder="chronological"
    />
  </Chart>
);

Example.parameters = {
  markdown:
    'Synthetic page-load waterfall with 12 spans colored by resource type — mimicking the Chrome ' +
    'DevTools Network panel. A custom `TraceColorAccessor` reads `datum.meta.type` ' +
    '(`document` / `script` / `stylesheet` / `image` / `xhr` / `font`) to derive the color group.',
};
