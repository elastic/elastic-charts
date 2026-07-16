/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import type { TraceDatum, TraceSelection, TraceSelectionDetail } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// ---------------------------------------------------------------------------
// Fixture — spans with explicit activeSegments so waiting gaps are visible
// ---------------------------------------------------------------------------

const FIXTURE: TraceDatum[] = [
  // Root: two active segments → one waiting gap between them
  {
    id: 'root',
    name: 'GET /api/order',
    traceId: 't1',
    start: 0,
    end: 1000,
    activeSegments: [{ start: 0, end: 150, label: 'init' }, { start: 750, end: 1000, label: 'finalize' }],
  },
  // DB: three tight active segments
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
  // Cache: single active segment
  {
    id: 'cache',
    name: 'Cache.get',
    traceId: 't1',
    parentId: 'root',
    start: 160,
    end: 190,
    activeSegments: [{ start: 160, end: 190 }],
  },
  // Auth: self-time derived (no activeSegments) — single continuous active
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
  pill: (active: boolean) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    border: '1px solid',
    borderColor: active ? '#0077cc' : '#c8d3de',
    background: active ? '#e6f3ff' : '#f8fafb',
    color: active ? '#0077cc' : '#555',
    fontSize: 11,
    cursor: 'pointer',
    userSelect: 'none' as const,
  }),
  kbd: {
    display: 'inline-block',
    padding: '1px 5px',
    border: '1px solid #ccc',
    borderRadius: 3,
    background: '#f9fafb',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600 },
  buttonRow: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  button: {
    padding: '4px 12px',
    border: '1px solid #c8d3de',
    borderRadius: 4,
    background: '#f8fafb',
    cursor: 'pointer',
    fontSize: 12,
  },
};

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const showTooltipOverEmpty = boolean('showTooltipOverEmpty', false);

  // Uncontrolled demo state
  const [uncontrolledLog, setUncontrolledLog] = useState<string>('—');
  const [uncontrolledDetailLog, setUncontrolledDetailLog] = useState<string>('—');

  // Controlled demo state
  const [controlledSelection, setControlledSelection] = useState<TraceSelection>([]);
  const [controlledLog, setControlledLog] = useState<string>('—');

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

  return (
    <div style={S.page}>

      {/* ── Description ────────────────────────────────────────────────── */}
      <div style={S.section}>
        <h2 style={S.h2}>Segment Selection (Spec 13)</h2>
        <p style={S.p}>
          Left-click an active or waiting segment to select and highlight it with a stroke outline.
          Double-click a span to select the whole span. Modifier-click to accumulate a multi-selection.
          Click empty canvas space to clear.
        </p>
        <p style={S.p}>
          <kbd style={S.kbd}>Shift</kbd> + click = <strong>additive</strong> (add only; never removes).{' '}
          <kbd style={S.kbd}>Cmd</kbd> (Mac) / <kbd style={S.kbd}>Ctrl</kbd> (other) + click = <strong>toggle</strong> (add if absent, remove if present).{' '}
          Note: on macOS <kbd style={S.kbd}>Ctrl</kbd>+click fires the context-menu (tooltip pin) — use <kbd style={S.kbd}>Cmd</kbd> for toggle.
        </p>
        <p style={S.p}>
          Keyboard (focused lane): <kbd style={S.kbd}>Enter</kbd> / <kbd style={S.kbd}>Space</kbd> = replace with whole-span ref.{' '}
          <kbd style={S.kbd}>Shift</kbd>+Enter = additive-add.{' '}
          <kbd style={S.kbd}>Cmd</kbd>/<kbd style={S.kbd}>Ctrl</kbd>+Enter = toggle.{' '}
          No keyboard path for single-segment (sub-span) selection — that requires mouse.{' '}
          Each keyboard selection is announced via the <code>aria-live</code> region (heard by screen-readers).{' '}
          <kbd style={S.kbd}>Esc</kbd> clears selection, focus, and unpin (announces &quot;Selection cleared&quot;).
        </p>
        <p style={{ ...S.p, fontSize: 11, color: '#888' }}>
          Hover a segment to see its tooltip (active/waiting rows). Right-click to pin the tooltip
          independently of selection (Spec 10).
        </p>
      </div>

      {/* ── Demo 1 — Uncontrolled ────────────────────────────────────── */}
      <div style={S.section}>
        <span style={S.label}>Demo 1 — Uncontrolled</span>
        <p style={S.p}>
          The chart manages selection internally. <code>onSelectionChange</code> fires once per
          completed gesture with the thin <code>next</code> refs and rich <code>details</code>.
        </p>
        <Chart title={title} description={description} size={{ width: '100%', height: 200 }}>
          <Settings baseTheme={theme} />
          <Trace
            id="trace_uncontrolled"
            data={FIXTURE}
            xScaleType="linear"
            showTooltipOverEmpty={showTooltipOverEmpty}
            onSelectionChange={(next, details) => {
              setUncontrolledLog(formatNextLog(next));
              setUncontrolledDetailLog(formatDetailLog(details));
            }}
          />
        </Chart>
        <div style={S.grid2}>
          <div style={S.section}>
            <span style={S.label}>onSelectionChange — next (thin refs)</span>
            <div style={S.log}>{uncontrolledLog}</div>
          </div>
          <div style={S.section}>
            <span style={S.label}>onSelectionChange — details (rich)</span>
            <div style={S.log}>{uncontrolledDetailLog}</div>
          </div>
        </div>
      </div>

      {/* ── Demo 2 — Controlled ─────────────────────────────────────── */}
      <div style={S.section}>
        <span style={S.label}>Demo 2 — Controlled</span>
        <p style={S.p}>
          The <code>selection</code> prop is the render source of truth. Gestures still execute and
          fire <code>onSelectionChange</code> — the parent decides whether to update the prop
          (perform-and-fire, same model as <code>focusDomain</code>). The external buttons below
          drive the selection independently.
        </p>
        <Chart title={title} description={description} size={{ width: '100%', height: 200 }}>
          <Settings baseTheme={theme} />
          <Trace
            id="trace_controlled"
            data={FIXTURE}
            xScaleType="linear"
            showTooltipOverEmpty={showTooltipOverEmpty}
            selection={controlledSelection}
            onSelectionChange={(next, details) => {
              setControlledSelection(next);
              setControlledLog(
                `next: ${formatNextLog(next)}\ndetails: ${formatDetailLog(details)}`,
              );
            }}
          />
        </Chart>
        <div style={S.section}>
          <span style={S.label}>External selection buttons</span>
          <div style={S.buttonRow}>
            <button
              style={S.button}
              onClick={() => setControlledSelection([{ spanId: 'root', region: 'active', segmentIndex: 0 }])}
            >
              Select root active[0]
            </button>
            <button
              style={S.button}
              onClick={() => setControlledSelection([{ spanId: 'db', region: 'span', segmentIndex: -1 }])}
            >
              Select db whole-span
            </button>
            <button
              style={S.button}
              onClick={() => setControlledSelection([
                { spanId: 'root', region: 'active', segmentIndex: 0 },
                { spanId: 'db', region: 'active', segmentIndex: 1 },
              ])}
            >
              Multi-select root+db
            </button>
            <button style={S.button} onClick={() => setControlledSelection([])}>
              Clear
            </button>
          </div>
          <div style={S.section}>
            <span style={S.label}>Current selection (controlled prop)</span>
            <div style={S.log}>{formatNextLog(controlledSelection)}</div>
          </div>
          <div style={S.section}>
            <span style={S.label}>onSelectionChange log</span>
            <div style={S.log}>{controlledLog}</div>
          </div>
        </div>
      </div>

      {/* ── Gesture reference ────────────────────────────────────────── */}
      <div style={S.section}>
        <span style={S.label}>Gesture reference</span>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '5px 10px', background: '#f3f4f6', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Gesture</th>
              <th style={{ textAlign: 'left', padding: '5px 10px', background: '#f3f4f6', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Left-click active/waiting segment', 'Replace selection with [ref]'],
              ['Shift + left-click segment', 'Add ref to set (additive: no-op if already selected)'],
              ['Cmd/Ctrl + left-click segment', 'Toggle ref in set (add if absent; remove if present)'],
              ['Left-click empty / gutter / outside lanes', 'Clear selection'],
              ['Shift/Cmd/Ctrl + empty-click', 'No-op (preserves selection, native file-manager behaviour)'],
              ['Double-click span (any region)', 'Replace with whole-span ref {region:"span", segmentIndex:-1}'],
              ['Shift + double-click', 'Additive-add whole-span ref'],
              ['Cmd/Ctrl + double-click', 'Toggle whole-span ref into/out of set'],
              ['Enter / Space (keyboard focus)', 'Replace selection with whole-span ref (spec-13 line 102)'],
              ['Shift+Enter (keyboard focus)', 'Add whole-span ref (additive)'],
              ['Cmd/Ctrl+Enter (keyboard focus)', 'Toggle whole-span ref; announced via aria-live'],
              ['Escape', 'Clear selection + announce "Selection cleared" (also clears focus + unpin)'],
            ].map(([gesture, result]) => (
              <tr key={gesture}>
                <td style={{ padding: '4px 10px', borderBottom: '1px solid #f0f0f0', fontFamily: 'monospace', fontSize: 11 }}>{gesture}</td>
                <td style={{ padding: '4px 10px', borderBottom: '1px solid #f0f0f0', color: '#555' }}>{result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
          Single-click fires <code>onSelectionChange</code> once, after a ~250 ms debounce window
          (so a double-click can cancel it). <code>onElementClick</code> (Spec 7) still fires
          immediately on every raw click — the two channels are orthogonal.
        </p>
      </div>

    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
