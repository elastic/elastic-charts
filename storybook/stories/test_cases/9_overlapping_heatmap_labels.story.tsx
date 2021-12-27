/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, color, number, text } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, HeatmapStyle, RecursivePartial, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const heatmap: RecursivePartial<HeatmapStyle> = {
    brushArea: {
      visible: boolean('brushArea visible', true, 'Theme'),
      fill: color('brushArea fill', 'black', 'Theme'),
      stroke: color('brushArea stroke', '#69707D', 'Theme'),
      strokeWidth: number('brushArea strokeWidth', 2, { range: true, min: 1, max: 10 }, 'Theme'),
    },
    brushMask: {
      visible: boolean('brushMask visible', true, 'Theme'),
      fill: color('brushMask fill', 'rgb(115 115 115 / 50%)', 'Theme'),
    },
    brushTool: {
      visible: boolean('brushTool visible', false, 'Theme'),
      fill: color('brushTool fill color', 'gray', 'Theme'),
    },
    xAxisLabel: {
      visible: boolean('xAxisLabel visible', true, 'Theme'),
      fontSize: number('xAxisLabel fontSize', 12, { range: true, min: 5, max: 20 }, 'Theme'),
      textColor: color('xAxisLabel textColor', 'black', 'Theme'),
      padding: number('xAxisLabel padding', 6, { range: true, min: 0, max: 15 }, 'Theme'),
      rotation: number('set rotation of x axis label', 45, { step: 1, min: -90, max: 90, range: true }, 'labels'),
      alternate: boolean('set x axis labels to alternate', false, 'labels'),
      overflow: boolean('set overflow property for x axis labels', true, 'labels') ? 'ellipsis' : false,
      maxTextLength: parseFloat(text('set the max text length for the x axis labels', '20', 'labels')),
    },
    yAxisLabel: {
      visible: boolean('yAxisLabel visible', true, 'Theme'),
      fontSize: number('yAxisLabel fontSize', 12, { range: true, min: 5, max: 20 }, 'Theme'),
      textColor: color('yAxisLabel textColor', 'black', 'Theme'),
      padding: number('yAxisLabel padding', 5, { range: true, min: 0, max: 15 }, 'Theme'),
    },
    grid: {
      stroke: {
        color: color('grid stroke color', 'gray', 'Theme'),
      },
    },
    cell: {
      label: {
        visible: boolean('cell label visible', false, 'Theme'),
        textColor: color('cell label textColor', 'black', 'Theme'),
        useGlobalMinFontSize: boolean('cell label use global min fontSize', true, 'Theme'),
        minFontSize: number('cell label min fontSize', 6, { step: 1, min: 4, max: 10, range: true }, 'Theme'),
        maxFontSize: number('cell label max fontSize', 12, { step: 1, min: 10, max: 64, range: true }, 'Theme'),
      },
      border: {
        strokeWidth: number('border strokeWidth', 1, { range: true, min: 1, max: 5 }, 'Theme'),
        stroke: color('border stroke color', 'gray', 'Theme'),
      },
    },
  };
  return (
    <Chart>
      <Settings
        onElementClick={action('onElementClick')}
        showLegend
        legendPosition="right"
        brushAxis="both"
        theme={{ heatmap }}
        baseTheme={useBaseTheme()}
        onBrushEnd={action('onBrushEnd')}
      />
      <Heatmap
        id="heatmap2"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 1000, color: '#AADC32' },
            { start: 1000, end: 5000, color: '#35B779' },
            { start: 5000, end: 10000, color: '#24868E' },
            { start: 10000, end: 50000, color: '#3B528B' },
            { start: 50000, end: Infinity, color: '#471164' },
          ],
        }}
        data={[
          [1880, 'F', 'Helen Helen Helen Helen Helen', 636, 0.00651612638826278],
          [1880, 'F', 'Amanda Amanda Amanda Amanda Amanda', 241, 0.00246916109995492],
          [1880, 'F', 'Dorothy Dorothy Dorothy Dorothy Dorothy', 112, 0.00114749395516577],
          [1880, 'F', 'Linda Linda Linda Linda Linda Linda', 270, 0.000276628007048891],
          [1880, 'F', 'Deborah Deborah Deborah Deborah Deborah Deborah', 12, 0.000122945780910618],
          [1880, 'F', 'Jessica', 7, 7.17183721978607e-5],
          [1881, 'F', 'Helen', 612, 0.00619088564058469],
          [1881, 'F', 'Amanda Amanda Amanda Amanda Amanda', 263, 0.0026604622932578],
          [1881, 'F', 'Betty', 112, 0.00113297253553184],
          [1881, 'F', 'Dorothy Dorothy Dorothy Dorothy Dorothy', 109, 0.00110262505690152],
          [1881, 'F', 'Linda Linda Linda Linda Linda', 38, 0.000384401395984017],
          [1881, 'F', 'Deborah Deborah Deborah Deborah', 14, 0.00014162156694148],
        ]}
        xAccessor={(d) => d[2]}
        yAccessor={(d) => d[0]}
        valueAccessor={(d) => d[3]}
        valueFormatter={(value) => value.toFixed(0.2)}
        xSortPredicate="alphaAsc"
      />
    </Chart>
  );
};
