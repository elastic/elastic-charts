/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { normalize } from '@elastic/charts/src/chart_types/trace_chart/data/normalize';
import { resolveActive } from '@elastic/charts/src/chart_types/trace_chart/data/self_time';
import type { NormalizedSpan } from '@elastic/charts/src/chart_types/trace_chart/data/types';
import type { TraceDatum } from '@elastic/charts/src/chart_types/trace_chart/trace_api';

// A nested fixture with enough structure to show all self-time cases:
// - root: has two children, one explicit gap and one overlap
// - middleware: has one child, producing a leading segment
// - leaf: no children, full self time
const simpleSpans: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /checkout', traceId: 't1', start: 0, end: 1000 },
  { id: 'auth', name: 'AuthService.validate', parentId: 'root', traceId: 't1', start: 100, end: 350 },
  { id: 'db', name: 'DB.query', parentId: 'root', traceId: 't1', start: 400, end: 850 },
  { id: 'cache', name: 'Cache.get', parentId: 'db', traceId: 't1', start: 420, end: 600 },
  { id: 'leaf', name: 'Serializer.encode', parentId: 'db', traceId: 't1', start: 700, end: 820 },
];

const { spans: normalized } = normalize(simpleSpans, 'simple', 'linear');
const resolved = resolveActive(normalized);

// Styles (inline so the story is self-contained)
const containerStyle: React.CSSProperties = { padding: 24, fontFamily: 'sans-serif' };
const headerStyle: React.CSSProperties = { marginBottom: 16 };
const spanRowStyle: React.CSSProperties = { marginBottom: 20 };
const labelStyle: React.CSSProperties = { fontFamily: 'monospace', fontSize: 13, marginBottom: 6 };
const barTrackStyle: React.CSSProperties = {
  position: 'relative',
  height: 16,
  background: '#f0f0f0',
  border: '1px solid #ccc',
  width: 600,
  borderRadius: 2,
};

const TOTAL_MS = 1000;

function pct(ms: number) {
  return `${((ms / TOTAL_MS) * 100).toFixed(2)}%`;
}

function SpanRow({ span }: { span: NormalizedSpan }) {
  const totalWidth = ((span.end - span.start) / TOTAL_MS) * 100;
  const totalLeft = (span.start / TOTAL_MS) * 100;

  return (
    <div style={spanRowStyle}>
      <div style={labelStyle}>
        <strong>{span.name}</strong> — [{span.start}ms – {span.end}ms] — self-time segments:{' '}
        {span.active.length === 0
          ? '(none)'
          : span.active.map((a, i) => `[${a.start}–${a.end}ms]`).join(', ')}
      </div>
      <div style={barTrackStyle}>
        {/* Total duration bar (muted) */}
        <div
          style={{
            position: 'absolute',
            left: pct(span.start),
            width: `${totalWidth}%`,
            height: '100%',
            background: '#b0c4de',
            opacity: 0.5,
          }}
          title={`Total: ${span.start}–${span.end}ms`}
        />
        {/* Active (self-time) segments */}
        {span.active.map((seg, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pct(seg.start),
              width: pct(seg.end - seg.start),
              height: '100%',
              background: '#1f6feb',
            }}
            title={`Active: ${seg.start}–${seg.end}ms`}
          />
        ))}
      </div>
    </div>
  );
}

export const Example = () => (
  <div className="echChart">
    <div className="echChartStatus" data-ech-render-complete={true} />
    <div style={containerStyle}>
      <h2 style={headerStyle}>Spec 2 — self-time derivation debug</h2>
      <p style={{ marginBottom: 20, color: '#555', fontSize: 13 }}>
        Light blue = total duration. Dark blue = derived self-time (active) segments. Gaps show where
        children run. Explicit <code>active</code> fields (if present) are copied verbatim.
      </p>
      {resolved.map((span) => (
        <SpanRow key={span.id} span={span} />
      ))}
    </div>
  </div>
);

Example.parameters = {
  showHeader: true,
};
