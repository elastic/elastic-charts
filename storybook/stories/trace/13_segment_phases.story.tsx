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

// 5-span HTTP lifecycle, each span split into 3 labeled phases.
// Segments that share a label get the same palette color across all spans
// (cross-span color stability): loading=vizColors[0], process=[1], final=[2].
const DATA: TraceDatum[] = [
  {
    id: 'root', name: 'GET /checkout', start: 0, end: 1000,
    activeSegments: [
      { start: 0,   end: 60,  label: 'loading' },
      { start: 60,  end: 920, label: 'process' },
      { start: 920, end: 1000,label: 'final'   },
    ],
  },
  {
    id: 'auth', name: 'auth.validate', parentId: 'root', start: 60, end: 200,
    activeSegments: [
      { start: 60,  end: 80,  label: 'loading' },
      { start: 80,  end: 185, label: 'process' },
      { start: 185, end: 200, label: 'final'   },
    ],
  },
  {
    id: 'db-read', name: 'db.query (read)', parentId: 'root', start: 200, end: 520,
    activeSegments: [
      { start: 200, end: 230, label: 'loading' },
      { start: 230, end: 490, label: 'process' },
      { start: 490, end: 520, label: 'final'   },
    ],
  },
  {
    id: 'cache-get', name: 'cache.get', parentId: 'root', start: 210, end: 310,
    activeSegments: [
      { start: 210, end: 220, label: 'loading' },
      { start: 220, end: 295, label: 'process' },
      { start: 295, end: 310, label: 'final'   },
    ],
  },
  {
    id: 'payment', name: 'payments.charge', parentId: 'root', start: 520, end: 860,
    activeSegments: [
      { start: 520, end: 560, label: 'loading' },
      { start: 560, end: 820, label: 'process' },
      { start: 820, end: 860, label: 'final'   },
    ],
  },
];

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 180 }}>
    <Settings baseTheme={useBaseTheme()} />
    <Trace id="trace_segment_phases" data={DATA} xScaleType="linear" />
  </Chart>
);

Example.parameters = {
  markdown:
    'Each `TraceActiveSegment` carries an optional `label` (phase name). Segments sharing a label ' +
    'receive the same color from `theme.colors.vizColors` across all spans — `loading` is always ' +
    'vizColors[0], `process` [1], `final` [2]. No explicit `color` is set; palette assignment is ' +
    'automatic. Hover a segment to see its label in the tooltip.',
};
