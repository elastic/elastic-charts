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
import { select } from '@storybook/addon-knobs';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const FIXTURE: TraceDatum[] = [
  { id: 'root', name: 'GET /checkout', traceId: 't1', start: 0, end: 1000 },
  {
    id: 'auth',
    name: 'auth.validate',
    parentId: 'root',
    traceId: 't1',
    start: 60,
    end: 200,
    activeSegments: [{ start: 60, end: 200 }],
  },
  {
    id: 'db-read',
    name: 'db.query (read)',
    parentId: 'root',
    traceId: 't1',
    start: 200,
    end: 520,
    activeSegments: [{ start: 200, end: 520 }],
  },
  {
    id: 'cache-get',
    name: 'cache.get',
    parentId: 'root',
    traceId: 't1',
    start: 210,
    end: 310,
    activeSegments: [{ start: 210, end: 310 }],
  },
  {
    id: 'payment',
    name: 'payments.charge',
    parentId: 'root',
    traceId: 't1',
    start: 520,
    end: 860,
    activeSegments: [{ start: 520, end: 860 }],
  },
  {
    id: 'notify',
    name: 'notifications.send',
    parentId: 'root',
    traceId: 't1',
    start: 860,
    end: 980,
    activeSegments: [{ start: 860, end: 980 }],
  },
];

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const dragMode = select<'pan' | 'brush'>('drag mode', { pan: 'pan', brush: 'brush' }, 'pan');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Brush-to-zoom</h2>
        <p style={{ margin: '0 0 4px', color: '#555', fontSize: 13 }}>
          {dragMode === 'pan' ? (
            <>
              <strong>Shift+drag</strong> draws a rubber-band selection &mdash; release to zoom to that time
              window. Plain drag pans as usual.
            </>
          ) : (
            <>
              <strong>Plain drag</strong> draws a rubber-band selection &mdash; release to zoom to that time
              window. Shift+drag pans.
            </>
          )}
        </p>
        <ul style={{ margin: '0 0 8px', color: '#555', fontSize: 13, paddingLeft: 20 }}>
          <li>A drag narrower than 1&nbsp;ms is ignored (no-op).</li>
          <li>Dragging past the canvas edge clamps to the reference domain and still zooms on release.</li>
          <li>Tooltip is suppressed during brushing and resumes after.</li>
          <li>Wheel zoom and kinetic-flywheel pan still work in the non-brush gesture.</li>
        </ul>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 220 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_brush_zoom"
          data={FIXTURE}
          xScaleType="linear"
          dragMode={dragMode}
        />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        6 spans &middot; {dragMode === 'pan' ? 'Shift+drag' : 'plain drag'} to brush-zoom
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
