/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import type { TraceColorAccessor, TraceSpec } from '@elastic/charts';
import { Chart, Settings, Trace, colorByOtelAttribute, fromOtlp } from '@elastic/charts';

import { FRONTEND_WEB_OTLP_ENVELOPE } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const BY_SERVICE: TraceColorAccessor = colorByOtelAttribute('service.name');
/**
 * Pre-converted at module load: fromOtlp attaches resource.attributes to each span's meta.
 * activeSegments is set to the full span extent so each lane shows the total duration (Kibana
 * APM waterfall style) rather than self-time (the default when activeSegments is omitted).
 */
const DATA = fromOtlp(FRONTEND_WEB_OTLP_ENVELOPE).map((datum) => ({
  ...datum,
  activeSegments: [{ start: datum.start, end: datum.end }],
}));

const LANE_ORDER_OPTIONS: Record<string, TraceSpec['laneOrder']> = {
  'tree — depth-first nesting (Kibana APM default)': 'tree',
  'chronological — start-time order (Chrome DevTools style)': 'chronological',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const selectedLabel = select(
    'laneOrder',
    Object.keys(LANE_ORDER_OPTIONS),
    'tree — depth-first nesting (Kibana APM default)',
  );
  const laneOrder = LANE_ORDER_OPTIONS[selectedLabel];

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 350 }}>
      <Settings baseTheme={useBaseTheme()} />
      <Trace id="trace_lane_order" data={DATA} xScaleType="linear" colorBy={BY_SERVICE} laneOrder={laneOrder} />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Same Kibana APM dataset rendered in both `laneOrder` modes side-by-side. Toggle the radio ' +
    'buttons to switch between `tree` (depth-first — each parent immediately above its descendants, ' +
    'matching the Kibana trace view) and `chronological` (start-time order, matching the Chrome ' +
    'DevTools Network panel). See ADR 0018 for the trade-off rationale.',
};
