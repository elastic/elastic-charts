/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { ChartsStory } from '../../types';

// ---------------------------------------------------------------------------
// Feature inventory table
// ---------------------------------------------------------------------------

interface FeatureRow {
  category: string;
  feature: string;
  api: string;
  stories: string[];
}

const FEATURES: FeatureRow[] = [
  // Data
  { category: 'Data', feature: 'Span waterfall (bars + segments)', api: 'data: TraceDatum[]', stories: ['Renderer', 'Interactive'] },
  { category: 'Data', feature: 'Self-time computation', api: 'activeSegments (implicit when omitted)', stories: ['Self Time Debug'] },
  { category: 'Data', feature: 'OTLP / OpenTelemetry import', api: 'fromOtlp()', stories: ['Kibana Trace', 'Chrome Network', 'Lane Order'] },
  { category: 'Data', feature: 'Multi-trace combined view', api: 'traceId filter', stories: ['Multi Trace'] },
  // Layout
  { category: 'Layout', feature: 'Wall-clock time axis', api: "xScaleType: 'time'", stories: ['Time Bar', 'Kibana Trace'] },
  { category: 'Layout', feature: 'Elapsed-time axis', api: "xScaleType: 'linear'", stories: ['Time Bar', 'Overview Sync'] },
  { category: 'Layout', feature: 'Lane ordering', api: "laneOrder: 'tree' | 'chronological'", stories: ['Lane Order'] },
  { category: 'Layout', feature: 'Responsive labels', api: "theme.trace.labelPosition: 'gutter' | 'inline' | 'none'", stories: ['Responsive Labels'] },
  // Colors
  { category: 'Colors', feature: 'Color by attribute', api: 'colorBy, colorByOtelAttribute(), colorByOtelKind()', stories: ['Color By', 'Lane Order'] },
  { category: 'Colors', feature: 'Segment phase palette', api: 'activeSegments[].label', stories: ['Segment Phases'] },
  // Interaction
  { category: 'Interaction', feature: 'Pan + wheel zoom', api: 'drag / wheel (built-in)', stories: ['Interactive'] },
  { category: 'Interaction', feature: 'Brush-to-zoom', api: "dragMode: 'brush'", stories: ['Brush Zoom'] },
  { category: 'Interaction', feature: 'Hover tooltip', api: 'showTooltipOverEmpty, customTooltip', stories: ['Tooltip Events', 'Kibana Workflow'] },
  { category: 'Interaction', feature: 'Pinnable tooltip', api: 'right-click / context-menu', stories: ['Pinned Tooltip', 'Kibana Workflow'] },
  { category: 'Interaction', feature: 'Keyboard navigation', api: 'showKeyboardFocusBadge (↑↓←→ +− Enter Esc)', stories: ['Accessibility'] },
  // Selection
  { category: 'Selection', feature: 'Click / multi-select', api: 'onElementClick, onElementOver', stories: ['Segment Selection'] },
  { category: 'Selection', feature: 'Controlled selection', api: 'selection, onSelectionChange', stories: ['Segment Selection Controlled'] },
  // Navigation
  { category: 'Navigation', feature: 'Scroll-to-span (imperative)', api: 'controlProviderCallback, TraceSearchProvider + useTraceSearch()', stories: ['Scroll To Lane'] },
  // Composition
  { category: 'Composition', feature: 'Overview + detail sync', api: 'focusDomain, onFocusDomainChange', stories: ['Overview Sync'] },
  // Empty states
  { category: 'Empty states', feature: 'No-data state (DOM overlay)', api: 'data={[]} + Settings.noResults', stories: ['Empty Trace'] },
  { category: 'Empty states', feature: 'Trace-not-found state (canvas message)', api: 'traceId, traceNotFoundMessage', stories: ['Empty Trace'] },
  // Accessibility
  { category: 'Accessibility', feature: 'Screen-reader table + live region', api: 'aria-live, ScreenReaderTraceTable (built-in)', stories: ['Accessibility'] },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const containerStyle: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 13,
  padding: '16px 20px',
  maxWidth: 900,
  color: '#1f2937',
};

const descStyle: React.CSSProperties = {
  marginBottom: 20,
  lineHeight: 1.6,
  color: '#374151',
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  fontSize: 12,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 10px',
  background: '#f3f4f6',
  fontWeight: 600,
  borderBottom: '2px solid #e5e7eb',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '5px 10px',
  borderBottom: '1px solid #f0f0f0',
  verticalAlign: 'top',
};

const categoryStyle: React.CSSProperties = {
  padding: '8px 10px 3px',
  color: '#6b7280',
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  borderBottom: '1px solid #e5e7eb',
  background: '#fafafa',
};

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  background: '#f3f4f6',
  borderRadius: 3,
  padding: '1px 4px',
  color: '#374151',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    const group = acc.get(k) ?? [];
    group.push(item);
    acc.set(k, group);
    return acc;
  }, new Map<string, T[]>());
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const Example: ChartsStory = () => {
  const grouped = groupBy(FEATURES, (f) => f.category);

  return (
    <div style={containerStyle}>
      <p style={descStyle}>
        <strong>Trace (@alpha)</strong> is elastic-charts&apos; distributed-trace waterfall chart type. It renders a
        scrollable lane-per-span waterfall to a <code style={codeStyle}>&lt;canvas&gt;</code> element via a
        self-managed RAF loop — the same architecture as the Flame and Timeslip chart families.
      </p>
      <p style={descStyle}>
        Add a single <code style={codeStyle}>&lt;Trace id=&quot;…&quot; data={'{spans}'} /&gt;</code> inside a{' '}
        <code style={codeStyle}>&lt;Chart&gt;</code> to get a fully interactive waterfall with pan, zoom, keyboard
        navigation, selection, and screen-reader support out of the box. Supply an OTLP envelope directly via{' '}
        <code style={codeStyle}>fromOtlp()</code>, or bring your own <code style={codeStyle}>TraceDatum[]</code> array.
      </p>
      <p style={{ ...descStyle, marginBottom: 12 }}>
        The table below maps each implemented feature to the stories that demonstrate it. Use the sidebar to navigate to
        any story.
      </p>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 120 }}>Category</th>
            <th style={thStyle}>Feature</th>
            <th style={thStyle}>API / Theme surface</th>
            <th style={{ ...thStyle, width: 220 }}>Stories</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(grouped.entries()).map(([category, rows]) => (
            <React.Fragment key={category}>
              <tr>
                <td colSpan={4} style={categoryStyle}>
                  {category}
                </td>
              </tr>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td style={tdStyle} />
                  <td style={tdStyle}>{row.feature}</td>
                  <td style={tdStyle}>
                    <code style={codeStyle}>{row.api}</code>
                  </td>
                  <td style={tdStyle}>{row.stories.join(', ')}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Example.storyName = 'Intro';
