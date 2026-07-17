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

// 4-span fixture: each span has both span-level `attributes` and resource-level `service.name`.
// The resource context simulates fromOtlp output (real OtlpEnvelope path is in 12_kibana_trace).
const DATA: TraceDatum[] = [
  {
    id: 'root', name: 'HTTP GET /checkout', start: 0, end: 1000,
    meta: {
      attributes: [{ key: 'http.method', value: 'GET' }],
      resource: { attributes: [{ key: 'service.name', value: 'frontend' }] },
      kind: 2, // SERVER
    },
  },
  {
    id: 'db', name: 'DB.query', parentId: 'root', start: 100, end: 600,
    meta: {
      attributes: [{ key: 'db.system', value: 'postgresql' }],
      resource: { attributes: [{ key: 'service.name', value: 'db-service' }] },
      kind: 3, // CLIENT
    },
  },
  {
    id: 'cache', name: 'Cache.get', parentId: 'root', start: 620, end: 800,
    meta: {
      attributes: [{ key: 'cache.hit', value: 'true' }],
      resource: { attributes: [{ key: 'service.name', value: 'cache-service' }] },
      kind: 3, // CLIENT
    },
  },
  {
    id: 'render', name: 'Template.render', parentId: 'root', start: 820, end: 970,
    meta: {
      attributes: [{ key: 'template.name', value: 'checkout.html' }],
      resource: { attributes: [{ key: 'service.name', value: 'frontend' }] },
      kind: 1, // INTERNAL
    },
  },
];

const BY_SERVICE: TraceColorAccessor = colorByOtelAttribute('service.name');
const BY_KIND: TraceColorAccessor = colorByOtelKind();
/** Custom accessor: groups by a caller-defined tier inferred from span attributes. */
const BY_CUSTOM: TraceColorAccessor = (datum) => {
  const span = datum.meta as { attributes?: { key: string; value: unknown }[] } | undefined;
  const tier = span?.attributes?.find((a) => a.key === 'db.system' || a.key === 'cache.hit');
  if (tier?.key === 'db.system') return 'data-store';
  if (tier?.key === 'cache.hit') return 'cache';
  return 'app';
};

const ACCESSOR_OPTIONS: Record<string, TraceColorAccessor | undefined> = {
  none: undefined, service: BY_SERVICE, kind: BY_KIND, custom: BY_CUSTOM,
};

export const Example: ChartsStory = (_, { title, description }) => {
  const mode = select('color by', Object.keys(ACCESSOR_OPTIONS), 'service');
  const colorBy = ACCESSOR_OPTIONS[mode];

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
      <Settings baseTheme={useBaseTheme()} />
      <Trace id="trace_color_by" data={DATA} xScaleType="linear" colorBy={colorBy} />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Active segments colorize by the chosen category using `theme.colors.vizColors`. ' +
    'Priority: explicit `TraceDatum.color` > `colorBy` group color > themed default. ' +
    'Scroll/zoom position is **not** reset on recolor.\n\n' +
    '- **none** — themed default `activeSegmentColor` for all segments\n' +
    '- **service** — `colorByOtelAttribute(\'service.name\')` (resource attribute)\n' +
    '- **kind** — `colorByOtelKind()` (SERVER / CLIENT / INTERNAL / …)\n' +
    '- **custom** — hand-written accessor: `data-store` | `cache` | `app`',
};
