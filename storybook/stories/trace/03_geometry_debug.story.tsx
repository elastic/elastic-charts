/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import type { TraceSelection } from '@elastic/charts';
import { buildDisclosureMap, collapsibleParentIds } from '@elastic/charts/src/chart_types/trace_chart/data/collapse';
import { normalize } from '@elastic/charts/src/chart_types/trace_chart/data/normalize';
import { orderLanes } from '@elastic/charts/src/chart_types/trace_chart/data/order_lanes';
import { resolveActive, waitingSegments } from '@elastic/charts/src/chart_types/trace_chart/data/self_time';
import { pickDisclosure, pickRegion } from '@elastic/charts/src/chart_types/trace_chart/render/canvas2d_renderer';
import { buildGeometry } from '@elastic/charts/src/chart_types/trace_chart/render/geometry';
import type { TraceGeometry, TraceStyle } from '@elastic/charts/src/chart_types/trace_chart/render/types';
import { CARET_GLYPH_PX, CARET_INDENT_STEP_PX } from '@elastic/charts/src/chart_types/trace_chart/render/types';

import { CHECKOUT_SPANS } from './data';
import type { ChartsStory } from '../../types';

// ---------------------------------------------------------------------------
// Pipeline — runs once at module load (static fixture)
// ---------------------------------------------------------------------------
const CANVAS_W = 900;
const CANVAS_H = 400;
const LANE_PADDING = 4;

// Fixed style — production derives this via buildTraceStyle(theme).
const STYLE: TraceStyle = {
  gutterWidth: 200,
  timeBarHeight: 32,
  timeAxisLayerCount: 2,
  laneHeight: 28,
  totalLineThickness: 2,
  totalLineColor: '#aaa',
  activeSegmentColor: '#1f6feb',
  gutterLabel: { fontFamily: 'monospace', fontSize: 12, color: '#333' },
  timeBarLabel: { fontFamily: 'monospace', fontSize: 11, color: '#555' },
  gridLineColor: '#e8e8e8',
  focusedLaneBackground: 'rgba(96,146,192,0.15)',
  selectedSegmentStroke: '#f00',
  selectedSegmentStrokeWidth: 2,
  criticalPathColor: '#c61e25',
  criticalPathThickness: 2,
  labelPosition: 'gutter',
};

const SELECTION: TraceSelection = [
  { spanId: 'auth', region: 'active', segmentIndex: 0 },
  { spanId: 'db', region: 'span', segmentIndex: -1 },
];

const CRITICAL_INTERVALS: ReadonlyArray<{ spanId: string; start: number; end: number }> = [
  { spanId: 'root', start: 0, end: 100 },
  { spanId: 'auth', start: 100, end: 350 },
  { spanId: 'root', start: 350, end: 400 },
  { spanId: 'db', start: 400, end: 700 },
  { spanId: 'leaf', start: 700, end: 820 },
  { spanId: 'db', start: 820, end: 850 },
  { spanId: 'root', start: 850, end: 1000 },
];

const { spans: normalized, domain } = normalize(CHECKOUT_SPANS, 'linear');
const { lanes, depthBySpan } = orderLanes(resolveActive(normalized), 'tree');
const maxDepth = Math.max(...depthBySpan.values());
const disclosureByLane = buildDisclosureMap(lanes, lanes, new Set(), depthBySpan, collapsibleParentIds(lanes));
const spanIdToLane = new Map(lanes.map((span, index) => [span.id, index]));
const geom = buildGeometry(
  lanes,
  { width: CANVAS_W, height: CANVAS_H },
  { min: 0, max: 1000 },
  0,
  STYLE,
  'linear',
  domain,
  null,
  SELECTION,
  spanIdToLane,
  null,
  disclosureByLane,
  true,
  maxDepth,
  CRITICAL_INTERVALS,
);

type Interval = { start: number; end: number };

function intervalPixels(g: TraceGeometry, interval: Interval): { left: number; width: number } | null {
  const left = Math.max(g.plot.left, g.scale(interval.start));
  const right = Math.min(g.plot.left + g.plot.width, g.scale(interval.end));
  return right > left ? { left, width: right - left } : null;
}

