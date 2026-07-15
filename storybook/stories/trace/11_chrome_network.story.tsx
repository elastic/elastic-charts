/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { TraceDatum, TraceColorAccessor } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/** Custom meta type for Chrome Network-style spans. */
interface NetworkMeta {
  type: 'document' | 'script' | 'stylesheet' | 'image' | 'xhr' | 'font';
}

/**
 * Synthetic HTTP request waterfall mimicking Chrome DevTools Network panel aesthetics.
 * Spans are colored by resource type; the root "document" span is the longest.
 */
const FIXTURE: TraceDatum[] = [
  // navigation
  { id: 'nav', name: 'index.html', start: 0, end: 850, meta: { type: 'document' } as NetworkMeta },
  // critical scripts
  { id: 'react', name: 'react.production.min.js', start: 60, end: 280, parentId: 'nav', meta: { type: 'script' } as NetworkMeta },
  { id: 'app', name: 'app.bundle.js', start: 80, end: 490, parentId: 'nav', meta: { type: 'script' } as NetworkMeta },
  // stylesheets
  { id: 'main-css', name: 'main.css', start: 55, end: 180, parentId: 'nav', meta: { type: 'stylesheet' } as NetworkMeta },
  { id: 'fonts-css', name: 'fonts.css', start: 58, end: 170, parentId: 'nav', meta: { type: 'stylesheet' } as NetworkMeta },
  // fonts
  { id: 'inter', name: 'Inter-Regular.woff2', start: 180, end: 310, parentId: 'nav', meta: { type: 'font' } as NetworkMeta },
  { id: 'inter-bold', name: 'Inter-Bold.woff2', start: 185, end: 315, parentId: 'nav', meta: { type: 'font' } as NetworkMeta },
  // images
  { id: 'logo', name: 'logo.svg', start: 200, end: 260, parentId: 'nav', meta: { type: 'image' } as NetworkMeta },
  { id: 'hero', name: 'hero.webp', start: 210, end: 480, parentId: 'nav', meta: { type: 'image' } as NetworkMeta },
  // XHR / API calls
  { id: 'api-user', name: '/api/user', start: 500, end: 640, parentId: 'nav', meta: { type: 'xhr' } as NetworkMeta },
  { id: 'api-cart', name: '/api/cart', start: 510, end: 700, parentId: 'nav', meta: { type: 'xhr' } as NetworkMeta },
  { id: 'api-promo', name: '/api/promos', start: 520, end: 820, parentId: 'nav', meta: { type: 'xhr' } as NetworkMeta },
];

/** Stable module-level accessor: groups spans by their NetworkMeta.type. */
const BY_RESOURCE_TYPE: TraceColorAccessor = (datum) => {
  const span = datum.meta as NetworkMeta | undefined;
  return span?.type;
};

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Spec 9 — Chrome DevTools Network waterfall</h2>
        <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13 }}>
          Synthetic HTTP request spans colored by resource type (document / script / stylesheet / image /
          xhr / font) using a custom <code>TraceColorAccessor</code> that reads{' '}
          <code>datum.meta.type</code>.
        </p>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 350 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_chrome_network"
          data={FIXTURE}
          xScaleType="linear"
          colorBy={BY_RESOURCE_TYPE}
        />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        12 spans · 6 resource types (document / script / stylesheet / image / xhr / font) · custom accessor
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
