/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useMemo, useState } from 'react';

import { Chart, Settings, Trace } from '@elastic/charts';
import type { TraceDatum } from '@elastic/charts/src/chart_types/trace_chart/trace_api';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Epoch ms anchor for 'time' scale mode. Using a fixed date prevents the raster
 * engine from parking the view at 1970-01-01 where every calendar boundary
 * (year/month/day/hour/minute/second) coincides at x = plot.left, producing
 * overlapping "gibberish" labels. Same value used in 04_time_bar.story.tsx.
 */
const EPOCH_BASE = 1_700_000_000_000; // 2023-11-14T22:13:20Z

/**
 * Nested fixture: one root span with multiple children (some of which have their
 * own children), providing realistic self-time distribution.
 *
 * Sized for vertical-scroll testing: 16 lanes × 24 px = 384 px > plotHeight ~268 px,
 * so lane-scroll is reachable by dragging vertically. All start/end values are
 * elapsed-ms; they are stretched by SPAN_DURATION_SCALE and the epoch offset (for
 * time mode) is applied at render time via the data useMemo.
 */
const FIXTURE: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /checkout', traceId: 't1', start: 0, end: 1000 },
  { id: 'auth', name: 'AuthService.validate', parentId: 'root', traceId: 't1', start: 100, end: 350 },
  { id: 'db', name: 'DB.query', parentId: 'root', traceId: 't1', start: 400, end: 850 },
  { id: 'cache', name: 'Cache.get', parentId: 'db', traceId: 't1', start: 420, end: 600 },
  { id: 'leaf', name: 'Serializer.encode', parentId: 'db', traceId: 't1', start: 700, end: 820 },
  { id: 'extra1', name: 'Queue.enqueue', parentId: 'root', traceId: 't1', start: 860, end: 920 },
  { id: 'extra2', name: 'Cache.set', parentId: 'db', traceId: 't1', start: 620, end: 680 },
  { id: 'extra3', name: 'Auth.token_refresh', parentId: 'auth', traceId: 't1', start: 110, end: 200 },
  { id: 'extra4', name: 'Metrics.record', parentId: 'root', traceId: 't1', start: 950, end: 980 },
  { id: 'extra5', name: 'TLS.handshake', parentId: 'root', traceId: 't1', start: 10, end: 95 },
  // Additional spans to push content height (16 × 24 = 384 px) past plot height (~268 px),
  // making vertical scroll reachable.
  { id: 'extra6', name: 'Logger.flush', parentId: 'root', traceId: 't1', start: 820, end: 860 },
  { id: 'extra7', name: 'Redis.get', parentId: 'cache', traceId: 't1', start: 430, end: 510 },
  { id: 'extra8', name: 'Redis.set', parentId: 'extra2', traceId: 't1', start: 625, end: 665 },
  { id: 'extra9', name: 'JWT.verify', parentId: 'auth', traceId: 't1', start: 210, end: 290 },
  { id: 'extra10', name: 'S3.getObject', parentId: 'db', traceId: 't1', start: 500, end: 580 },
  { id: 'extra11', name: 'gRPC.call', parentId: 'root', traceId: 't1', start: 300, end: 395 },
];

/**
 * Multiplier applied to all fixture start/end values at render time. Stretches the 0–1000 ms
 * fixture to 0–10 000 ms (~10 s) so the two x-scale modes produce visibly different labels:
 *   - linear: elapsed from zero → "0ms, 1s, 2s, … 10s"
 *   - time:   absolute wall-clock → "22:13:20, 22:13:21, … 22:13:30"
 * A sub-second trace with a whole-second EPOCH_BASE would produce identical ms-within-second labels
 * in both modes (a coincidence, not a feature).
 */
const SPAN_DURATION_SCALE = 10;

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const [xScaleType, setXScaleType] = useState<'time' | 'linear'>('linear');

  // Scale durations ×10 (0–10 000 ms) so the time bar crosses whole-second boundaries in both modes.
  // In 'time' mode also offset by EPOCH_BASE so the raster engine renders realistic wall-clock ticks.
  // Without the offset, small elapsed-ms values are interpreted as epoch ms (1970-01-01T00:00:00.001Z)
  // where every calendar boundary coincides at x = plot.left, producing overlapping labels.
  const data = useMemo(() => {
    const scaled = FIXTURE.map((d) => ({
      ...d,
      start: d.start * SPAN_DURATION_SCALE,
      end: d.end * SPAN_DURATION_SCALE,
    }));
    return xScaleType === 'time'
      ? scaled.map((d) => ({ ...d, start: d.start + EPOCH_BASE, end: d.end + EPOCH_BASE }))
      : scaled;
  }, [xScaleType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Spec 6 — Interactive trace waterfall</h2>
        <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13 }}>
          Wheel to zoom · Drag to pan (horizontal = time axis, vertical = lane scroll) · Release to coast
        </p>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          x scale
          <select
            value={xScaleType}
            onChange={(e) => setXScaleType(e.target.value as 'time' | 'linear')}
            style={{ fontSize: 13 }}
          >
            <option value="linear">linear (elapsed ms)</option>
            <option value="time">time (epoch ms)</option>
          </select>
        </label>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
        <Settings baseTheme={theme} />
        <Trace id="trace_interactive" data={data} format="simple" xScaleType={xScaleType} />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        16-span trace · ~10 s duration ·{' '}
        {xScaleType === 'linear'
          ? 'linear scale: elapsed time from zero (0ms … 10s)'
          : 'time scale: absolute wall-clock ticks (22:13:20 … 22:13:30)'}{' '}
        · wheel-zoom eased via domainTween · drag-pan 1:1 · kinetic coast on release · vertical drag scrolls lanes
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