function selectionInterval(g: TraceGeometry, entry: TraceGeometry['resolvedSelection'][number]): Interval | null {
  const span = g.spans[entry.laneIndex];
  if (!span) return null;
  if (entry.region === 'span') return span;
  const segments = entry.region === 'active' ? span.activeSegments : waitingSegments(span);
  return segments[entry.segmentIndex] ?? null;
}

function within(x: number, y: number, region: TraceGeometry['plot']): boolean {
  return x >= region.left && x < region.left + region.width && y >= region.top && y < region.top + region.height;
}

function describeHover(g: TraceGeometry, x: number, y: number): string {
  const disclosureLane = pickDisclosure(x, y, g);
  if (disclosureLane >= 0) {
    const span = g.spans[disclosureLane];
    const disclosure = g.disclosureByLane.get(disclosureLane);
    if (span && disclosure) {
      return `lane ${disclosureLane} · ${span.name} · ${disclosure.state} disclosure · depth ${disclosure.depth} · ${disclosure.descendantCount} descendants`;
    }
  }
  if (within(x, y, g.gutter)) {
    return `gutter · left=${g.gutter.left}, top=${g.gutter.top}, ${g.gutter.width}×${g.gutter.height}px`;
  }
  if (within(x, y, g.timeBar)) {
    return `time bar · left=${g.timeBar.left}, top=${g.timeBar.top}, ${g.timeBar.width}×${g.timeBar.height}px`;
  }
  if (!within(x, y, g.plot)) return 'outside geometry';

  const result = pickRegion(x, y, g);
  if (!result) {
    return `plot · no lane hit · x=${Math.round(x)}, y=${Math.round(y)}`;
  }
  const span = g.spans[result.index];
  if (!span) return 'plot · no span';
  const segment = result.segmentIndex >= 0 ? ` · segment ${result.segmentIndex}` : '';
  return `lane ${result.index} · ${span.name} · ${result.region}${segment} · x=${Math.round(x)}, y=${Math.round(y)}`;
}

