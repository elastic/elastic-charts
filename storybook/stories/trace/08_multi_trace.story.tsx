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

/**
 * Three independent traces in a single `TraceDatum[]` array, each with a small
 * parent/child nesting so self-time produces visible active segments.
 *
 * Trace t1 — HTTP request pipeline (3 spans)
 * Trace t2 — Background job (2 spans)
 * Trace t3 — Scheduled report (2 spans)
 */
const FIXTURE: TraceDatum[] = [
  // --- trace t1 ---
  { id: 't1-root', name: 'HTTP GET /checkout', traceId: 't1', start: 0, end: 1000 },
  { id: 't1-db', name: 'DB.query', traceId: 't1', parentId: 't1-root', start: 100, end: 600 },
  { id: 't1-cache', name: 'Cache.get', traceId: 't1', parentId: 't1-root', start: 620, end: 800 },

  // --- trace t2 ---
  { id: 't2-root', name: 'Job: nightly-sync', traceId: 't2', start: 0, end: 2000 },
  { id: 't2-fetch', name: 'Fetch.remote', traceId: 't2', parentId: 't2-root', start: 200, end: 1500 },

  // --- trace t3 ---
  { id: 't3-root', name: 'Report: weekly-summary', traceId: 't3', start: 0, end: 500 },
  { id: 't3-render', name: 'PDF.render', traceId: 't3', parentId: 't3-root', start: 50, end: 450 },
];

/** traceId knob options — the 'all' entry maps to undefined, triggering the multi-trace dev-warn. */
const TRACE_OPTIONS: Record<string, string | undefined> = {
  't1 — HTTP request pipeline': 't1',
  't2 — Background job': 't2',
  't3 — Scheduled report': 't3',
  'all (multi-trace — logs dev-warn)': undefined,
};

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const selectedLabel = select('traceId', Object.keys(TRACE_OPTIONS), 't1 — HTTP request pipeline');
  const traceId = TRACE_OPTIONS[selectedLabel];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Spec 8 — Multi-trace filter</h2>
        <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13 }}>
          The fixture contains spans from three distinct traces (t1/t2/t3). Select a trace to filter;
          selecting <strong>"all"</strong> renders every span and logs a dev-warning in the console
          (open DevTools → Console). Switching traces resets the view to fit-all.
        </p>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_multi"
          data={FIXTURE}
          xScaleType="linear"
          traceId={traceId}
        />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        Simple format · 7 spans across 3 traces · traceId filter driven by{' '}
        <code>normalize → selectTrace</code> in the data pipeline
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
