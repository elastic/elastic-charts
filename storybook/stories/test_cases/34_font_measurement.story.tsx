/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, number, boolean } from '@storybook/addon-knobs';
import React from 'react';

import type { Datum, PartialTheme } from '@elastic/charts';
import {
  Axis,
  BarSeries,
  Chart,
  Heatmap,
  LabelOverflowConstraint,
  Metric,
  Partition,
  PartitionLayout,
  Position,
  ScaleType,
  Settings,
  defaultPartitionValueFormatter,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// ── Metric data ──────────────────────────────────────────────────────────────

const metricData = [
  [
    {
      color: '#3c3c3c',
      title: 'Revenue 2025',
      subtitle: 'Total Annual Revenue',
      value: 5678901.23,
      valueFormatter: (v: number) => `$${v.toFixed(2)}`,
    },
  ],
];

// ── Bar data (with legend) ───────────────────────────────────────────────────

const barData = [
  { x: '2020', y: 1234567, g: 'Product Alpha — $1,234,567' },
  { x: '2021', y: 2345678, g: 'Product Alpha — $1,234,567' },
  { x: '2022', y: 3456789, g: 'Product Alpha — $1,234,567' },
  { x: '2023', y: 4567890, g: 'Product Alpha — $1,234,567' },
  { x: '2024', y: 5678901, g: 'Product Alpha — $1,234,567' },
  { x: '2020', y: 987654, g: 'Product Beta — $987,654' },
  { x: '2021', y: 1876543, g: 'Product Beta — $987,654' },
  { x: '2022', y: 2765432, g: 'Product Beta — $987,654' },
  { x: '2023', y: 3654321, g: 'Product Beta — $987,654' },
  { x: '2024', y: 4543210, g: 'Product Beta — $987,654' },
  { x: '2020', y: 567890, g: 'Product Gamma — $567,890' },
  { x: '2021', y: 1456789, g: 'Product Gamma — $567,890' },
  { x: '2022', y: 2345678, g: 'Product Gamma — $567,890' },
  { x: '2023', y: 3234567, g: 'Product Gamma — $567,890' },
  { x: '2024', y: 4123456, g: 'Product Gamma — $567,890' },
];

// ── Treemap data ──────────────────────────────────────────────────────────────

const treemapData = [
  { region: 'North America', product: 'Electronics', revenue: 4500000 },
  { region: 'North America', product: 'Clothing', revenue: 2300000 },
  { region: 'Europe', product: 'Electronics', revenue: 3800000 },
  { region: 'Europe', product: 'Clothing', revenue: 1900000 },
  { region: 'Europe', product: 'Food', revenue: 2700000 },
  { region: 'Asia Pacific', product: 'Electronics', revenue: 5200000 },
  { region: 'Asia Pacific', product: 'Clothing', revenue: 3100000 },
  { region: 'Asia Pacific', product: 'Food', revenue: 1600000 },
  { region: 'Latin America', product: 'Electronics', revenue: 1800000 },
  { region: 'Latin America', product: 'Clothing', revenue: 900000 },
];

const regionColors: Record<string, string> = {
  'North America': '#3B528B',
  Europe: '#24868E',
  'Asia Pacific': '#35B779',
  'Latin America': '#AADC32',
};

// ── Heatmap data ──────────────────────────────────────────────────────────────

const heatmapData = (() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const categories = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  const data: Array<{ x: string; y: string; value: number }> = [];
  for (const cat of categories) {
    for (const month of months) {
      data.push({ x: month, y: cat, value: Math.round(Math.random() * 90000 + 10000) });
    }
  }
  return data;
})();

// ── Story ─────────────────────────────────────────────────────────────────────

