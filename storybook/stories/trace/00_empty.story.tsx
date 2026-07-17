/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
    <Settings baseTheme={useBaseTheme()} />
    <Trace id="trace_empty" data={[]} />
  </Chart>
);

Example.parameters = {
  markdown:
    'Renders `<Trace data={[]} />` with no spans. Shows the standard library empty state ' +
    '("No data to display"), which callers can override via `Settings.noResults`.',
};
