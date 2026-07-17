/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// Three independent traces in one TraceDatum[] array — traceId partitions them.
// t1: HTTP request pipeline (3 spans)
// t2: Background job        (2 spans)
// t3: Scheduled report      (2 spans)
const DATA: TraceDatum[] = [
  { id: 't1-root',   name: 'HTTP GET /checkout',   traceId: 't1', start: 0,    end: 1000 },
  { id: 't1-db',     name: 'DB.query',             traceId: 't1', parentId: 't1-root',   start: 100, end: 600 },
  { id: 't1-cache',  name: 'Cache.get',            traceId: 't1', parentId: 't1-root',   start: 620, end: 800 },
  { id: 't2-root',   name: 'Job: nightly-sync',    traceId: 't2', start: 0,    end: 2000 },
  { id: 't2-fetch',  name: 'Fetch.remote',         traceId: 't2', parentId: 't2-root',   start: 200, end: 1500 },
  { id: 't3-root',   name: 'Report: weekly-summary',traceId: 't3', start: 0,   end: 500 },
  { id: 't3-render', name: 'PDF.render',           traceId: 't3', parentId: 't3-root',   start: 50,  end: 450 },
];

/** traceId options — 'all' maps to undefined, which triggers the multi-trace dev-warn. */
const TRACE_OPTIONS: Record<string, string | undefined> = {
  't1 — HTTP request pipeline': 't1',
  't2 — Background job':        't2',
  't3 — Scheduled report':      't3',
  'all (logs dev-warn)':         undefined,
};

export const Example: ChartsStory = (_, { title, description }) => {
  const selectedLabel = select('traceId', Object.keys(TRACE_OPTIONS), 't1 — HTTP request pipeline');
  const traceId = TRACE_OPTIONS[selectedLabel];

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
      <Settings baseTheme={useBaseTheme()} />
      <Trace id="trace_multi" data={DATA} xScaleType="linear" traceId={traceId} />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'The `data` array contains spans from three distinct traces (`t1`/`t2`/`t3`). ' +
    'The `traceId` prop filters to a single trace; passing `undefined` renders all spans and ' +
    'logs a dev-warning in the console. Switching traces resets the viewport to fit-all.',
};
