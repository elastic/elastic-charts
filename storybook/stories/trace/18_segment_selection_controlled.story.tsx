/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React, { useEffect, useState } from 'react';

import type { TraceDatum, TraceSelection, TraceSelectionDetail } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// ---------------------------------------------------------------------------
// Fixture — same spans as the uncontrolled story
// ---------------------------------------------------------------------------

const FIXTURE: TraceDatum[] = [
  {
    id: 'root',
    name: 'GET /api/order',
    traceId: 't1',
    start: 0,
    end: 1000,
    activeSegments: [{ start: 0, end: 150, label: 'init' }, { start: 750, end: 1000, label: 'finalize' }],
  },
  {
    id: 'db',
    name: 'DB.query',
    traceId: 't1',
    parentId: 'root',
    start: 200,
    end: 700,
    activeSegments: [
      { start: 200, end: 300, label: 'connect' },
      { start: 350, end: 500, label: 'execute' },
      { start: 600, end: 700, label: 'commit' },
    ],
  },
  {
    id: 'cache',
    name: 'Cache.get',
    traceId: 't1',
    parentId: 'root',
    start: 160,
    end: 190,
    activeSegments: [{ start: 160, end: 190 }],
  },
  {
    id: 'auth',
    name: 'AuthService.validate',
    traceId: 't1',
    parentId: 'root',
    start: 800,
    end: 950,
  },
];

// ---------------------------------------------------------------------------
// Preset selections driven by the knob
// ---------------------------------------------------------------------------

const PRESET_LABELS = {
  'None (clear)': 'none',
  'root — active[0]': 'root-active-0',
  'db — whole-span': 'db-whole-span',
  'Multi: root active[0] + db active[1]': 'multi-root-db',
} as const;

type PresetKey = (typeof PRESET_LABELS)[keyof typeof PRESET_LABELS];

const PRESET_SELECTIONS: Record<PresetKey, TraceSelection> = {
  'none': [],
  'root-active-0': [{ spanId: 'root', region: 'active', segmentIndex: 0 }],
  'db-whole-span': [{ spanId: 'db', region: 'span', segmentIndex: -1 }],
  'multi-root-db': [
    { spanId: 'root', region: 'active', segmentIndex: 0 },
    { spanId: 'db', region: 'active', segmentIndex: 1 },
  ],
};

// ---------------------------------------------------------------------------
// Inline styles
// ---------------------------------------------------------------------------

const S = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
    padding: 16,
    fontFamily: 'system-ui, sans-serif',
    fontSize: 13,
    color: '#1a1a1a',
    maxWidth: 960,
  },
  section: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  h2: { margin: '0 0 4px', fontSize: 15, fontWeight: 600 },
  p: { margin: '0 0 4px', color: '#555' },
  log: {
    border: '1px solid #d1d5db',
    borderRadius: 4,
    padding: '6px 10px',
    background: '#fff',
    minHeight: 36,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
    overflowX: 'auto' as const,
    whiteSpace: 'pre' as const,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600 },
};

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

const formatNextLog = (next: TraceSelection) =>
  next.length === 0
    ? '[] (cleared)'
    : next.map((r) => `{spanId:"${r.spanId}", region:"${r.region}", segIdx:${r.segmentIndex}}`).join('\n');

const formatDetailLog = (details: TraceSelectionDetail[]) =>
  details.length === 0
    ? '(none)'
    : details
        .map(
          (d) =>
            `"${d.name}" region=${d.region} segIdx=${d.segmentIndex}` +
            (d.segmentDuration !== undefined ? ` segDur=${d.segmentDuration.toFixed(0)}ms` : ''),
        )
        .join('\n');

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const showTooltipOverEmpty = boolean('showTooltipOverEmpty', false);
  const presetKey = select('Preset selection', PRESET_LABELS, 'none') as PresetKey;

  const [selection, setSelection] = useState<TraceSelection>(PRESET_SELECTIONS[presetKey]);
  const [changeLog, setChangeLog] = useState<string>('—');

  // Sync knob → controlled selection whenever the preset knob changes
  useEffect(() => {
    setSelection(PRESET_SELECTIONS[presetKey]);
  }, [presetKey]);

  return (
    <div style={S.page}>

      {/* ── Description ─────────────────────────────────────────────── */}
      <div style={S.section}>
        <h2 style={S.h2}>Segment Selection — Controlled (Spec 13)</h2>
        <p style={S.p}>
          The <code>selection</code> prop is the render source of truth. Gestures still execute and
          fire <code>onSelectionChange</code> — the parent decides whether to update the prop
          (perform-and-fire, same model as <code>focusDomain</code>).
        </p>
        <p style={S.p}>
          Use the <strong>Preset selection</strong> knob (Knobs panel) to drive the selection
          externally, simulating a parent component overriding what the user clicked. Chart
          interactions still work and are reflected in the log below.
        </p>
      </div>

      {/* ── Chart ───────────────────────────────────────────────────── */}
      <Chart title={title} description={description} size={{ width: '100%', height: 200 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_controlled"
          data={FIXTURE}
          xScaleType="linear"
          showTooltipOverEmpty={showTooltipOverEmpty}
          selection={selection}
          onSelectionChange={(next, details) => {
            setSelection(next);
            setChangeLog(
              `next: ${formatNextLog(next)}\ndetails: ${formatDetailLog(details)}`,
            );
          }}
        />
      </Chart>

      {/* ── Logs ────────────────────────────────────────────────────── */}
      <div style={S.grid2}>
        <div style={S.section}>
          <span style={S.label}>Current selection (controlled prop)</span>
          <div style={S.log}>{formatNextLog(selection)}</div>
        </div>
        <div style={S.section}>
          <span style={S.label}>onSelectionChange log</span>
          <div style={S.log}>{changeLog}</div>
        </div>
      </div>

    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
