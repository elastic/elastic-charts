/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number, select } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import type { CustomTooltip, OtelSpan, TraceDatum } from '@elastic/charts';
import { Chart, fromOtlp, Settings, Tooltip, Trace } from '@elastic/charts';

import { EPOCH_BASE, EPOCH_BASE_NS, OTEL_TOOLTIP_SPANS } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Custom tooltip component — renders the default span metadata rows plus all OTel
 * `attributes` and `status` from `datum.meta` (the original OtelSpan).
 *
 * XSS note: all attribute values are rendered as React text children (String() coercion),
 * never via dangerouslySetInnerHTML. React auto-escapes text children.
 */
const TraceCustomTooltip: CustomTooltip = ({ values, backgroundColor }) => {
  const datum = values[0]?.datum as TraceDatum | undefined;
  if (!datum) return null;

  const meta = datum.meta as OtelSpan;
  const attrs = meta?.attributes ?? [];
  const status = meta?.status;

  return (
    <div
      style={{
        padding: '8px 12px',
        minWidth: 220,
        fontFamily: 'monospace',
        fontSize: 12,
        background: backgroundColor,
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
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
  // Number of stacked tick-label rows in time mode (theme.trace.timeAxisLayerCount). Ignored in linear.
  const timeAxisLayerCount = number('tick layers (time mode)', 2, { min: 0, max: 3, step: 1 });

  // In 'time' mode shift nanosecond timestamps by EPOCH_BASE_NS so the raster engine
  // renders realistic wall-clock ticks. fromOtlp converts ns → epoch-ms and stores
  // the original OtelSpan on datum.meta (used by TraceCustomTooltip above).
  const data = useMemo(() => {
    const spans =
      xScaleType === 'time'
        ? OTEL_TOOLTIP_SPANS.map((s) => ({
            ...s,
            startTimeUnixNano: (BigInt(s.startTimeUnixNano) + EPOCH_BASE_NS).toString(),
            endTimeUnixNano: (BigInt(s.endTimeUnixNano) + EPOCH_BASE_NS).toString(),
          }))
        : OTEL_TOOLTIP_SPANS;
    return fromOtlp(spans);
  }, [xScaleType]);

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
      <Settings
        baseTheme={theme}
        theme={{ trace: { timeAxisLayerCount } }}
        onElementClick={action('onElementClick')}
        onElementOver={action('onElementOver')}
        onElementOut={action('onElementOut')}
      />
      {/* customTooltip receives values[0].datum as TraceDatum; .meta is the OtelSpan */}
      <Tooltip customTooltip={TraceCustomTooltip} />
      <Trace
        id="trace_tooltip_events"
        data={data}
        xScaleType={xScaleType}
        showTooltipOverEmpty={showTooltipOverEmpty}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Demonstrates the default tooltip (Name / Duration / Self time / Start / State) and a ' +
    '**custom tooltip** that additionally renders OTel `attributes` and `status` from `datum.meta`.\n\n' +
    '`onElementClick` / `onElementOver` / `onElementOut` are wired to the **Actions** panel — ' +
    'hover or click a span to log events. The `tooltip over empty region` knob controls whether ' +
    'hovering empty canvas still shows a tooltip. The x-scale knob switches linear ↔ wall-clock.\n\n' +
    `EPOCH_BASE: \`${EPOCH_BASE}\` (2023-11-14T22:13:20Z)`,
};
