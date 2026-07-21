/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { TraceCriticalPath, TraceColorAccessor } from '@elastic/charts';
import { Chart, Settings, Trace, colorByOtelAttribute, fromOtlp } from '@elastic/charts';

import { FRONTEND_WEB_OTLP_ENVELOPE } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { boolean, color, select } from '@storybook/addon-knobs';

/** Groups spans by the `service.name` resource attribute. Stable module-level reference (ADR 0006). */
const BY_SERVICE: TraceColorAccessor = colorByOtelAttribute('service.name');

/**
 * Pre-converted from OTel. activeSegments set to the full span extent (Kibana APM waterfall style).
 * Span IDs and epoch-ms timestamps come from the FRONTEND_WEB_OTLP_ENVELOPE fixture (story 12).
 *
 * Service topology (10 spans, 200 ms total):
 *   frontend-web → product-recommendation → inventory-service
 *                                         → user-preference-service
 */
const DATA = fromOtlp(FRONTEND_WEB_OTLP_ENVELOPE).map((datum) => ({
  ...datum,
  activeSegments: [{ start: datum.start, end: datum.end }],
}));

// The trace starts at this epoch-ms value (derived from the OTel fixture).
// All criticalPath times below are raw epoch-ms (the chart re-zeros them in 'linear' mode).
const BASE_MS = 1784212100146; // 1784212100146000000 ns ÷ 1e6

/**
 * Hand-authored critical path covering the gating chain in the 4-service trace.
 *
 * Critical chain (epoch-ms offsets from BASE_MS):
 *  1. `6882200000080949` root `GET /products` (frontend-web): waiting gap [+150, +200] —
 *     the last 50 ms after the recommendation child returns, while the root span completes.
 *     This is a *waiting-region* interval (not an active segment), demonstrating that critical
 *     intervals may fall anywhere in [start, end].
 *  2. `6882200000080945` `GET /recommendations` (product-recommendation): full [0, +150] —
 *     the gating parent span.
 *  3. `6882200000080935` `GET /products` (inventory-service): sub-segment [0, +30] —
 *     only the first 30 ms (before the `SELECT` child starts), demonstrating interval precision:
 *     the drawn line is narrower than the full active segment.
 *  4. `6882200000080933` `SELECT * FROM products` (inventory-service): [+30, +100] — the
 *     SQL query that gated the inventory response.
 */
const CRITICAL_PATH: TraceCriticalPath = [
  // Waiting gap in the root — demonstrates critical path can cover waiting regions.
  { spanId: '6882200000080949', start: BASE_MS + 150, end: BASE_MS + 200 },
  // Full gating recommendation span.
  { spanId: '6882200000080945', start: BASE_MS, end: BASE_MS + 150 },
  // Sub-segment: only the first 30 ms of the inventory GET /products (before SELECT starts).
  { spanId: '6882200000080935', start: BASE_MS, end: BASE_MS + 30 },
  // The blocking SQL query.
  { spanId: '6882200000080933', start: BASE_MS + 30, end: BASE_MS + 100 },
];

const LABEL_POSITION_OPTIONS = {
  'inline — row below the bar (Kibana APM style)': 'inline',
  'gutter — fixed left panel (default)': 'gutter',
  'none — omit canvas labels': 'none',
} as const;
type LabelPositionKey = keyof typeof LABEL_POSITION_OPTIONS;

const X_SCALE_OPTIONS = {
  'linear — re-zeroed elapsed ms (default)': 'linear',
  'time — epoch-ms (raw OTel timestamps)': 'time',
} as const;
type XScaleKey = keyof typeof X_SCALE_OPTIONS;

export const Example: ChartsStory = (_, { title, description }) => {
  const showCriticalPath = boolean('Show critical path', true);

  const labelKey = select<LabelPositionKey>(
    'labelPosition',
    Object.keys(LABEL_POSITION_OPTIONS) as LabelPositionKey[],
    'inline — row below the bar (Kibana APM style)',
  );
  const labelPosition = LABEL_POSITION_OPTIONS[labelKey];

  const xScaleKey = select<XScaleKey>(
    'xScaleType',
    Object.keys(X_SCALE_OPTIONS) as XScaleKey[],
    'linear — re-zeroed elapsed ms (default)',
  );
  const xScaleType = X_SCALE_OPTIONS[xScaleKey];

  const criticalPathColor = color('Critical path color', '#C61E25');

  const isInline = labelPosition === 'inline';

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 350 }}>
      <Settings
        baseTheme={useBaseTheme()}
        theme={{
          trace: {
            labelPosition,
            laneHeight: isInline ? 40 : 24,
            criticalPathColor,
          },
        }}
      />
      <Trace
        id="trace_critical_path"
        data={DATA}
        xScaleType={xScaleType}
        colorBy={BY_SERVICE}
        criticalPath={showCriticalPath ? CRITICAL_PATH : undefined}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Real 4-service distributed trace with a hand-authored `criticalPath`. ' +
    'The critical path covers the gating chain: root waiting gap [+150,+200], the full ' +
    'recommendation span, a **sub-segment** of the inventory `GET /products` (first 30 ms only), ' +
    'and the blocking SQL query. Toggle **Show critical path** to confirm presence-is-toggle. ' +
    'Switch `xScaleType` to `"time"` to verify the critical-path line stays aligned with the ' +
    'active segment at the same epoch-ms timestamp (no re-zero needed in time mode). ' +
    'Switch `labelPosition` to try gutter and none modes. ' +
    'Use **Critical path color** to customize the line color via `theme.trace.criticalPathColor`.',
};
