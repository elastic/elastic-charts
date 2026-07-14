/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { normalize } from '@elastic/charts/src/chart_types/trace_chart/data/normalize';
import type { NormalizedSpan } from '@elastic/charts/src/chart_types/trace_chart/data/types';
import type { TraceDatum } from '@elastic/charts/src/chart_types/trace_chart/trace_api';

const simpleSpans: TraceDatum[] = [
  { id: 'a', name: 'root', traceId: 't1', start: 1000, end: 2000 },
  {
    id: 'b',
    name: 'child',
    parentId: 'a',
    traceId: 't1',
    start: 1200,
    end: 1500,
    active: [
      { start: 1200, end: 1300 },
      { start: 1400, end: 1500 },
    ],
  },
];

// same spans expressed as OTLP: 1 ms = 1_000_000 ns
const otelSpans = [
  {
    spanId: 'a',
    name: 'root',
    traceId: 't1',
    startTimeUnixNano: '1000000000',
    endTimeUnixNano: '2000000000',
  },
  {
    spanId: 'b',
    parentSpanId: 'a',
    name: 'child',
    traceId: 't1',
    startTimeUnixNano: '1200000000',
    endTimeUnixNano: '1500000000',
  },
];

const { spans: simpleNormalized } = normalize(simpleSpans, 'simple', 'time');
const { spans: otelNormalized } = normalize(otelSpans, 'otel', 'time');

const tdStyle: React.CSSProperties = { padding: '4px 8px', border: '1px solid #ccc', fontFamily: 'monospace' };
const thStyle: React.CSSProperties = { ...tdStyle, background: '#eee', fontWeight: 'bold' };

function SpanTable({ spans, label }: { spans: NormalizedSpan[]; label: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontFamily: 'sans-serif', marginBottom: 8 }}>{label}</h3>
      <table style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['id', 'name', 'parentId', 'traceId', 'start', 'end', 'active.length'].map((h) => (
              <th key={h} style={thStyle}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spans.map((s) => (
            <tr key={s.id}>
              <td style={tdStyle}>{s.id}</td>
              <td style={tdStyle}>{s.name}</td>
              <td style={tdStyle}>{s.parentId ?? '—'}</td>
              <td style={tdStyle}>{s.traceId ?? '—'}</td>
              <td style={tdStyle}>{s.start}</td>
              <td style={tdStyle}>{s.end}</td>
              <td style={tdStyle}>{s.active.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Example = () => (
  <div className="echChart">
    <div className="echChartStatus" data-ech-render-complete={true} />
    <div style={{ padding: 24 }}>
      <SpanTable spans={simpleNormalized} label="simple format → normalize(..., 'simple', 'time')" />
      <SpanTable spans={otelNormalized} label="otel format → normalize(..., 'otel', 'time')" />
    </div>
  </div>
);

Example.parameters = {
  showHeader: true,
};
