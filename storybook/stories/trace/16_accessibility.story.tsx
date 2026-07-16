/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React, { useEffect, useRef, useState } from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// ---------------------------------------------------------------------------
// Fixture — enough spans to require vertical scrolling (~12 × 24 px = 288 px
// content height vs the 240 px chart height) so ↑/↓/Home/End are meaningful.
// ---------------------------------------------------------------------------

const FIXTURE: TraceDatum[] = [
  { id: 'root',     name: 'GET /checkout',            traceId: 't1', start: 0,   end: 1000 },
  { id: 'tls',      name: 'TLS.handshake',            traceId: 't1', parentId: 'root',    start: 10,  end: 95,
    activeSegments: [{ start: 10, end: 95 }] },
  { id: 'auth',     name: 'AuthService.validate',     traceId: 't1', parentId: 'root',    start: 100, end: 350,
    activeSegments: [{ start: 100, end: 200 }] },
  { id: 'jwt',      name: 'JWT.verify',               traceId: 't1', parentId: 'auth',    start: 110, end: 190,
    activeSegments: [{ start: 110, end: 190 }] },
  { id: 'grpc',     name: 'gRPC.call',                traceId: 't1', parentId: 'root',    start: 300, end: 395,
    activeSegments: [{ start: 300, end: 395 }] },
  { id: 'db',       name: 'DB.query (read)',           traceId: 't1', parentId: 'root',    start: 400, end: 850,
    activeSegments: [{ start: 400, end: 450 }, { start: 750, end: 830 }] },
  { id: 'cache',    name: 'Cache.get',                traceId: 't1', parentId: 'db',      start: 420, end: 600,
    activeSegments: [{ start: 420, end: 600 }] },
  { id: 'redis-g',  name: 'Redis.get',                traceId: 't1', parentId: 'cache',   start: 430, end: 510,
    activeSegments: [{ start: 430, end: 510 }] },
  { id: 's3',       name: 'S3.getObject',             traceId: 't1', parentId: 'db',      start: 500, end: 580,
    activeSegments: [{ start: 500, end: 580 }] },
  { id: 'cache-s',  name: 'Cache.set',                traceId: 't1', parentId: 'db',      start: 620, end: 680,
    activeSegments: [{ start: 620, end: 680 }] },
  { id: 'redis-s',  name: 'Redis.set',                traceId: 't1', parentId: 'cache-s', start: 625, end: 665,
    activeSegments: [{ start: 625, end: 665 }] },
  { id: 'serial',   name: 'Serializer.encode',        traceId: 't1', parentId: 'db',      start: 700, end: 820,
    activeSegments: [{ start: 700, end: 820 }] },
  { id: 'queue',    name: 'Queue.enqueue',            traceId: 't1', parentId: 'root',    start: 860, end: 920,
    activeSegments: [{ start: 860, end: 920 }] },
  { id: 'logger',   name: 'Logger.flush',             traceId: 't1', parentId: 'root',    start: 820, end: 860,
    activeSegments: [{ start: 820, end: 860 }] },
  { id: 'metrics',  name: 'Metrics.record',           traceId: 't1', parentId: 'root',    start: 950, end: 980,
    activeSegments: [{ start: 950, end: 980 }] },
];

// ---------------------------------------------------------------------------
// Keyboard reference table data
// ---------------------------------------------------------------------------

