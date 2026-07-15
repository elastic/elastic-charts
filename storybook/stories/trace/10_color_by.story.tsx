/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import type { TraceDatum, TraceColorAccessor } from '@elastic/charts';
import { Chart, Settings, Trace, colorByOtelAttribute, colorByOtelKind } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Fixture — three services, three span kinds, each span carrying both:
 * - span-level `attributes` (e.g. http.method, db.system) — read by colorByOtelAttribute on spans
 * - resource-level context stored on `meta.resource.attributes` — read by colorByOtelAttribute for
 *   service.name (simulates fromOtlp output; stories that use the real OtlpEnvelope path are in 12_kibana_trace)
 */
const FIXTURE: TraceDatum[] = [
  {
    id: 'root',
    name: 'HTTP GET /checkout',
    start: 0,
    end: 1000,
    meta: {
      attributes: [{ key: 'http.method', value: 'GET' }],
      resource: { attributes: [{ key: 'service.name', value: 'frontend' }] },
      kind: 2, // SERVER
    },
  },
  {
    id: 'db',
    name: 'DB.query',
    parentId: 'root',
    start: 100,
    end: 600,
    meta: {
      attributes: [{ key: 'db.system', value: 'postgresql' }],
      resource: { attributes: [{ key: 'service.name', value: 'db-service' }] },
      kind: 3, // CLIENT
    },
  },
  {
    id: 'cache',
    name: 'Cache.get',
    parentId: 'root',
    start: 620,
    end: 800,
    meta: {
      attributes: [{ key: 'cache.hit', value: 'true' }],
      resource: { attributes: [{ key: 'service.name', value: 'cache-service' }] },
      kind: 3, // CLIENT
    },
  },
  {
    id: 'render',
    name: 'Template.render',
    parentId: 'root',
    start: 820,
    end: 970,
    meta: {
      attributes: [{ key: 'template.name', value: 'checkout.html' }],
      resource: { attributes: [{ key: 'service.name', value: 'frontend' }] },
      kind: 1, // INTERNAL
    },
  },
];

/** Module-level const refs — each is stable across renders so the pipeline rebuilds only on knob change. */
const BY_SERVICE: TraceColorAccessor = colorByOtelAttribute('service.name');
const BY_KIND: TraceColorAccessor = colorByOtelKind();
/** Custom accessor: groups by a caller-defined 'tier' stored in meta.attributes */
const BY_CUSTOM: TraceColorAccessor = (datum) => {
  const span = datum.meta as { attributes?: { key: string; value: unknown }[] } | undefined;
  const tier = span?.attributes?.find((a) => a.key === 'db.system' || a.key === 'cache.hit');
  if (tier?.key === 'db.system') return 'data-store';
  if (tier?.key === 'cache.hit') return 'cache';
  return 'app';
};

const ACCESSOR_OPTIONS: Record<string, TraceColorAccessor | undefined> = {
  none: undefined,
  service: BY_SERVICE,
  kind: BY_KIND,
  custom: BY_CUSTOM,
};

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const mode = select('color by', Object.keys(ACCESSOR_OPTIONS), 'service');
  const colorBy = ACCESSOR_OPTIONS[mode];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Spec 9 — Categorical color-by API</h2>
        <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13 }}>
          Active segments colorize by the chosen category using <code>theme.colors.vizColors</code>. Explicit{' '}
          <code>TraceDatum.color</code> wins; <code>colorBy</code> group color is the second priority; the
          themed default is the fallback. Scroll/zoom position is <strong>not</strong> reset on recolor.
        </p>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
        <Settings baseTheme={theme} />
        <Trace id="trace_color_by" data={FIXTURE} xScaleType="linear" colorBy={colorBy} />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        Color-by mode: <strong>{mode}</strong> ·{' '}
        {mode === 'none' && 'All active segments use the themed default activeSegmentColor'}
        {mode === 'service' && 'Grouped by service.name (resource attribute via colorByOtelAttribute)'}
        {mode === 'kind' && 'Grouped by span.kind number (via colorByOtelKind)'}
        {mode === 'custom' && 'Custom accessor: data-store | cache | app'}
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
