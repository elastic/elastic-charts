/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';

import type {
  TraceCriticalPath,
  TraceDataDiagnostics,
  TraceDatum,
  TraceSpanBadge,
  TraceSpanBadgeAccessor,
} from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import { DURATION_BADGE_ICON } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Deliberately malformed multi-trace fixture (Spec 28) exercising several diagnostic kinds:
 * - `t1` renders and shows recoverable issues: an orphan reparented under the elected root
 *   (`info`), a clock-skew-corrected child (`info`), a negative-duration span (`warning`), and a
 *   non-finite span that is dropped (`warning`).
 * - `t2` is invalidated by a duplicate span id within the group (`error`) and contributes no lanes.
 * - the critical path references an unknown span id (`warning`).
 */
const DATA: TraceDatum[] = [
  // --- t1: renders, with recoverable malformations -------------------------------------------
  { id: 't1-root', name: 'GET /api/checkout', traceId: 't1', start: 0, end: 1000 },
  { id: 't1-db', name: 'SELECT * FROM orders', parentId: 't1-root', traceId: 't1', start: 100, end: 400 },
  // Child starts before its parent → clock-skew correction shifts it (info).
  { id: 't1-skew', name: 'downstream call', parentId: 't1-db', traceId: 't1', start: 50, end: 380 },
  // parentId is absent from the data → orphan reparented under the elected root (info).
  { id: 't1-orphan', name: 'detached worker', parentId: 't1-ghost', traceId: 't1', start: 200, end: 600 },
  // end < start → negative-duration span (warning).
  { id: 't1-neg', name: 'bad timing span', parentId: 't1-root', traceId: 't1', start: 800, end: 700 },
  // Non-finite end → span dropped (warning).
  { id: 't1-nan', name: 'failed timestamp conversion', parentId: 't1-root', traceId: 't1', start: 300, end: NaN },

  // --- t2: duplicate span id within the group → whole group invalidated (error) ---------------
  { id: 't2-root', name: 'worker root', traceId: 't2', start: 0, end: 500 },
  { id: 't2-task', name: 'task A', parentId: 't2-root', traceId: 't2', start: 50, end: 200 },
  { id: 't2-task', name: 'task B (duplicate id)', parentId: 't2-root', traceId: 't2', start: 210, end: 480 },
];

/** Critical path with one valid interval and one referencing a span id not present in the data. */
const CRITICAL_PATH: TraceCriticalPath = [
  { spanId: 't1-db', start: 100, end: 400 },
  { spanId: 'ghost-span', start: 0, end: 50 },
];

/** Stable badge accessor demonstrating a duplicate id, an empty badge, and an image-only badge. */
const badgeAccessor: TraceSpanBadgeAccessor = (datum) => {
  const byId: Record<string, TraceSpanBadge[]> = {
    't1-root': [
      { id: 'status', text: '200', color: 'success' },
      // Neither text nor image → badge_empty (warning).
      { id: 'blank' },
    ],
    't1-db': [
      { id: 'engine', text: 'postgresql', color: 'primary' },
      // Duplicate badge id within the span → badge_duplicate_id (warning).
      { id: 'engine', text: 'duplicate' },
    ],
    // Image-only badge without ariaLabel → badge_missing_aria_label (warning).
    't1-skew': [{ id: 'clock', image: { src: DURATION_BADGE_ICON } }],
  };
  return byId[datum.id] ?? [];
};

const SEVERITY_COLOR: Record<TraceDataDiagnostics['issues'][number]['severity'], string> = {
  info: '#0077cc',
  warning: '#bd8c00',
  error: '#bd271e',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const [diagnostics, setDiagnostics] = useState<TraceDataDiagnostics | null>(null);

  const handleDiagnosticsChange = (report: TraceDataDiagnostics) => {
    action('onDataDiagnosticsChange')(report);
    setDiagnostics(report);
  };

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 520px', minWidth: 320 }}>
        <Chart title={title} description={description} size={{ width: '100%', height: 320 }}>
          <Settings baseTheme={useBaseTheme()} theme={{ trace: { laneHeight: 40 } }} />
          <Trace
            id="trace_data_diagnostics"
            data={DATA}
            xScaleType="linear"
            criticalPath={CRITICAL_PATH}
            badgeAccessor={badgeAccessor}
            onDataDiagnosticsChange={handleDiagnosticsChange}
          />
        </Chart>
      </div>
      <div style={{ flex: '1 1 360px', minWidth: 300, fontFamily: 'sans-serif', fontSize: 13 }}>
        <h3 style={{ margin: '0 0 8px' }}>Trace data diagnostics</h3>
        {diagnostics === null || diagnostics.issues.length === 0 ? (
          <p style={{ color: '#69707d' }}>No issues reported.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {diagnostics.issues.map((issue) => (
              <li
                key={`${issue.kind}|${issue.scope}|${issue.severity}`}
                style={{ borderLeft: `3px solid ${SEVERITY_COLOR[issue.severity]}`, padding: '4px 8px', marginBottom: 6 }}
              >
                <div style={{ fontWeight: 600 }}>
                  {issue.kind} <span style={{ color: SEVERITY_COLOR[issue.severity] }}>({issue.severity})</span>
                </div>
                <div style={{ color: '#69707d' }}>
                  scope: {issue.scope} · count: {issue.count}
                  {issue.examples.length > 0 ? ` · e.g. ${issue.examples.join(', ')}` : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

Example.parameters = {
  markdown:
    'Trace data diagnostics (Spec 28): Charts computes a structured `TraceDataDiagnostics` report ' +
    'from the same prepared data it renders and hands it to `onDataDiagnosticsChange`. The report ' +
    'is the application-facing channel that supersedes developer-console warnings for malformed, ' +
    'corrected, omitted, or invalid trace input.\n\n' +
    'This deliberately malformed fixture triggers several kinds — an orphan reparented under the ' +
    'elected root (`info`), a clock-skew correction (`info`), a negative-duration span (`warning`), ' +
    'a dropped non-finite span (`warning`), a trace group invalidated by a duplicate span id ' +
    '(`error`), an unresolved critical-path reference (`warning`), and a few invalid badges. The ' +
    'panel on the right lists the latest report; each emission is also logged to the **Actions** panel.',
};
