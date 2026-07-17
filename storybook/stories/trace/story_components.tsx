/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Story-utility components for Trace viz stories.
 *
 * These components are **not** part of the @elastic/charts public API — they are
 * scaffolding that make complex stories inspectable (reference tables, live feedback
 * panels, aria-live mirroring). Rendering them inside a story as `<KeyboardReference/>`
 * or `<LogPanel …/>` makes it immediately clear they are utilities, not feature code.
 */

import React, { useEffect, useRef, useState } from 'react';

import type { TraceSelection, TraceSelectionDetail } from '@elastic/charts';

// ---------------------------------------------------------------------------
// Shared minimal styles
// ---------------------------------------------------------------------------

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 600,
};

const logStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 4,
  padding: '6px 10px',
  background: '#fff',
  minHeight: 32,
  fontSize: 11,
  fontFamily: 'monospace',
  color: '#374151',
  overflowX: 'auto',
  whiteSpace: 'pre',
};

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  border: '1px solid #ccc',
  borderRadius: 3,
  background: '#f9fafb',
  fontFamily: 'monospace',
  fontSize: 11,
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
};

const tableStyle: React.CSSProperties = { borderCollapse: 'collapse', width: '100%', fontSize: 12 };
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '5px 10px',
  background: '#f3f4f6',
  fontWeight: 600,
  borderBottom: '1px solid #e5e7eb',
};
const tdStyle: React.CSSProperties = { padding: '4px 10px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'top' };
const groupCellStyle: React.CSSProperties = { padding: '6px 10px 2px', color: '#6b7280', fontWeight: 600, fontSize: 11, letterSpacing: '0.05em' };

// ---------------------------------------------------------------------------
// LogPanel — labeled monospace output box
// ---------------------------------------------------------------------------

/**
 * A labeled monospace read-only text box. Used to display callback output
 * (`onSelectionChange`, `onElementClick`, aria-live text) in a story.
 */
export function LogPanel({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={labelStyle}>{label}</span>
      <div style={logStyle}>{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AriaLiveMirror — mirrors hidden aria-live announcements into a visible box
// ---------------------------------------------------------------------------

/**
 * Mounts a `MutationObserver` on the hidden `[aria-live]` element inside the
 * provided chart container and displays each announcement in a `LogPanel`.
 * Lets sighted developers verify a11y announcements without a screen reader.
 *
 * The observer retries once (after 200 ms) because the aria-live div is
 * injected by the chart after a `requestAnimationFrame`.
 */
export function AriaLiveMirror({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  const [text, setText] = useState<string>('—');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observe = () => {
      const liveEl = container.querySelector('[aria-live]');
      if (!liveEl) return null;
      const mo = new MutationObserver(() => {
        const t = liveEl.textContent ?? '';
        if (t) setText(t);
      });
      mo.observe(liveEl, { childList: true, characterData: true, subtree: true });
      return mo;
    };

    let mo = observe();
    let timeout: ReturnType<typeof setTimeout>;
    if (!mo) timeout = setTimeout(() => { mo = observe(); }, 200);

    return () => { mo?.disconnect(); clearTimeout(timeout); };
  }, [containerRef]);

  return <LogPanel label="aria-live output (sighted mirror)" value={text} />;
}

// ---------------------------------------------------------------------------
// KeyboardReference — keyboard navigation table for story 16
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
      { keys: ['←'], action: 'Pan 10% of the visible time window to the left' },
      { keys: ['→'], action: 'Pan 10% of the visible time window to the right' },
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

/**
 * Keyboard-shortcut reference table for the accessibility story.
 * Extracted here so the story body focuses on the chart + live-feedback panels.
 */
export function KeyboardReference() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: 160 }}>Key(s)</th>
          <th style={thStyle}>Action</th>
        </tr>
      </thead>
      <tbody>
        {KEY_GROUPS.map(({ group, rows }) => (
          <React.Fragment key={group}>
            <tr><td colSpan={2} style={groupCellStyle}>{group.toUpperCase()}</td></tr>
            {rows.map(({ keys, action }) => (
              <tr key={keys.join()}>
                <td style={tdStyle}>
                  {keys.map((k, i) => (
                    <React.Fragment key={k}>
                      <kbd style={kbdStyle}>{k}</kbd>
                      {i < keys.length - 1 && <span style={{ margin: '0 4px', color: '#9ca3af' }}>/</span>}
                    </React.Fragment>
                  ))}
                </td>
                <td style={tdStyle}>{action}</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// GestureReference — mouse/keyboard gesture table for segment selection (story 17)
// ---------------------------------------------------------------------------

const GESTURES: [string, string][] = [
  ['Left-click active/waiting segment',       'Replace selection with [ref]'],
  ['Shift + left-click segment',               'Add ref to set (additive; no-op if already selected)'],
  ['Cmd/Ctrl + left-click segment',            'Toggle ref (add if absent; remove if present)'],
  ['Left-click empty / gutter / outside lanes','Clear selection'],
  ['Shift/Cmd/Ctrl + empty-click',             'No-op (preserves selection)'],
  ['Double-click span (any region)',            'Replace with whole-span ref {region:"span", segmentIndex:-1}'],
  ['Shift + double-click',                      'Additive-add whole-span ref'],
  ['Cmd/Ctrl + double-click',                   'Toggle whole-span ref'],
  ['Enter / Space (keyboard focus)',            'Replace selection with whole-span ref'],
  ['Shift+Enter',                               'Add whole-span ref (additive)'],
  ['Cmd/Ctrl+Enter',                            'Toggle whole-span ref; announced via aria-live'],
  ['Escape',                                    'Clear selection + announce "Selection cleared"'],
];

/**
 * Mouse/keyboard gesture reference table for the segment-selection story.
 * Extracted here so the story body focuses on the chart + log panels.
 */
export function GestureReference() {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Gesture</th>
          <th style={thStyle}>Result</th>
        </tr>
      </thead>
      <tbody>
        {GESTURES.map(([gesture, result]) => (
          <tr key={gesture}>
            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{gesture}</td>
            <td style={{ ...tdStyle, color: '#555' }}>{result}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Selection formatters (shared by stories 17 and 18)
// ---------------------------------------------------------------------------

/** Formats a `TraceSelection` ref array into a readable string. */
export function formatSelection(next: TraceSelection): string {
  return next.length === 0
    ? '[] (cleared)'
    : next.map((r) => `{spanId:"${r.spanId}", region:"${r.region}", segIdx:${r.segmentIndex}}`).join('\n');
}

/** Formats a `TraceSelectionDetail[]` array into a readable string. */
export function formatSelectionDetail(details: TraceSelectionDetail[]): string {
  return details.length === 0
    ? '(none)'
    : details
        .map(
          (d) =>
            `"${d.name}" region=${d.region} segIdx=${d.segmentIndex}` +
            (d.segmentDuration !== undefined ? ` segDur=${d.segmentDuration.toFixed(0)}ms` : ''),
        )
        .join('\n');
}

