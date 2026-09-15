/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState, useCallback } from 'react';

import type { BrushEndListener } from '@elastic/charts';
import {
  AreaSeries,
  Axis,
  Chart,
  Position,
  RectAnnotation,
  ScaleType,
  Settings,
  Tooltip,
  TooltipType,
  Trace,
} from '@elastic/charts';

import { CHECKOUT_WATERFALL } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// ---------------------------------------------------------------------------
// Overview data — span-count histogram in linear (elapsed-ms) space.
// The Trace domain after normalize() is [0, 1000] ms (CHECKOUT_WATERFALL root spans 0–1000).
// Bucket left-edges (0, 100, … 900) + an anchor at 1000 give the chart an x domain of
// [0, 1000], matching the Trace internal coordinate space exactly.
// ---------------------------------------------------------------------------

const BUCKET_MS = 100;
const TRACE_DOMAIN_MAX = 1000;

/** Count spans whose midpoint (start+end)/2 falls in each 100ms bucket. */
function buildOverviewData(spans: typeof CHECKOUT_WATERFALL) {
  const counts: Record<number, number> = {};
  for (let t = 0; t <= TRACE_DOMAIN_MAX; t += BUCKET_MS) {
    counts[t] = 0;
  }
  for (const s of spans) {
    const mid = (s.start + s.end) / 2;
    const bucket = Math.floor(mid / BUCKET_MS) * BUCKET_MS;
    if (bucket in counts) counts[bucket]++;
  }
  return Object.entries(counts).map(([x, y]) => ({ x: Number(x), y }));
}

const OVERVIEW_DATA = buildOverviewData(CHECKOUT_WATERFALL);

export const Example: ChartsStory = (_, { title, description }) => {
  const baseTheme = useBaseTheme();

  // The visible window driven into the Trace detail panel (null = uncontrolled).
  const [focusDomain, setFocusDomain] = useState<[number, number] | null>(null);

  // The visible window reflected as a rect annotation on the overview.
  // Updated from TWO sources:
  //   1. onBrushEnd — immediately, because the pre-seed in syncFocusDomain suppresses the
  //      confirming echo so onFocusDomainChange never fires back for this path.
  //   2. onFocusDomainChange — for Trace gesture-driven changes (zoom/pan/brush on the detail).
  const [annotationDomain, setAnnotationDomain] = useState<[number, number] | null>(null);

  const onBrushEnd = useCallback<BrushEndListener>(({ x }) => {
    if (!x) return;
    const d: [number, number] = [Number(x[0]), Number(x[1])];
    setFocusDomain(d);
    setAnnotationDomain(d); // update annotation directly — don't rely on the suppressed echo
  }, []);

  const onFocusDomainChange = useCallback((domain: [number, number]) => {
    setAnnotationDomain(domain); // Trace gesture-driven changes
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* ── Overview: span-count histogram ────────────────────────────────── */}
      <Chart title="Overview — span activity" size={{ width: '100%', height: 120 }}>
        <Settings
          baseTheme={baseTheme}
          onBrushEnd={onBrushEnd}
          theme={{
            chartMargins: { top: 4, bottom: 4, left: 0, right: 0 },
            chartPaddings: { top: 0, bottom: 0, left: 0, right: 0 },
            areaSeriesStyle: { point: { visible: 'never' } },
          }}
        />
        <Tooltip type={TooltipType.None} />
        <Axis id="bottom" position={Position.Bottom} tickFormat={(v) => `${Number(v).toFixed(0)} ms`} />
        <Axis
          id="left"
          position={Position.Left}
          ticks={3}
          style={{
            tickLine: { size: 0 },
            tickLabel: { padding: 4 },
            axisTitle: { visible: false, padding: 0 },
          }}
        />

        <AreaSeries
          id="span-count"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={OVERVIEW_DATA}
        />

        {/* Reflects the Trace's current visible window. Updated immediately on brush
            (echo-suppression means onFocusDomainChange doesn't fire for that path),
            and from onFocusDomainChange for Trace gesture-driven changes. */}
        {annotationDomain && (
          <RectAnnotation
            id="trace-window"
            dataValues={[{ coordinates: { x0: annotationDomain[0], x1: annotationDomain[1] } }]}
            style={{ fill: '#0077CC', opacity: 0.15, strokeWidth: 0 }}
            hideTooltips
          />
        )}
      </Chart>

      {/* ── Detail: Trace waterfall ───────────────────────────────────────── */}
      <Chart title={title} description={description} size={{ width: '100%', height: 320 }}>
        <Settings baseTheme={baseTheme} />
        <Trace
          id="trace-detail"
          data={CHECKOUT_WATERFALL}
          xScaleType="linear"
          focusDomain={focusDomain ?? undefined}
          onFocusDomainChange={onFocusDomainChange}
        />
      </Chart>
    </div>
  );
};

Example.parameters = {
  markdown:
    '**Overview + detail composition via `focusDomain` / `onFocusDomainChange`.**\n\n' +
    'The overview histogram and the Trace detail panel share the same elapsed-ms coordinate space ' +
    '(`xScaleType="linear"`, domain re-zeroed by `normalize()` to `[0, totalMs]`).\n\n' +
    '**Interactions:**\n' +
    '- **Brush the overview** → blue rect + Trace eases to the selected window.\n' +
    '- **Zoom / pan / brush the Trace** → blue rect in overview reflects the new window.\n' +
    '- **Echo-suppression:** the overview brush feeds its domain back as `focusDomain`;\n' +
    '  a pre-seed suppresses the confirming echo so the overview annotation\n' +
    '  is updated directly in `onBrushEnd`, not via `onFocusDomainChange`.',
};
