/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import type { CustomTooltip, OtelSpan, TraceDatum } from '@elastic/charts';
import { Chart, fromOtlp, Settings, Tooltip, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Epoch ms anchor for 'time' scale mode — same value as 06_interactive.story.tsx.
 * Applied as a nanosecond offset (× 1_000_000) via BigInt to avoid precision loss.
 */
const EPOCH_BASE = 1_700_000_000_000; // 2023-11-14T22:13:20Z
const EPOCH_BASE_NS = BigInt(EPOCH_BASE) * 1_000_000n;

/**
 * Small OTel fixture with `attributes` and `status` so the custom tooltip can render them.
 * Times are in nanoseconds (1 ms = 1_000_000 ns). Using string form to match OTLP JSON encoding.
 */
const OTEL_SPANS: OtelSpan[] = [
  {
    spanId: 's1',
    name: 'HTTP GET /api/v1/data',
    traceId: 't1',
    startTimeUnixNano: '0',
    endTimeUnixNano: '1000000000',
    attributes: [
      { key: 'http.method', value: 'GET' },
      { key: 'http.url', value: '/api/v1/data' },
      { key: 'http.status_code', value: 200 },
    ],
    status: { code: 1, message: 'OK' },
  },
  {
    spanId: 's2',
    parentSpanId: 's1',
    name: 'DB.query users',
    traceId: 't1',
    startTimeUnixNano: '100000000',
    endTimeUnixNano: '600000000',
    attributes: [
      { key: 'db.system', value: 'postgresql' },
      { key: 'db.statement', value: 'SELECT * FROM users WHERE id = $1' },
    ],
    status: { code: 1 },
  },
  {
    spanId: 's3',
    parentSpanId: 's1',
    name: 'Cache.get session',
    traceId: 't1',
    startTimeUnixNano: '620000000',
    endTimeUnixNano: '800000000',
    attributes: [
      { key: 'cache.backend', value: 'redis' },
      { key: 'cache.hit', value: false },
    ],
    status: { code: 2, message: 'CACHE_MISS' },
  },
  {
    spanId: 's4',
    parentSpanId: 's2',
    name: 'Auth.verify_token',
    traceId: 't1',
    startTimeUnixNano: '110000000',
    endTimeUnixNano: '280000000',
    attributes: [
      { key: 'auth.method', value: 'JWT' },
    ],
    status: { code: 1 },
  },
];

/**
 * Custom tooltip — renders the default span metadata plus all OTel attributes and status.
 *
 * XSS note: all OTel attribute values are rendered as React text children (String() coercion),
 * never via dangerouslySetInnerHTML. React auto-escapes text children.
 */
const TraceCustomTooltip: CustomTooltip = ({ values, backgroundColor }) => {
  const datum = values[0]?.datum as TraceDatum | undefined;
  if (!datum) return null;

  const meta = datum.meta as OtelSpan;
  const attrs = meta?.attributes ?? [];
  const status = meta?.status;

  return (
    <div style={{ padding: '8px 12px', minWidth: 220, fontFamily: 'monospace', fontSize: 12, background: backgroundColor, borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{datum.name}</div>
      {values.map((v) => (
        <div key={v.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: '#888' }}>{v.label}</span>
          <span>{v.formattedValue}</span>
        </div>
      ))}
      {attrs.length > 0 && (
        <>
          <hr style={{ margin: '6px 0', borderColor: '#eee' }} />
          <div style={{ color: '#888', marginBottom: 4 }}>OTel attributes</div>
          {attrs.map((attr) => (
            <div key={attr.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
              <span style={{ color: '#888' }}>{String(attr.key)}</span>
              <span>{String(attr.value)}</span>
            </div>
          ))}
        </>
      )}
      {status && (
        <>
          <hr style={{ margin: '6px 0', borderColor: '#eee' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ color: '#888' }}>status.code</span>
            <span>{String(status.code ?? '—')}</span>
          </div>
          {status.message && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#888' }}>status.message</span>
              <span>{String(status.message)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const xScaleType = select<'time' | 'linear'>(
    'x scale',
    { 'linear (elapsed ms)': 'linear', 'time (epoch ms)': 'time' },
    'linear',
  );
  const showTooltipOverEmpty = boolean('tooltip over empty region', false);

  // In 'time' mode shift the nanosecond timestamps by EPOCH_BASE so the raster
  // engine renders realistic wall-clock ticks instead of 1970-01-01 labels.
  // fromOtlp converts nanoseconds → epoch-ms and carries the original OtelSpan on datum.meta.
  const data = useMemo(() => {
    const spans =
      xScaleType === 'time'
        ? OTEL_SPANS.map((s) => ({
            ...s,
            startTimeUnixNano: (BigInt(s.startTimeUnixNano) + EPOCH_BASE_NS).toString(),
            endTimeUnixNano: (BigInt(s.endTimeUnixNano) + EPOCH_BASE_NS).toString(),
          }))
        : OTEL_SPANS;
    return fromOtlp(spans);
  }, [xScaleType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Spec 7 — Tooltip &amp; element events</h2>
        <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13 }}>
          Hover a span to see the default tooltip (Name / Duration / Self time / Start / State).
          The custom tooltip below also renders OTel attributes and status.
          Click a span or hover to log <code>onElementClick</code> / <code>onElementOver</code> in
          the Actions panel.
        </p>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
        <Settings
          baseTheme={theme}
          onElementClick={action('onElementClick')}
          onElementOver={action('onElementOver')}
          onElementOut={action('onElementOut')}
        />
        {/* customTooltip receives values[0].datum as TraceDatum; .meta is the OtelSpan with attributes/status. */}
        <Tooltip customTooltip={TraceCustomTooltip} />
        <Trace id="trace_tooltip_events" data={data} xScaleType={xScaleType} showTooltipOverEmpty={showTooltipOverEmpty} />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        OTel format · 4-span trace · hover region reflected in the State tooltip row ·
        cursor turns to pointer over active/waiting regions
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
