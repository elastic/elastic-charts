/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, number, boolean } from '@storybook/addon-knobs';
import React from 'react';

import type { PartialTheme } from '@elastic/charts';
import {
  Axis,
  BarSeries,
  Chart,
  LabelOverflowConstraint,
  Metric,
  Position,
  ScaleType,
  Settings,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const barData = [
  { x: '2021', y: 1234567.89 },
  { x: '2022', y: 2345678.9 },
  { x: '2023', y: 3456789.01 },
  { x: '2024', y: 4567890.12 },
  { x: '2025', y: 5678901.23 },
];

const metricData = [
  [
    {
      color: '#3c3c3c',
      title: 'Revenue 2025',
      subtitle: 'Total Revenue',
      value: 5678901.23,
      valueFormatter: (v: number) => `$${v.toFixed(2)}`,
    },
  ],
];

export const Example: ChartsStory = (_, { description }) => {
  // ── Layout ───────────────────────────────────────────────────────────────
  const chartWidth = number('Chart width (px)', 300, { min: 100, max: 1200, step: 1 });

  // ── Font ─────────────────────────────────────────────────────────────────
  const fontFamily = select(
    'Font: family',
    { Inter: 'Inter', Arial: 'Arial', 'Times New Roman': 'Times New Roman', Courier: 'Courier' },
    'Inter',
  );
  const fontSize = number('Font: size (px)', 20, { range: true, min: 8, max: 48, step: 1 });

  // ── font-feature-settings ─────────────────────────────────────────────────
  const tnum = boolean("font-feature-settings: 'tnum' — tabular digits", true);
  const zero = boolean("font-feature-settings: 'zero' — slashed zero", true);
  const ss01 = boolean("font-feature-settings: 'ss01' — open digits", true);
  const ss07 = boolean("font-feature-settings: 'ss07' — squared punctuation", true);

  // ── font-variant-numeric ──────────────────────────────────────────────────
  const tabularNums = boolean('font-variant-numeric: tabular-nums', true);
  const slashedZero = boolean('font-variant-numeric: slashed-zero', true);

  const fontFeatureParts: string[] = [];
  if (tnum) fontFeatureParts.push("'tnum'");
  if (zero) fontFeatureParts.push("'zero'");
  if (ss01) fontFeatureParts.push("'ss01'");
  if (ss07) fontFeatureParts.push("'ss07'");

  const fontVariantNumericParts: string[] = [];
  if (tabularNums) fontVariantNumericParts.push('tabular-nums');
  if (slashedZero) fontVariantNumericParts.push('slashed-zero');

  const containerStyle: React.CSSProperties = {
    ...(fontFeatureParts.length > 0 ? { fontFeatureSettings: fontFeatureParts.join(', ') } : {}),
    ...(fontVariantNumericParts.length > 0 ? { fontVariantNumeric: fontVariantNumericParts.join(' ') } : {}),
  };

  const theme: PartialTheme = {
    barSeriesStyle: {
      displayValue: {
        fontSize: fontSize + 2,
        fontFamily,
        fill: '#000',
      },
    },
    axes: {
      tickLabel: {
        fontSize,
        fontFamily,
        fill: '#000',
      },
    },
  };

  const anyFeaturesActive = fontFeatureParts.length > 0 || fontVariantNumericParts.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', ...containerStyle }}>
      <div style={{ height: '200px', width: `${chartWidth}px` }}>
        <Chart title="Metric Chart" description={description}>
          <Settings baseTheme={useBaseTheme()} />
          <Metric id="metric1" data={metricData} />
        </Chart>
      </div>

      <div style={{ height: '300px', width: `${chartWidth}px` }}>
        <Chart>
          <Settings theme={theme} baseTheme={useBaseTheme()} />
          <Axis id="bottom" position={Position.Bottom} title="Year" showOverlappingTicks />
          <Axis
            id="left"
            title="Revenue ($)"
            position={Position.Left}
            tickFormat={(d: number) => `$${(d / 1_000_000).toFixed(1)}M`}
          />
          <BarSeries
            id="bars"
            displayValueSettings={{
              showValueLabel: true,
              overflowConstraints: [LabelOverflowConstraint.ChartEdges, LabelOverflowConstraint.BarGeometry],
            }}
            xScaleType={ScaleType.Ordinal}
            yScaleType={ScaleType.Linear}
            xAccessor="x"
            yAccessors={['y']}
            data={barData}
          />
        </Chart>
      </div>

      {anyFeaturesActive && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '13px',
          }}
        >
          <strong>Active features:</strong>{' '}
          {[
            ...(fontFeatureParts.length > 0 ? [`font-feature-settings: ${fontFeatureParts.join(', ')}`] : []),
            ...(fontVariantNumericParts.length > 0
              ? [`font-variant-numeric: ${fontVariantNumericParts.join(' ')}`]
              : []),
          ].join(' | ')}
          <div style={{ marginTop: '8px', fontSize: '20px', fontFamily }}>0123456789 · $1,234,567.89 · 100.00%</div>
        </div>
      )}

      <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
        Tests whether canvas text measurement respects rendered text when font variants (e.g. OpenType features) are
        applied via CSS inheritance. Text measurement should account for all computed font properties that affect
        rendered dimensions, ensuring text is neither clipped nor overlapping.
      </p>
    </div>
  );
};

Example.parameters = {
  resize: false,
};
