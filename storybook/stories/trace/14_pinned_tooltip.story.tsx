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
 * Synthetic HTTP-request trace reusing the same fixture as earlier stories.
 * Has multiple spans with clear active/waiting regions so pin behavior is visible on hover.
 */
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
];

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Pinnable tooltip</h2>
        <p style={{ margin: '0 0 4px', color: '#555', fontSize: 13 }}>
          <strong>Right-click</strong> a span to pin the tooltip — it stays visible while you move
          the pointer, zoom, or pan. Dismiss with <strong>Escape</strong>, a left-click anywhere, or
          another right-click.
        </p>
        <ul style={{ margin: '0 0 8px', color: '#555', fontSize: 13, paddingLeft: 20 }}>
          <li>Hover shows a <em>pinning prompt</em> footer ("Right click to pin tooltip").</li>
          <li>While pinned the tooltip is anchored at the frozen click position.</li>
          <li>Right-click over empty canvas space is a no-op.</li>
          <li>Left-click while pinned only unpins — it does not fire onElementClick.</li>
        </ul>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 200 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_pinned_tooltip"
          data={FIXTURE}
          xScaleType="linear"
        />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        5 spans · right-click to pin · Escape or click-away to dismiss
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
