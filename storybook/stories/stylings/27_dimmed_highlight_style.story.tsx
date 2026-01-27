/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React, { useState, useCallback } from 'react';

import type { PartialTheme, SeriesIdentifier } from '@elastic/charts';
import {
  AreaSeries,
  Axis,
  BarSeries,
  Chart,
  LegendValue,
  LineSeries,
  Partition,
  PartitionLayout,
  Position,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { SEMANTIC_COLORS } from '@elastic/charts/src/utils/themes/base_colors';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { discreteColor, colorBrewerCategoricalPastel12 } from '../utils/utils';

// Helper to convert hex to RGB string for rgba()
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

// Light mode shades (lighter colors for dimming on light backgrounds)
// Ordered from lightest to darkest
const LIGHT_SHADES: Record<string, string> = {
  [`shade15 (${SEMANTIC_COLORS.shade15}) - default`]: hexToRgb(SEMANTIC_COLORS.shade15),
  [`shade20 (${SEMANTIC_COLORS.shade20})`]: hexToRgb(SEMANTIC_COLORS.shade20),
  [`shade30 (${SEMANTIC_COLORS.shade30})`]: hexToRgb(SEMANTIC_COLORS.shade30),
  [`shade60 (${SEMANTIC_COLORS.shade60})`]: hexToRgb(SEMANTIC_COLORS.shade60),
  [`shade70 (${SEMANTIC_COLORS.shade70})`]: hexToRgb(SEMANTIC_COLORS.shade70),
  [`shade80 (${SEMANTIC_COLORS.shade80})`]: hexToRgb(SEMANTIC_COLORS.shade80),
  [`shade90 (${SEMANTIC_COLORS.shade90})`]: hexToRgb(SEMANTIC_COLORS.shade90),
  [`shade95 (${SEMANTIC_COLORS.shade95})`]: hexToRgb(SEMANTIC_COLORS.shade95),
  [`shade100 (${SEMANTIC_COLORS.shade100})`]: hexToRgb(SEMANTIC_COLORS.shade100),
  [`shade110 (${SEMANTIC_COLORS.shade110})`]: hexToRgb(SEMANTIC_COLORS.shade110),
  [`shade120 (${SEMANTIC_COLORS.shade120})`]: hexToRgb(SEMANTIC_COLORS.shade120),
  [`shade130 (${SEMANTIC_COLORS.shade130})`]: hexToRgb(SEMANTIC_COLORS.shade130),
  [`shade140 (${SEMANTIC_COLORS.shade140})`]: hexToRgb(SEMANTIC_COLORS.shade140),
  [`shade145 (${SEMANTIC_COLORS.shade145})`]: hexToRgb(SEMANTIC_COLORS.shade145),
};

// Dark mode shades (for dimming on dark backgrounds)
// Ordered from lightest to darkest
const DARK_SHADES: Record<string, string> = {
  [`shade15 (${SEMANTIC_COLORS.shade15})`]: hexToRgb(SEMANTIC_COLORS.shade15),
  [`shade20 (${SEMANTIC_COLORS.shade20})`]: hexToRgb(SEMANTIC_COLORS.shade20),
  [`shade30 (${SEMANTIC_COLORS.shade30})`]: hexToRgb(SEMANTIC_COLORS.shade30),
  [`shade60 (${SEMANTIC_COLORS.shade60})`]: hexToRgb(SEMANTIC_COLORS.shade60),
  [`shade70 (${SEMANTIC_COLORS.shade70})`]: hexToRgb(SEMANTIC_COLORS.shade70),
  [`shade80 (${SEMANTIC_COLORS.shade80})`]: hexToRgb(SEMANTIC_COLORS.shade80),
  [`shade90 (${SEMANTIC_COLORS.shade90})`]: hexToRgb(SEMANTIC_COLORS.shade90),
  [`shade95 (${SEMANTIC_COLORS.shade95})`]: hexToRgb(SEMANTIC_COLORS.shade95),
  [`shade100 (${SEMANTIC_COLORS.shade100})`]: hexToRgb(SEMANTIC_COLORS.shade100),
  [`shade110 (${SEMANTIC_COLORS.shade110}) - default`]: hexToRgb(SEMANTIC_COLORS.shade110),
  [`shade120 (${SEMANTIC_COLORS.shade120})`]: hexToRgb(SEMANTIC_COLORS.shade120),
  [`shade130 (${SEMANTIC_COLORS.shade130})`]: hexToRgb(SEMANTIC_COLORS.shade130),
  [`shade140 (${SEMANTIC_COLORS.shade140})`]: hexToRgb(SEMANTIC_COLORS.shade140),
  [`shade145 (${SEMANTIC_COLORS.shade145})`]: hexToRgb(SEMANTIC_COLORS.shade145),
};

// Alpha/opacity options (ordered from most transparent to solid)
const ALPHA_OPTIONS: Record<string, number> = {
  '10%': 0.1,
  '15%': 0.15,
  '20%': 0.2,
  '25%': 0.25,
  '30%': 0.3,
  '35%': 0.35,
  '40%': 0.4,
  '45%': 0.45,
  '50%': 0.5,
  '55%': 0.55,
  '60%': 0.6,
  '65%': 0.65,
  '70%': 0.7,
  '75%': 0.75,
  '80%': 0.8,
  '85%': 0.85,
  '90%': 0.9,
  '95%': 0.95,
  '100% (solid) - default': 1.0,
};

// Multi-level sunburst data (source -> destination with values)
type SunburstDatum = [string, number, string, number];
const sunburstData: Array<SunburstDatum> = [
  ['CN', 301, 'IN', 44],
  ['CN', 301, 'US', 24],
  ['CN', 301, 'ID', 13],
  ['CN', 301, 'BR', 8],
  ['IN', 245, 'US', 22],
  ['IN', 245, 'BR', 11],
  ['IN', 245, 'ID', 10],
  ['US', 130, 'CN', 33],
  ['US', 130, 'IN', 23],
  ['US', 130, 'US', 9],
  ['US', 130, 'ID', 7],
  ['US', 130, 'BR', 5],
  ['ID', 55, 'BR', 4],
  ['ID', 55, 'US', 3],
  ['PK', 43, 'FR', 2],
  ['PK', 43, 'PK', 2],
];

export const Example: ChartsStory = (_, { title, description }) => {
  const baseTheme = useBaseTheme();
  const isDarkTheme = baseTheme.background.color !== '#FFFFFF';

  // Track currently hovered series for display
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const handleLegendItemOver = useCallback((series: SeriesIdentifier[]) => {
    const names = series.map((s) => s.key).join(', ');
    setHoveredSeries(names);
  }, []);

  const handleLegendItemOut = useCallback(() => {
    setHoveredSeries(null);
  }, []);

  const partitionLayout = select(
    'Partition layout',
    { Sunburst: PartitionLayout.sunburst, Treemap: PartitionLayout.treemap },
    PartitionLayout.sunburst,
  );

  // Shade selector based on theme
  const shadeOptions = isDarkTheme ? DARK_SHADES : LIGHT_SHADES;
  const defaultShadeKey = isDarkTheme
    ? `shade110 (${SEMANTIC_COLORS.shade110}) - default`
    : `shade15 (${SEMANTIC_COLORS.shade15}) - default`;
  const selectedShadeRGB = select('Shade color', shadeOptions, shadeOptions[defaultShadeKey] ?? '');

  // Alpha/opacity selector
  const selectedAlpha = select('Alpha (opacity)', ALPHA_OPTIONS, ALPHA_OPTIONS['100% (solid) - default'] ?? 1.0);

  // Build dimmed color from shade + alpha
  const selectedDimmedColor = `rgba(${selectedShadeRGB}, ${selectedAlpha})`;

  // Build theme with dimmed colors for all chart types
  const dimmedTheme: PartialTheme = {
    barSeriesStyle: {
      rect: {
        dimmed: {
          fill: selectedDimmedColor,
        },
      },
    },
    lineSeriesStyle: {
      line: {
        dimmed: {
          stroke: selectedDimmedColor,
        },
      },
      point: {
        dimmed: {
          fill: isDarkTheme ? '#0B1628' : '#FFFFFF', // background color
          stroke: selectedDimmedColor,
        },
      },
    },
    areaSeriesStyle: {
      area: {
        dimmed: {
          fill: selectedDimmedColor,
        },
      },
      line: {
        dimmed: {
          stroke: selectedDimmedColor,
        },
      },
      point: {
        dimmed: {
          fill: isDarkTheme ? '#0B1628' : '#FFFFFF',
          stroke: selectedDimmedColor,
        },
      },
    },
    arcSeriesStyle: {
      arc: {
        dimmed: {
          fill: selectedDimmedColor,
        },
      },
    },
  };

  const partitionLayoutLabel = partitionLayout === PartitionLayout.sunburst ? 'Sunburst' : 'Treemap';

  return (
    <>
      {/* Info panel showing current dimmed color and hover state */}
      <div
        style={{
          padding: '8px 12px',
          marginBottom: '8px',
          background: isDarkTheme ? '#1D2A3E' : '#F5F7FA',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: isDarkTheme ? '#8E9FBC' : '#5A6D8C' }}>Dimmed color:</span>
          <div
            style={{
              width: '24px',
              height: '24px',
              background: selectedDimmedColor,
              border: `1px solid ${isDarkTheme ? '#485975' : '#CAD3E2'}`,
              borderRadius: '4px',
            }}
          />
          <code style={{ color: isDarkTheme ? '#61A2FF' : '#1750BA' }}>{selectedDimmedColor}</code>
        </div>
        <div style={{ color: isDarkTheme ? '#8E9FBC' : '#5A6D8C' }}>
          {hoveredSeries ? (
            <>
              Hovering: <strong style={{ color: isDarkTheme ? '#FFFFFF' : '#07101F' }}>{hoveredSeries}</strong>
            </>
          ) : (
            'Hover over a legend item to see dimmed effect'
          )}
        </div>
      </div>

      {/* Partition Chart (top half) */}
      <Chart
        title={`Dimmed Highlight - ${partitionLayoutLabel}`}
        description={description}
        size={{ height: '50%' }}
        id="partition-chart"
      >
        <Settings
          showLegend
          legendValues={[LegendValue.CurrentAndLastValue]}
          legendPosition={Position.Right}
          baseTheme={baseTheme}
          theme={dimmedTheme}
          onLegendItemOver={handleLegendItemOver}
          onLegendItemOut={handleLegendItemOut}
        />
        <Partition
          id="partition"
          data={sunburstData}
          layout={partitionLayout}
          valueAccessor={(d) => d[3]}
          layers={[
            {
              groupByRollup: (d: SunburstDatum) => d[0],
              nodeLabel: (d) => `dest: ${d}`,
              shape: {
                fillColor: (key, sortIndex) => discreteColor(colorBrewerCategoricalPastel12, 0.7)(sortIndex),
              },
            },
            {
              groupByRollup: (d: SunburstDatum) => d[2],
              nodeLabel: (d) => `source: ${d}`,
              shape: {
                fillColor: (key, sortIndex, node) =>
                  discreteColor(colorBrewerCategoricalPastel12, 0.5)(node.parent.sortIndex),
              },
            },
          ]}
        />
      </Chart>

      {/* XY Chart (bottom half) */}
      <Chart
        title="Dimmed Highlight - Bar, Line, Area"
        description={description}
        size={{ height: '50%' }}
        id="xy-chart"
      >
        <Settings
          showLegend
          legendValues={[LegendValue.CurrentAndLastValue]}
          legendPosition={Position.Right}
          baseTheme={baseTheme}
          theme={dimmedTheme}
          onLegendItemOver={handleLegendItemOver}
          onLegendItemOut={handleLegendItemOut}
        />
        <Axis id="bottom" position={Position.Bottom} title="X axis" showOverlappingTicks />
        <Axis id="left" title="Y axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

        <BarSeries
          id="bars1"
          name="Bars 1"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 2.3 },
            { x: 1, y: 2 },
            { x: 2, y: 4 },
            { x: 3, y: 8 },
          ]}
        />
        <BarSeries
          id="bars2"
          name="Bars 2"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 3.5 },
            { x: 1, y: 4 },
            { x: 2, y: 5 },
            { x: 3, y: 6 },
          ]}
        />
        <BarSeries
          id="bars3"
          name="Bars 3"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 4 },
            { x: 1, y: 3 },
            { x: 2, y: 6 },
            { x: 3, y: 5 },
          ]}
        />
        <LineSeries
          id="line1"
          name="Line 1"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 2 },
            { x: 1, y: 7 },
            { x: 2, y: 3 },
            { x: 3, y: 6 },
          ]}
        />
        <LineSeries
          id="line2"
          name="Line 2"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 5 },
            { x: 1, y: 4 },
            { x: 2, y: 8 },
            { x: 3, y: 7 },
          ]}
        />
        <AreaSeries
          id="area"
          name="Area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 2.3 },
            { x: 1, y: 7.3 },
            { x: 2, y: 6 },
            { x: 3, y: 2 },
          ]}
        />
      </Chart>
    </>
  );
};

Example.parameters = {
  markdown: `
## Dimmed Highlight Style

This story demonstrates the **dimmed/unhighlighted** styling applied to chart elements when hovering over legend items.

### How to use
1. Hover over any legend item to see unhighlighted series adopt the dimmed color
2. Use **Shade color** to select the base shade from the EUI Borealis palette
3. Use **Alpha (opacity)** to adjust transparency (10% to 100%)
4. Switch between **light** and **dark** themes to see theme-appropriate shade options
5. Switch **Partition layout** between Sunburst and Treemap

### Default dim shades
- Light mode: \`shade15\` @ 100% (solid)
- Dark mode: \`shade110\` @ 100% (solid)

### Affected chart elements
- **Bar charts**: \`barSeriesStyle.rect.dimmed.fill\`
- **Line charts**: \`lineSeriesStyle.line.dimmed.stroke\`, \`lineSeriesStyle.point.dimmed.*\`
- **Area charts**: \`areaSeriesStyle.area.dimmed.fill\`, \`areaSeriesStyle.line.dimmed.stroke\`
- **Partition charts**: \`arcSeriesStyle.arc.dimmed.fill\`
  `,
};
