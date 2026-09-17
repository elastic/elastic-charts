/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

/**
 * Visible-only keyboard-focus indicator overlaid on the trace canvas while the canvas has DOM
 * focus. Pure presentational (aria-hidden — the SR surface already conveys state via summary,
 * table, and aria-live). pointerEvents:none so it does not interfere with canvas mouse events.
 * Satisfies WCAG 2.4.7 focus-visible for sighted keyboard users.
 * @internal
 */
export function KeyboardFocusBadge({ visible }: { visible: boolean }): React.ReactElement | null {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 6,
        left: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 6px',
        borderRadius: 4,
        background: 'rgba(0,0,0,0.45)',
        color: '#fff',
        fontSize: 10,
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: '0.03em',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 1,
      }}
    >
      {/* Inline keyboard SVG — no external asset, no CSS class needed */}
      <svg
        width="13"
        height="9"
        viewBox="0 0 13 9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', flexShrink: 0 }}
      >
        <rect x="0.5" y="0.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" />
        <rect x="2" y="2" width="2" height="1.5" rx="0.5" fill="currentColor" />
        <rect x="5.5" y="2" width="2" height="1.5" rx="0.5" fill="currentColor" />
        <rect x="9" y="2" width="2" height="1.5" rx="0.5" fill="currentColor" />
        <rect x="2" y="5" width="9" height="1.5" rx="0.5" fill="currentColor" />
      </svg>
      keyboard active
    </div>
  );
}
