/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Settings, Trace, fromOtlp } from '@elastic/charts';

import { FRONTEND_WEB_OTLP_ENVELOPE } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// `spanDisplay="duration"` (below) renders full-extent bars (Kibana APM waterfall look) while
// self-time-derived active segments still drive selfTime/tooltip/SR (ADR 0035).
const DATA = fromOtlp(FRONTEND_WEB_OTLP_ENVELOPE);

const LABEL_POSITION_OPTIONS = {
  'gutter — fixed left panel (default)': 'gutter',
  'inline — row below the bar, Kibana APM style': 'inline',
  'none — no canvas labels (tooltip + screen reader)': 'none',
} as const;

type LabelPositionKey = keyof typeof LABEL_POSITION_OPTIONS;

const WIDTH_OPTIONS: Record<string, number | string> = {
  'mobile (320px)': 320,
  'side-panel (480px)': 480,
  'full (800px)': 800,
  'fill container': '100%',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const labelKey = select<LabelPositionKey>(
    'labelPosition',
    Object.keys(LABEL_POSITION_OPTIONS) as LabelPositionKey[],
    'gutter — fixed left panel (default)',
  );
  const labelPosition = LABEL_POSITION_OPTIONS[labelKey];

  const widthKey = select('width', Object.keys(WIDTH_OPTIONS), 'fill container');
  const chartWidth = WIDTH_OPTIONS[widthKey];

  return (
    <Chart title={title} description={description} size={{ width: chartWidth, height: 350 }}>
      {/* Inline mode collapses the gutter and auto-derives a taller laneHeight for the label row,
          so no laneHeight override is needed here. */}
      <Settings baseTheme={useBaseTheme()} theme={{ trace: { labelPosition } }} />
      <Trace
        id="trace_responsive"
        data={DATA}
        xScaleType="linear"
        spanDisplay="duration"
        colorBy={{ otelAttribute: 'service.name' }}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Demonstrates `theme.trace.labelPosition` — the responsive label control.\n\n' +
    '- **`gutter`** (default): span names drawn in a fixed left panel. `gutterWidth=200`, `laneHeight=24`.\n' +
    "- **`inline`**: span names drawn on a row below the bar, starting near the bar's start edge and " +
    'overflowing right (Kibana APM style). The gutter collapses to `0` and the lane height is ' +
    'auto-derived taller (min 40) to fit the two-band lane — no `laneHeight` override needed. ' +
    "Labels are not cropped to the bar width; they clip only at the plot's right edge.\n" +
    '- **`none`**: no canvas labels. Names remain accessible via the tooltip and the screen-reader table.\n\n' +
    'Use the **width** knob to try mobile (320 px) and side-panel (480 px) presets with `inline` mode. ' +
    'Auto-switching based on container width is not yet implemented.',
};
