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
import type { TraceStyle } from '@elastic/charts/src/chart_types/trace_chart/render/types';
import type { TraceDatum } from '@elastic/charts/src/chart_types/trace_chart/trace_api';

const spans: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /checkout', traceId: 't1', start: 0, end: 1000 },
  { id: 'auth', name: 'AuthService.validate', parentId: 'root', traceId: 't1', start: 100, end: 350 },
  { id: 'db', name: 'DB.query', parentId: 'root', traceId: 't1', start: 400, end: 850 },
  { id: 'cache', name: 'Cache.get', parentId: 'db', traceId: 't1', start: 420, end: 600 },
  { id: 'leaf', name: 'Serializer.encode', parentId: 'db', traceId: 't1', start: 700, end: 820 },
];

// A fixed TraceStyle — production code derives this from the Theme via buildTraceStyle().
const style: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  laneHeight: 28,
  totalLineThickness: 2,
  totalLineColor: '#aaa',
  activeSegmentColor: '#1f6feb',
  gutterLabel: { fontFamily: 'monospace', fontSize: 12, color: '#333' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#555' },
  gridLineColor: '#e8e8e8',
  focusedLaneBackground: 'rgba(96,146,192,0.15)',
};

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 400;
const focusDomain = { min: 0, max: 1000 };

const { spans: normalized, domain } = normalize(spans, 'linear');
const resolved = resolveActive(normalized);
const geom = buildGeometry(resolved, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, focusDomain, 0, style, 'linear', domain);

export const Example = () => (
  <div className="echChart">
    <div className="echChartStatus" data-ech-render-complete={true} />
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: 12 }}>Spec 3 — geometry debug</h2>
      <p style={{ marginBottom: 16, color: '#555', fontSize: 13 }}>
        Layout regions and lane rects from <code>buildGeometry</code> rendered as{' '}
        <code>&lt;div&gt;</code>s — before any canvas drawing. Green = gutter, yellow = time bar,
        white = plot, blue lanes = spans.
      </p>

      {/* Canvas-sized container */}
      <div
        style={{
          position: 'relative',
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          border: '1px solid #ccc',
          background: '#fafafa',
        }}
      >
        {/* Gutter region */}
        <div
          style={{
            position: 'absolute',
            top: geom.gutter.top,
            left: geom.gutter.left,
            width: geom.gutter.width,
            height: geom.gutter.height,
            background: 'rgba(0, 200, 100, 0.15)',
            borderRight: '2px solid rgba(0,200,100,0.5)',
            boxSizing: 'border-box',
          }}
          title={`gutter: ${JSON.stringify(geom.gutter)}`}
        >
          <span style={{ fontSize: 10, color: '#555', padding: 4 }}>gutter</span>
        </div>

        {/* Time bar region */}
        <div
          style={{
            position: 'absolute',
            top: geom.timeBar.top,
            left: geom.timeBar.left,
            width: geom.timeBar.width,
            height: geom.timeBar.height,
            background: 'rgba(255, 200, 0, 0.25)',
            borderBottom: '2px solid rgba(200,150,0,0.5)',
            boxSizing: 'border-box',
          }}
          title={`timeBar: ${JSON.stringify(geom.timeBar)}`}
        >
          <span style={{ fontSize: 10, color: '#555', padding: 4 }}>time bar</span>
        </div>

        {/* Plot region */}
        <div
          style={{
            position: 'absolute',
            top: geom.plot.top,
            left: geom.plot.left,
            width: geom.plot.width,
            height: geom.plot.height,
            background: 'rgba(255,255,255,0.6)',
            boxSizing: 'border-box',
          }}
          title={`plot: ${JSON.stringify(geom.plot)}`}
        />

        {/* Lane rects: one per span */}
        {geom.spans.map((span, i) => {
          const laneTop = geom.plot.top + i * geom.laneHeight - geom.scrollOffset;
          const spanLeft = geom.scale(span.start);
          const spanRight = geom.scale(span.end);
          return (
            <React.Fragment key={span.id}>
              {/* Full-width lane stripe */}
              <div
                style={{
                  position: 'absolute',
                  top: laneTop,
                  left: geom.plot.left,
                  width: geom.plot.width,
                  height: geom.laneHeight - 1,
                  background: i % 2 === 0 ? 'rgba(200,220,255,0.15)' : 'transparent',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  boxSizing: 'border-box',
                }}
              />
              {/* Total-duration bar */}
              <div
                style={{
                  position: 'absolute',
                  top: laneTop + geom.laneHeight / 2 - 1,
                  left: spanLeft,
                  width: spanRight - spanLeft,
                  height: 2,
                  background: style.totalLineColor,
                }}
                title={`${span.name}: ${span.start}–${span.end}ms`}
              />
              {/* Active segments */}
              {span.activeSegments.map((seg, j) => (
                <div
                  key={j}
                  style={{
                    position: 'absolute',
                    top: laneTop + 4,
                    left: geom.scale(seg.start),
                    width: geom.scale(seg.end) - geom.scale(seg.start),
                    height: geom.laneHeight - 8,
                    background: style.activeSegmentColor,
                    borderRadius: 2,
                    opacity: 0.75,
                  }}
                  title={`active: ${seg.start}–${seg.end}ms`}
                />
              ))}
              {/* Span name label in gutter */}
              <div
                style={{
                  position: 'absolute',
                  top: laneTop + 6,
                  left: 4,
                  width: geom.gutter.width - 8,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: '#333',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {span.name}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Debug table */}
      <details style={{ marginTop: 24 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13 }}>TraceGeometry values</summary>
        <pre style={{ fontSize: 12, marginTop: 8, background: '#f5f5f5', padding: 12 }}>
          {JSON.stringify(
            {
              gutter: geom.gutter,
              timeBar: geom.timeBar,
              plot: geom.plot,
              laneHeight: geom.laneHeight,
              domain: geom.domain,
              focusDomain: geom.focusDomain,
              scrollOffset: geom.scrollOffset,
              xScaleType: geom.xScaleType,
              spanCount: geom.spans.length,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  </div>
);

Example.parameters = {
  showHeader: true,
};
