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

const LABEL_POSITION_OPTIONS = {
  'gutter — fixed left panel (default)': 'gutter',
  'inline — row below the bar, Kibana APM style': 'inline',
  'none — no canvas labels (tooltip + screen reader)': 'none',
} as const;

type LabelPositionKey = keyof typeof LABEL_POSITION_OPTIONS;

export const Example: ChartsStory = (_, { title, description }) => {
  const labelKey = select<LabelPositionKey>(
    'labelPosition',
    Object.keys(LABEL_POSITION_OPTIONS) as LabelPositionKey[],
    'gutter — fixed left panel (default)',
  );
  const labelPosition = LABEL_POSITION_OPTIONS[labelKey];

  const isInline = labelPosition === 'inline';

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 400 }}>
      <Settings
        baseTheme={useBaseTheme()}
        theme={{
          trace: {
            laneHeight: isInline ? 40 : 24,
            labelPosition,
          },
        }}
      />
      <Trace
        id="trace_collapsible"
        data={DATA}
        xScaleType="linear"
        colorBy={BY_SERVICE}
        laneOrder="tree"
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Demonstrates **collapsible nesting** (Spec 21) on the same Kibana APM 4-service trace. ' +
    'In `tree` mode, every parent span shows a depth-indented caret (`▶`/`▼`) in the disclosure ' +
    'gutter to its left.\n\n' +
    '**Click a caret** to collapse a subtree. Descendant lanes disappear; the parent bar widens ' +
    'to a *rolled-up* view — the union of every active segment in the hidden subtree, merged and ' +
    'deduped, clamped to the parent extent. **Click again** (or focus the parent row and press ' +
    '**`c`**) to expand.\n\n' +
    'Switch `labelPosition` to **`inline`** or **`none`** via the knob — the caret gutter is ' +
    'reserved in every label mode so collapse works regardless of how span names are shown.',
};