export const Example: ChartsStory = (_, { title, description }) => {
  const fontFamily = select(
    'Font: family',
    { Inter: 'Inter', Arial: 'Arial', 'Times New Roman': 'Times New Roman', Courier: 'Courier' },
    'Inter',
  );
  const fontSize = number('Font: size (px)', 14, { range: true, min: 8, max: 48, step: 1 });

  // font-feature-settings
  const tnum = boolean("font-feature-settings: 'tnum' — tabular digits", true);
  const zero = boolean("font-feature-settings: 'zero' — slashed zero", true);
  const ss01 = boolean("font-feature-settings: 'ss01' — open digits", true);
  const ss07 = boolean("font-feature-settings: 'ss07' — squared punctuation", true);

  // font-variant-numeric
  const tabularNums = boolean('font-variant-numeric: tabular-nums', true);
  const slashedZero = boolean('font-variant-numeric: slashed-zero', true);

  // letter-spacing & font-kerning
  const letterSpacing = number('letter-spacing (px)', 0, { range: true, min: -2, max: 5, step: 0.5 });
  const fontKerning = select('font-kerning', { auto: 'auto', normal: 'normal', none: 'none' }, 'auto');

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
    ...(letterSpacing !== 0 ? { letterSpacing: `${letterSpacing}px` } : {}),
    ...(fontKerning !== 'auto' ? { fontKerning } : {}),
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
        fill: '#333',
      },
    },
  };

  const anyFeaturesActive =
    fontFeatureParts.length > 0 || fontVariantNumericParts.length > 0 || letterSpacing !== 0 || fontKerning !== 'auto';

  const sectionTitle: React.CSSProperties = {
    margin: '0 0 4px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#555',
    fontFamily: 'system-ui, sans-serif',
  };

  const sectionNote: React.CSSProperties = {
    margin: '4px 0 0 0',
    fontSize: '11px',
    color: '#999',
    fontFamily: 'system-ui, sans-serif',
  };

  const resizableChart = (height: number): React.CSSProperties => ({
    width: 600,
    height,
    resize: 'both',
    overflow: 'hidden',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', ...containerStyle }}>
      {/* Active features banner */}
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
            ...(letterSpacing !== 0 ? [`letter-spacing: ${letterSpacing}px`] : []),
            ...(fontKerning !== 'auto' ? [`font-kerning: ${fontKerning}`] : []),
          ].join(' | ')}
          <div style={{ marginTop: '8px', fontSize: '20px', fontFamily }}>0123456789 · $1,234,567.89 · 100.00%</div>
        </div>
      )}

      {/* ── 1. Metric Chart ── */}
      <div>
        <p style={sectionTitle}>1. Metric Chart — responsive font sizing (DOM text, canvas measurement)</p>
        <div style={resizableChart(150)}>
          <Chart title={title} description={description}>
            <Settings baseTheme={useBaseTheme()} />
            <Metric id="metric1" data={metricData} />
          </Chart>
        </div>
        <p style={sectionNote}>
          Measurement drives font-size selection. If <code>measureText()</code> underestimates width, the chosen font
          size is too large and the value text clips or overflows.
        </p>
      </div>

      {/* ── 2. Bar Chart + Legend ── */}
      <div>
        <p style={sectionTitle}>
          2. Bar Chart — axis ticks, display values &amp; legend (DOM legend text, canvas measurement)
        </p>
        <div style={resizableChart(300)}>
          <Chart>
            <Settings theme={theme} baseTheme={useBaseTheme()} showLegend legendPosition="right" />
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
                valueFormatter: (d: number) => `$${(d / 1_000_000).toFixed(2)}M`,
                overflowConstraints: [LabelOverflowConstraint.ChartEdges, LabelOverflowConstraint.BarGeometry],
              }}
              xScaleType={ScaleType.Ordinal}
              yScaleType={ScaleType.Linear}
              xAccessor="x"
              yAccessors={['y']}
              splitSeriesAccessors={['g']}
              stackAccessors={['x']}
              data={barData}
            />
          </Chart>
        </div>
        <p style={sectionNote}>
          Axis space is computed from the widest tick label. Legend width is sized by canvas measurement but rendered as
          DOM text. Underestimated widths → axis labels overlap, legend labels truncate prematurely.
        </p>
      </div>

      {/* ── 3. Treemap ── */}
      <div>
        <p style={sectionTitle}>3. Treemap — labels fitted inside cells (canvas text, canvas measurement)</p>
        <div style={resizableChart(350)}>
          <Chart>
            <Settings
              baseTheme={useBaseTheme()}
              theme={{
                partition: {
                  fillLabel: { fontFamily, valueFont: { fontFamily } },
                },
              }}
            />
            <Partition
              id="treemap"
              data={treemapData}
              layout={PartitionLayout.treemap}
              valueAccessor={(d: Datum) => d.revenue as number}
              valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000))}\u00A0K`}
              layers={[
                {
                  groupByRollup: (d: Datum) => d.region,
                  nodeLabel: (d: Datum) => String(d),
                  fillLabel: {
                    valueFormatter: (d: number) =>
                      `$${defaultPartitionValueFormatter(Math.round(d / 1000))}\u00A0K`,
                  },
                  shape: { fillColor: (key: string) => regionColors[key] ?? '#888' },
                },
                {
                  groupByRollup: (d: Datum) => d.product,
                  nodeLabel: (d: Datum) => String(d),
                  fillLabel: {
                    valueFormatter: (d: number) =>
                      `$${defaultPartitionValueFormatter(Math.round(d / 1000))}\u00A0K`,
                  },
                  shape: {
                    fillColor: (key: string, _s: number, _n: unknown, tree: any[]) => {
                      const parent = tree.length > 1 ? tree[tree.length - 2] : undefined;
                      return regionColors[parent?.[0]] ?? '#aaa';
                    },
                  },
                },
              ]}
            />
          </Chart>
        </div>
        <p style={sectionNote}>
          Labels and values are fitted inside treemap cells using <code>measureText()</code>. Underestimated width →
          font size too large → labels overflow cell boundaries or overlap adjacent cells.
        </p>
      </div>

      {/* ── 4. Heatmap ── */}
      <div>
        <p style={sectionTitle}>4. Heatmap — cell value labels &amp; axis sizing (canvas text, canvas measurement)</p>
        <div style={resizableChart(300)}>
          <Chart>
            <Settings
              baseTheme={useBaseTheme()}
              showLegend
              legendPosition="right"
              theme={{
                heatmap: {
                  cell: {
                    maxWidth: 'fill',
                    label: {
                      visible: true,
                      minFontSize: 8,
                      maxFontSize: 14,
                      useGlobalMinFontSize: true,
                    },
                    border: { stroke: 'white', strokeWidth: 1 },
                  },
                  yAxisLabel: { visible: true, width: 'auto', padding: { left: 8, right: 8 } },
                },
              }}
            />
            <Heatmap
              id="heatmap"
              colorScale={{
                type: 'bands',
                bands: [
                  { start: -Infinity, end: 20000, color: '#AADC32' },
                  { start: 20000, end: 40000, color: '#35B779' },
                  { start: 40000, end: 60000, color: '#24868E' },
                  { start: 60000, end: 80000, color: '#3B528B' },
                  { start: 80000, end: Infinity, color: '#471164' },
                ],
              }}
              data={heatmapData}
              xAccessor="x"
              yAccessor="y"
              valueAccessor="value"
              valueFormatter={(d) => d.toLocaleString()}
              xSortPredicate="dataIndex"
            />
          </Chart>
        </div>
        <p style={sectionNote}>
          Cell labels use <code>maximiseFontSize()</code> to find the largest font that fits. Y-axis width is computed
          from the widest label. Both rely on <code>measureText()</code> — wrong measurement causes cell overflow and
          axis label overlap.
        </p>
      </div>

      {/* ── Description ── */}
      <div
        style={{
          padding: '12px 16px',
          background: '#f0f4ff',
          border: '1px solid #b8c9e8',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#444',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.6,
        }}
      >
        <strong>What this story demonstrates</strong>
        <p style={{ margin: '8px 0 0' }}>
          All charts above use canvas-based <code>measureText()</code> for layout calculations. The current
          implementation uses an off-screen canvas (<code>document.createElement(&apos;canvas&apos;)</code>) that is
          detached from the DOM tree and therefore <strong>cannot inherit CSS font properties</strong> like{' '}
          <code>font-feature-settings</code>, <code>font-variant-numeric</code>, or <code>letter-spacing</code> from
          parent elements.
        </p>
        <p style={{ margin: '8px 0 0' }}>
          When these OpenType features are active (as in Kibana/Lens), digits become wider (tabular) or change shape
          (slashed zero), but <code>measureText()</code> still reports the <em>non-featured</em> width. This causes:
        </p>
        <ul style={{ margin: '4px 0 0', paddingLeft: '20px' }}>
          <li>
            <strong>Metric:</strong> Responsive font size is too large → value text clips
          </li>
          <li>
            <strong>Bar/XY axes:</strong> Axis space is too narrow → tick labels overlap or vanish
          </li>
          <li>
            <strong>Legend:</strong> DOM-rendered labels sized by canvas measurement → premature truncation
          </li>
          <li>
            <strong>Treemap:</strong> Labels sized as if they fit → overflow cell boundaries
          </li>
          <li>
            <strong>Heatmap:</strong> Cell labels and axis widths are underestimated → clipping and overlap
          </li>
        </ul>
        <p style={{ margin: '8px 0 0' }}>
          <strong>DOM ↔ Canvas mismatch:</strong> Metric, Bullet graph (metric mode), and Legend render text as DOM
          elements but compute layout using canvas <code>measureText()</code>. This is the most impactful scenario: the
          DOM text fully inherits CSS properties like <code>letter-spacing</code> and{' '}
          <code>font-feature-settings</code>, but the measurement does not — so the layout is computed for a narrower
          string than what actually renders.
        </p>
        <p style={{ margin: '8px 0 0' }}>
          <strong>Root cause:</strong> The Canvas 2D <code>ctx.font</code> property only accepts CSS{' '}
          <code>font</code> shorthand syntax, which does not include <code>font-feature-settings</code> (
          <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/font">MDN</a>). The{' '}
          <code>CanvasTextDrawingStyles</code> interface has no <code>fontFeatureSettings</code> attribute (
          <a href="https://html.spec.whatwg.org/multipage/canvas.html#canvastextdrawingstyles">WHATWG</a>). The only
          way for <code>measureText()</code> to account for these properties is through CSS inheritance, which requires
          the canvas to be <strong>in the DOM tree</strong>.
        </p>
        <p style={{ margin: '8px 0 0' }}>
          <strong>Try it:</strong> Toggle the font feature knobs and resize the story panel to see measurement
          mismatches. Compare Chrome vs Firefox — Firefox may not inherit <code>font-feature-settings</code> into
          canvas even when in-DOM.
        </p>
      </div>
    </div>
  );
};

Example.parameters = {
  resize: false,
};
