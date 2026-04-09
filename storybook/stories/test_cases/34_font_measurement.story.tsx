/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
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
import { applyOptionalNumericFontFamily, withOptionalNumericFontFamily } from '../utils/elastic_ui_numeric_font';

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

const barData = [
  { x: '2020', y: 1234567, g: 'Product Alpha - $1,234,567' },
  { x: '2021', y: 2345678, g: 'Product Alpha - $1,234,567' },
  { x: '2022', y: 3456789, g: 'Product Alpha - $1,234,567' },
  { x: '2023', y: 4567890, g: 'Product Alpha - $1,234,567' },
  { x: '2024', y: 5678901, g: 'Product Alpha - $1,234,567' },
  { x: '2020', y: 987654, g: 'Product Beta - $987,654' },
  { x: '2021', y: 1876543, g: 'Product Beta - $987,654' },
  { x: '2022', y: 2765432, g: 'Product Beta - $987,654' },
  { x: '2023', y: 3654321, g: 'Product Beta - $987,654' },
  { x: '2024', y: 4543210, g: 'Product Beta - $987,654' },
  { x: '2020', y: 567890, g: 'Product Gamma - $567,890' },
  { x: '2021', y: 1456789, g: 'Product Gamma - $567,890' },
  { x: '2022', y: 2345678, g: 'Product Gamma - $567,890' },
  { x: '2023', y: 3234567, g: 'Product Gamma - $567,890' },
  { x: '2024', y: 4123456, g: 'Product Gamma - $567,890' },
];

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

const heatmapData = (() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const categories = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  return categories.flatMap((category, categoryIndex) =>
    months.map((month, monthIndex) => ({
      x: month,
      y: category,
      value: 12000 + categoryIndex * 9000 + monthIndex * 3700 + ((categoryIndex + monthIndex) % 3) * 850,
    })),
  );
})();

export const Example: ChartsStory = (_, { description }) => {
  const baseTheme = useBaseTheme();
  const fontFamily = select(
    'Font: family',
    { Inter: 'Inter', Arial: 'Arial', 'Times New Roman': 'Times New Roman', Courier: 'Courier' },
    'Inter',
  );
  const fontSize = number('Font: size (px)', 14, { range: true, min: 8, max: 48, step: 1 });
  const useElasticUINumericFont = boolean('Font: use "Elastic UI Numeric"', true);
  const letterSpacing = number('Typography: letter-spacing (px)', 0, { range: true, min: -2, max: 5, step: 0.5 });
  const fontKerning = select('Typography: font-kerning', { auto: 'auto', normal: 'normal', none: 'none' }, 'auto');
  const previewFontFamily = withOptionalNumericFontFamily(fontFamily, useElasticUINumericFont);

  const containerStyle: React.CSSProperties = {
    fontFamily: previewFontFamily,
    ...(letterSpacing !== 0 ? { letterSpacing: `${letterSpacing}px` } : {}),
    ...(fontKerning !== 'auto' ? { fontKerning } : {}),
  };

  const theme: PartialTheme = {
    barSeriesStyle: {
      displayValue: {
        fontSize: fontSize + 2,
        fontFamily,
      },
    },
    axes: {
      tickLabel: {
        fontSize,
        fontFamily,
      },
    },
    partition: {
      fillLabel: {
        fontFamily,
        valueFont: {
          fontFamily,
        },
      },
    },
    heatmap: {
      xAxisLabel: {
        fontFamily,
      },
      yAxisLabel: {
        fontFamily,
        width: 'auto',
        padding: { left: 8, right: 8 },
      },
      cell: {
        maxWidth: 'fill',
        label: {
          visible: true,
          minFontSize: 8,
          maxFontSize: 14,
          useGlobalMinFontSize: true,
          fontFamily,
        },
        border: { stroke: 'white', strokeWidth: 1 },
      },
    },
  };
  applyOptionalNumericFontFamily(theme, useElasticUINumericFont);

  const resizableChart = (height: number): React.CSSProperties => ({
    width: 600,
    height,
    resize: 'both',
    overflow: 'hidden',
    border: '1px solid #d3dae6',
    borderRadius: '4px',
  });

  const sectionTitle: React.CSSProperties = {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', ...containerStyle }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#69707d' }}>{description}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={sectionTitle}>Metric</p>
        <div style={resizableChart(150)}>
          <Chart>
            <Settings baseTheme={baseTheme} theme={theme} />
            <Metric id="metric1" data={metricData} />
          </Chart>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={sectionTitle}>Bar chart with legend and display values</p>
        <div style={resizableChart(300)}>
          <Chart>
            <Settings theme={theme} baseTheme={baseTheme} showLegend legendPosition="right" />
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
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={sectionTitle}>Treemap</p>
        <div style={resizableChart(350)}>
          <Chart>
            <Settings baseTheme={baseTheme} theme={theme} />
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
                    valueFormatter: (d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000))}\u00A0K`,
                  },
                  shape: { fillColor: (key: string) => regionColors[key] ?? '#888' },
                },
                {
                  groupByRollup: (d: Datum) => d.product,
                  nodeLabel: (d: Datum) => String(d),
                  fillLabel: {
                    valueFormatter: (d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000))}\u00A0K`,
                  },
                  shape: {
                    fillColor: (key: string, _shapeDepth: number, _node: unknown, tree) => {
                      const parent = tree.length > 1 ? tree[tree.length - 2] : undefined;
                      const parentKey = Array.isArray(parent) ? String(parent[0]) : '';
                      return regionColors[parentKey] ?? '#aaa';
                    },
                  },
                },
              ]}
            />
          </Chart>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={sectionTitle}>Heatmap</p>
        <div style={resizableChart(300)}>
          <Chart>
            <Settings baseTheme={baseTheme} theme={theme} showLegend legendPosition="right" />
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
      </div>
    </div>
  );
};

Example.parameters = {
  resize: false,
};