const KEY_GROUPS: { group: string; rows: { keys: string[]; action: string }[] }[] = [
  {
    group: 'Lane navigation',
    rows: [
      { keys: ['↑'], action: 'Move focus to the previous lane; scroll into view' },
      { keys: ['↓'], action: 'Move focus to the next lane; scroll into view' },
      { keys: ['Home'], action: 'Jump to the first lane' },
      { keys: ['End'], action: 'Jump to the last lane' },
    ],
  },
  {
    group: 'Selection',
    rows: [
      { keys: ['Enter', 'Space'], action: 'Fire onElementClick for the focused span' },
    ],
  },
  {
    group: 'Time navigation',
    rows: [
      { keys: ['←'], action: 'Pan 10% of the visible time window to the left (1:1 snap)' },
      { keys: ['→'], action: 'Pan 10% of the visible time window to the right (1:1 snap)' },
      { keys: ['+', '='], action: 'Zoom in one step (eased, like the mouse wheel)' },
      { keys: ['-'], action: 'Zoom out one step' },
    ],
  },
  {
    group: 'Dismiss',
    rows: [
      { keys: ['Esc'], action: 'Clear focused lane; also unpin tooltip if pinned' },
      { keys: ['Tab'], action: 'Move focus out of the chart (no focus trap)' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Inline styles — no external CSS, mirrors other stories
// ---------------------------------------------------------------------------

const S = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    padding: 16,
    fontFamily: 'system-ui, sans-serif',
    fontSize: 13,
    color: '#1a1a1a',
    maxWidth: 900,
  },
  h2: { margin: '0 0 4px', fontSize: 15, fontWeight: 600 },
  p: { margin: '0 0 4px', color: '#555' },
  section: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  liveBox: {
    border: '1px solid #c8d3de',
    borderRadius: 4,
    padding: '8px 12px',
    background: '#f8fafb',
    minHeight: 36,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#555',
  },
  liveValue: { fontWeight: 600, color: '#006bb4' },
  clickLog: {
    border: '1px solid #d1d5db',
    borderRadius: 4,
    padding: '6px 10px',
    background: '#fff',
    minHeight: 32,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
  },
  table: { borderCollapse: 'collapse' as const, width: '100%', fontSize: 12 },
  th: {
    textAlign: 'left' as const,
    padding: '5px 10px',
    background: '#f3f4f6',
    fontWeight: 600,
    borderBottom: '1px solid #e5e7eb',
  },
  td: { padding: '4px 10px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'top' as const },
  groupCell: { padding: '6px 10px 2px', color: '#6b7280', fontWeight: 600, fontSize: 11, letterSpacing: '0.05em' },
  kbd: {
    display: 'inline-block',
    padding: '1px 5px',
    border: '1px solid #ccc',
    borderRadius: 3,
    background: '#f9fafb',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 1.5,
    whiteSpace: 'nowrap' as const,
  },
  footer: { margin: 0, fontSize: 11, color: '#888' },
};

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const showKeyboardFocusBadge = boolean('Show keyboard focus badge', true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [liveText, setLiveText] = useState<string>('—');
  const [clickLog, setClickLog] = useState<string>('—');

  // Monitor the hidden aria-live div inside the chart container and mirror its
  // textContent to a visible box — lets sighted developers verify announcements
  // without a screen reader.
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const observe = () => {
      const liveEl = container.querySelector('[aria-live]');
      if (!liveEl) return null;
      const mo = new MutationObserver(() => {
        const text = liveEl.textContent ?? '';
        if (text) setLiveText(text);
      });
      mo.observe(liveEl, { childList: true, characterData: true, subtree: true });
      return mo;
    };

    // The aria-live div is injected when the chart mounts (after a rAF).
    // Retry once if it isn't there immediately.
    let mo = observe();
    let timeout: ReturnType<typeof setTimeout>;
    if (!mo) {
      timeout = setTimeout(() => { mo = observe(); }, 200);
    }

    return () => {
      mo?.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div style={S.page}>

      {/* ── Description ─────────────────────────────────────────────── */}
      <div style={S.section}>
        <h2 style={S.h2}>Accessibility — keyboard navigation &amp; screen-reader surface</h2>
        <p style={S.p}>
          Tab into the chart, then use the keyboard to navigate lanes. A full-width background
          highlight marks the focused lane. An <code>aria-live</code> region announces the span
          name and duration on each move; the hidden paginated table exposes all spans to AT.
        </p>
        <p style={{ ...S.p, color: '#888' }}>
          Try: <strong>Tab</strong> → focus chart &rarr; <strong>↓</strong> to move through lanes
          &rarr; <strong>Enter</strong> to fire a click &rarr; <strong>Esc</strong> to clear focus.
        </p>
      </div>

      {/* ── Chart ───────────────────────────────────────────────────── */}
      <div ref={chartContainerRef}>
        <Chart title={title} description={description} size={{ width: '100%', height: 240 }}>
          <Settings
            baseTheme={theme}
            onElementClick={(elements) => {
              const el = elements[0];
              if (el && 'name' in el) {
                setClickLog(`onElementClick → "${el.name}" (id: ${el.id})`);
              }
            }}
          />
          <Trace
            id="trace_a11y"
            data={FIXTURE}
            xScaleType="linear"
            showKeyboardFocusBadge={showKeyboardFocusBadge}
          />
        </Chart>
      </div>

      {/* ── Live feedback panels ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={S.section}>
          <strong style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            aria-live output
          </strong>
          <div style={S.liveBox} aria-label="aria-live mirror" title="Mirrors the hidden aria-live announcement">
            <span style={{ color: '#6b7280' }}>Announced:</span>
            <span style={S.liveValue}>{liveText}</span>
          </div>
        </div>
        <div style={S.section}>
          <strong style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            onElementClick log
          </strong>
          <div style={S.clickLog}>{clickLog}</div>
        </div>
      </div>

      {/* ── Keyboard reference ──────────────────────────────────────── */}
      <div style={S.section}>
        <strong style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Keyboard reference
        </strong>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 160 }}>Key(s)</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {KEY_GROUPS.map(({ group, rows }) => (
              <React.Fragment key={group}>
                <tr>
                  <td colSpan={2} style={S.groupCell}>{group.toUpperCase()}</td>
                </tr>
                {rows.map(({ keys, action }) => (
                  <tr key={keys.join()}>
                    <td style={S.td}>
                      {keys.map((k, i) => (
                        <React.Fragment key={k}>
                          <kbd style={S.kbd}>{k}</kbd>
                          {i < keys.length - 1 && <span style={{ margin: '0 4px', color: '#9ca3af' }}>/</span>}
                        </React.Fragment>
                      ))}
                    </td>
                    <td style={S.td}>{action}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p style={S.footer}>
        {FIXTURE.length} spans &middot; chart height 240 px → vertical scroll active &middot;
        Tab to focus, arrow keys to navigate, Esc to clear
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
