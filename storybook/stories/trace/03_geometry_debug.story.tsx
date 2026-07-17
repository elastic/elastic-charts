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
import { buildGeometry } from '@elastic/charts/src/chart_types/trace_chart/render/geometry';
import type { TraceGeometry, TraceStyle } from '@elastic/charts/src/chart_types/trace_chart/render/types';

import { CHECKOUT_SPANS } from './data';

// ---------------------------------------------------------------------------
// Pipeline — runs once at module load (static fixture)
// ---------------------------------------------------------------------------
const CANVAS_W = 900;
const CANVAS_H = 400;

// Fixed style — production derives this via buildTraceStyle(theme).
const STYLE: TraceStyle = {
  gutterWidth: 200, timeBarHeight: 32, laneHeight: 28, totalLineThickness: 2,
  totalLineColor: '#aaa', activeSegmentColor: '#1f6feb',
  gutterLabel:  { fontFamily: 'monospace', fontSize: 12, color: '#333' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#555' },
  gridLineColor: '#e8e8e8',
  focusedLaneBackground: 'rgba(96,146,192,0.15)',
  selectedSegmentStroke: '#f00', selectedSegmentStrokeWidth: 2,
};

const { spans: normalized, domain } = normalize(CHECKOUT_SPANS, 'linear');
const resolved = resolveActive(normalized);
const geom = buildGeometry(resolved, { width: CANVAS_W, height: CANVAS_H }, { min: 0, max: 1000 }, 0, STYLE, 'linear', domain);

// ---------------------------------------------------------------------------
// GeometryOverlay — renders the computed layout regions + span lanes as divs
// ---------------------------------------------------------------------------
function GeometryOverlay({ g, style }: { g: TraceGeometry; style: TraceStyle }) {
  return (
    <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, border: '1px solid #ccc', background: '#fafafa' }}>
      {/* Gutter */}
      <div
        style={{ position: 'absolute', top: g.gutter.top, left: g.gutter.left, width: g.gutter.width, height: g.gutter.height, background: 'rgba(0,200,100,0.15)', borderRight: '2px solid rgba(0,200,100,0.5)', boxSizing: 'border-box' }}
        title={`gutter: ${JSON.stringify(g.gutter)}`}
      >
        <span style={{ fontSize: 10, color: '#555', padding: 4 }}>gutter</span>
      </div>

      {/* Time bar */}
      <div
        style={{ position: 'absolute', top: g.timeBar.top, left: g.timeBar.left, width: g.timeBar.width, height: g.timeBar.height, background: 'rgba(255,200,0,0.25)', borderBottom: '2px solid rgba(200,150,0,0.5)', boxSizing: 'border-box' }}
        title={`timeBar: ${JSON.stringify(g.timeBar)}`}
      >
        <span style={{ fontSize: 10, color: '#555', padding: 4 }}>time bar</span>
      </div>

      {/* Plot */}
      <div
        style={{ position: 'absolute', top: g.plot.top, left: g.plot.left, width: g.plot.width, height: g.plot.height, background: 'rgba(255,255,255,0.6)', boxSizing: 'border-box' }}
        title={`plot: ${JSON.stringify(g.plot)}`}
      />

      {/* Lane rects: one per span */}
      {g.spans.map((span: TraceGeometry['spans'][number], i: number) => {
        const laneTop  = g.plot.top + i * g.laneHeight - g.scrollOffset;
        const spanLeft = g.scale(span.start);
        const spanRight= g.scale(span.end);
        return (
          <React.Fragment key={span.id}>
            {/* Lane stripe */}
            <div style={{ position: 'absolute', top: laneTop, left: g.plot.left, width: g.plot.width, height: g.laneHeight - 1, background: i % 2 === 0 ? 'rgba(200,220,255,0.15)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.05)', boxSizing: 'border-box' }} />
            {/* Total-duration bar */}
            <div style={{ position: 'absolute', top: laneTop + g.laneHeight / 2 - 1, left: spanLeft, width: spanRight - spanLeft, height: 2, background: style.totalLineColor }} title={`${span.name}: ${span.start}–${span.end}ms`} />
            {/* Active segments */}
            {span.activeSegments.map((seg: TraceGeometry['spans'][number]['activeSegments'][number], j: number) => (
              <div key={j} style={{ position: 'absolute', top: laneTop + 4, left: g.scale(seg.start), width: g.scale(seg.end) - g.scale(seg.start), height: g.laneHeight - 8, background: style.activeSegmentColor, borderRadius: 2, opacity: 0.75 }} title={`active: ${seg.start}–${seg.end}ms`} />
            ))}
            {/* Gutter name */}
            <div style={{ position: 'absolute', top: laneTop + 6, left: 4, width: g.gutter.width - 8, fontSize: 11, fontFamily: 'monospace', color: '#333', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {span.name}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------
export const Example = () => (
  <div style={{ fontFamily: 'sans-serif' }}>
    <div className="echChart">
      <div className="echChartStatus" data-ech-render-complete={true} />
      <div style={{ padding: 24 }}>
        <GeometryOverlay g={geom} style={STYLE} />
      </div>
    </div>
    <details style={{ marginTop: 24, padding: '0 24px' }}>
      <summary style={{ cursor: 'pointer', fontSize: 13 }}>TraceGeometry values</summary>
      <pre style={{ fontSize: 12, marginTop: 8, background: '#f5f5f5', padding: 12 }}>
        {JSON.stringify({ gutter: geom.gutter, timeBar: geom.timeBar, plot: geom.plot, laneHeight: geom.laneHeight, domain: geom.domain, focusDomain: geom.focusDomain, scrollOffset: geom.scrollOffset, xScaleType: geom.xScaleType, spanCount: geom.spans.length }, null, 2)}
      </pre>
    </details>
  </div>
);

Example.parameters = {
  resize: { height: '520px', overflow: 'auto' },
  markdown:
    'Debug view of `buildGeometry` layout output — rendered as `<div>`s before any canvas drawing.\n\n' +
    '**Green** = gutter region · **Yellow** = time bar · **White/transparent** = plot area · ' +
    '**Blue lanes** = span active segments. Hover any region for its rect values. ' +
    'Expand the details block for the full `TraceGeometry` dump.',
};