// ---------------------------------------------------------------------------
// GeometryOverlay — renders the computed layout regions + span lanes as divs
// ---------------------------------------------------------------------------
function GeometryOverlay({
  g,
  style,
  showHitTesting,
}: {
  g: TraceGeometry;
  style: TraceStyle;
  showHitTesting: boolean;
}) {
  const emptyHover = 'Move the pointer over the geometry to inspect its resolved region.';
  const [hoverDescription, setHoverDescription] = useState(emptyHover);

  return (
    <>
      <div
        data-testid="geometry-overlay"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left - event.currentTarget.clientLeft;
          const y = event.clientY - rect.top - event.currentTarget.clientTop;
          setHoverDescription(describeHover(g, x, y));
        }}
        onMouseLeave={() => setHoverDescription(emptyHover)}
        style={{
          position: 'relative',
          width: CANVAS_W,
          height: CANVAS_H,
          border: '1px solid #ccc',
          background: '#fafafa',
          cursor: 'crosshair',
        }}
      >
        {/* Gutter */}
        <div
          style={{
            position: 'absolute',
            top: g.gutter.top,
            left: g.gutter.left,
            width: g.gutter.width,
            height: g.gutter.height,
            background: 'rgba(0,200,100,0.15)',
            borderRight: '2px solid rgba(0,200,100,0.5)',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: 10, color: '#555', padding: 4 }}>gutter</span>
        </div>

        {/* Time bar */}
        <div
          style={{
            position: 'absolute',
            top: g.timeBar.top,
            left: g.timeBar.left,
            width: g.timeBar.width,
            height: g.timeBar.height,
            background: 'rgba(255,200,0,0.25)',
            borderBottom: '2px solid rgba(200,150,0,0.5)',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: 10, color: '#555', padding: 4 }}>time bar</span>
        </div>

        {/* Plot */}
        <div
          style={{
            position: 'absolute',
            top: g.plot.top,
            left: g.plot.left,
            width: g.plot.width,
            height: g.plot.height,
            background: 'rgba(255,255,255,0.6)',
            boxSizing: 'border-box',
          }}
        />

        {/* Lane rects: one per span */}
        {g.spans.map((span, i) => {
          const laneTop = g.plot.top + i * g.laneHeight - g.scrollOffset;
          const spanPixels = intervalPixels(g, span);
          const laneSelection = g.resolvedSelection.filter(({ laneIndex }) => laneIndex === i);
          const criticalIntervals = g.criticalIntervalsByLane.get(i) ?? [];
          const disclosure = g.disclosureByLane.get(i);
          const caretColumnWidth = g.gutter.width - style.gutterWidth;
          return (
            <React.Fragment key={span.id}>
              {/* Lane stripe */}
              <div
                style={{
                  position: 'absolute',
                  top: laneTop,
                  left: g.plot.left,
                  width: g.plot.width,
                  height: g.laneHeight - 1,
                  background: i % 2 === 0 ? 'rgba(200,220,255,0.15)' : 'transparent',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  boxSizing: 'border-box',
                }}
              />
              {/* Total-duration line */}
              {spanPixels && (
                <div
                  style={{
                    position: 'absolute',
                    top: laneTop + g.laneHeight / 2 - 1,
                    left: spanPixels.left,
                    width: spanPixels.width,
                    height: 2,
                    background: style.totalLineColor,
                  }}
                />
              )}
              {/* Active segments */}
              {span.activeSegments.map((segment, segmentIndex) => {
                const pixels = intervalPixels(g, segment);
                return pixels ? (
                  <div
                    key={segmentIndex}
                    style={{
                      position: 'absolute',
                      top: laneTop + LANE_PADDING,
                      left: pixels.left,
                      width: pixels.width,
                      height: g.laneHeight - LANE_PADDING * 2,
                      background: style.activeSegmentColor,
                      borderRadius: 2,
                      opacity: 0.75,
                    }}
                  />
                ) : null;
              })}
              {/* Critical-path intervals */}
              {criticalIntervals.map((interval, intervalIndex) => {
                const pixels = intervalPixels(g, interval);
                return pixels ? (
                  <div
                    key={`critical-${intervalIndex}`}
                    data-critical-path={span.id}
                    style={{
                      position: 'absolute',
                      zIndex: 2,
                      top: laneTop + g.laneHeight - LANE_PADDING,
                      left: pixels.left,
                      width: pixels.width,
                      height: style.criticalPathThickness,
                      background: style.criticalPathColor,
                    }}
                  />
                ) : null;
              })}
              {/* Selection outlines */}
              {laneSelection.map((entry) => {
                const interval = selectionInterval(g, entry);
                const pixels = interval && intervalPixels(g, interval);
                return pixels ? (
                  <div
                    key={`${entry.region}-${entry.segmentIndex}`}
                    data-selection-region={entry.region}
                    style={{
                      position: 'absolute',
                      zIndex: 3,
                      top: laneTop + LANE_PADDING - 1,
                      left: pixels.left,
                      width: pixels.width,
                      height: g.laneHeight - (LANE_PADDING - 1) * 2,
                      border: `${style.selectedSegmentStrokeWidth}px solid ${style.selectedSegmentStroke}`,
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                    }}
                  />
                ) : null;
              })}
              {/* Depth-indented disclosure caret for parent lanes */}
              {disclosure && (
                <div
                  data-disclosure-state={disclosure.state}
                  data-tree-depth={disclosure.depth}
                  style={{
                    position: 'absolute',
                    zIndex: 3,
                    top: laneTop,
                    left: g.gutter.left + disclosure.depth * CARET_INDENT_STEP_PX,
                    width: CARET_GLYPH_PX,
                    height: g.laneHeight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    fontSize: style.gutterLabel.fontSize,
                    color: style.gutterLabel.color,
                    pointerEvents: 'none',
                  }}
                >
                  {disclosure.state === 'collapsed' ? '▶' : '▼'}
                </div>
              )}
              {/* Gutter name */}
              <div
                style={{
                  position: 'absolute',
                  top: laneTop + 6,
                  left: caretColumnWidth + 4,
                  width: style.gutterWidth - 8,
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
              {/* pickRegion visualization: full lane is empty, then waiting/active intervals override it */}
              {showHitTesting && (
                <>
                  <div
                    data-hit-region="empty"
                    style={{
                      position: 'absolute',
                      zIndex: 4,
                      top: laneTop,
                      left: g.plot.left,
                      width: g.plot.width,
                      height: g.laneHeight,
                      background: 'rgba(232, 76, 61, 0.08)',
                      border: '1px dashed rgba(232, 76, 61, 0.35)',
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                    }}
                  />
                  {waitingSegments(span).map((segment, segmentIndex) => {
                    const pixels = intervalPixels(g, segment);
                    return pixels ? (
                      <div
                        key={`waiting-${segmentIndex}`}
                        data-hit-region="waiting"
                        style={{
                          position: 'absolute',
                          zIndex: 5,
                          top: laneTop,
                          left: pixels.left,
                          width: pixels.width,
                          height: g.laneHeight,
                          background: 'rgba(245, 166, 35, 0.18)',
                          border: '1px dashed rgba(180, 105, 0, 0.6)',
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                        }}
                      />
                    ) : null;
                  })}
                  {span.activeSegments.map((segment, segmentIndex) => {
                    const pixels = intervalPixels(g, segment);
                    return pixels ? (
                      <div
                        key={`active-${segmentIndex}`}
                        data-hit-region="active"
                        style={{
                          position: 'absolute',
                          zIndex: 6,
                          top: laneTop,
                          left: pixels.left,
                          width: pixels.width,
                          height: g.laneHeight,
                          background: 'rgba(0, 137, 123, 0.18)',
                          border: '1px dashed rgba(0, 105, 92, 0.7)',
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                        }}
                      />
                    ) : null;
                  })}
                  {disclosure && (
                    <div
                      data-hit-region="disclosure"
                      style={{
                        position: 'absolute',
                        zIndex: 7,
                        top: laneTop,
                        left: g.gutter.left + disclosure.depth * CARET_INDENT_STEP_PX,
                        width: CARET_GLYPH_PX,
                        height: g.laneHeight,
                        background: 'rgba(126, 87, 194, 0.16)',
                        border: '1px dashed rgba(81, 45, 168, 0.75)',
                        boxSizing: 'border-box',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        data-testid="geometry-hover-inspector"
        style={{
          width: CANVAS_W,
          marginTop: 8,
          padding: '8px 10px',
          border: '1px solid #d3dae6',
          borderRadius: 4,
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          fontSize: 12,
        }}
      >
        <strong>Hover inspector:</strong> {hoverDescription}
        {showHitTesting && (
          <span style={{ marginLeft: 16 }}>
            Hit areas: <span style={{ color: '#00897b' }}>active</span> ·{' '}
            <span style={{ color: '#b46900' }}>waiting</span> · <span style={{ color: '#c0392b' }}>empty</span> ·{' '}
            <span style={{ color: '#512da8' }}>disclosure</span>
          </span>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------
export const Example: ChartsStory = () => {
  const showHitTesting = boolean('show hit-testing areas', false);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div className="echChart">
        <div className="echChartStatus" data-ech-render-complete={true} />
        <div style={{ padding: 24 }}>
          <GeometryOverlay g={geom} style={STYLE} showHitTesting={showHitTesting} />
        </div>
      </div>
      <details style={{ marginTop: 24, padding: '0 24px' }}>
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
              disclosureByLane: [...geom.disclosureByLane.entries()],
              resolvedSelection: geom.resolvedSelection,
              criticalIntervalsByLane: [...geom.criticalIntervalsByLane.entries()],
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
};

Example.parameters = {
  resize: { height: '580px', overflow: 'auto' },
  markdown:
    'Debug view of `buildGeometry` layout output — rendered as `<div>`s before any canvas drawing.\n\n' +
    '**Green** = gutter · **Yellow** = time bar · **White/transparent** = plot · ' +
    '**Depth-indented carets** = nesting disclosures · **Blue** = active segments · ' +
    '**Red outline** = one selected segment plus one selected multi-segment span · ' +
    '**Dark red line** = critical-path intervals. Hover the visualization for the picker-backed region inspector. ' +
    'Enable **show hit-testing areas** to visualize `active`, `waiting`, `empty`, and disclosure hit regions. ' +
    'Expand the details block for the full `TraceGeometry` dump.',
};
