/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * A synthetic HTTP-request-lifecycle trace where each span models three execution phases:
 * `loading` (initial setup / DNS / TLS), `process` (in-flight I/O), and `final` (teardown /
 * response parsing). All `loading` segments across every span share one palette color, `process`
 * another, and `final` a third — demonstrating cross-span label color stability.
 *
 * Each segment uses the optional `label` field introduced in this spec; no explicit `color` is
 * set on any segment so the palette is assigned automatically from `theme.colors.vizColors`.
 */
const FIXTURE: TraceDatum[] = [
  {
    id: 'root',
    name: 'GET /checkout',
    start: 0,
    end: 1000,
    activeSegments: [
      { start: 0, end: 60, label: 'loading' },
      { start: 60, end: 920, label: 'process' },
      { start: 920, end: 1000, label: 'final' },
    ],
  },
  {
    id: 'auth',
    name: 'auth.validate',
    parentId: 'root',
    start: 60,
    end: 200,
    activeSegments: [
      { start: 60, end: 80, label: 'loading' },
      { start: 80, end: 185, label: 'process' },
      { start: 185, end: 200, label: 'final' },
    ],
  },
  {
    id: 'db-read',
    name: 'db.query (read)',
    parentId: 'root',
    start: 200,
    end: 520,
    activeSegments: [
      { start: 200, end: 230, label: 'loading' },
      { start: 230, end: 490, label: 'process' },
      { start: 490, end: 520, label: 'final' },
    ],
  },
  {
    id: 'cache-get',
    name: 'cache.get',
    parentId: 'root',
    start: 210,
    end: 310,
    activeSegments: [
      { start: 210, end: 220, label: 'loading' },
      { start: 220, end: 295, label: 'process' },
      { start: 295, end: 310, label: 'final' },
    ],
  },
  {
    id: 'payment',
    name: 'payments.charge',
    parentId: 'root',
    start: 520,
    end: 860,
    activeSegments: [
      { start: 520, end: 560, label: 'loading' },
      { start: 560, end: 820, label: 'process' },
      { start: 820, end: 860, label: 'final' },
    ],
  },
];

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Segment phases — loading / process / final</h2>
        <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13 }}>
          Each active segment carries a <code>label</code> (phase name). Segments with the same label
          get the same palette color across all spans — <em>loading</em> is always the first palette
          color, <em>process</em> the second, <em>final</em> the third. Hover a segment to see its
          label in the tooltip.
        </p>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 180 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_segment_phases"
          data={FIXTURE}
          xScaleType="linear"
        />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        5 spans · 3 phases (loading / process / final) · automatic palette assignment via{' '}
        <code>TraceActiveSegment.label</code>
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
