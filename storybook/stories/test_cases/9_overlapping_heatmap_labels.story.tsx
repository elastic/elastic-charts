/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number, text } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const showLabels = boolean('show', true, 'labels');
  const useGlobalMinFontSize = boolean('use global min fontSize', true, 'labels');

  const minFontSize = number('min fontSize', 6, { step: 1, min: 4, max: 10, range: true }, 'labels');
  const maxFontSize = number('max fontSize', 12, { step: 1, min: 10, max: 64, range: true }, 'labels');

  const minCellHeight = number('min cell height', 10, { step: 1, min: 3, max: 8, range: true }, 'grid');
  const maxCellHeight = number('max cell height', 30, { step: 1, min: 8, max: 45, range: true }, 'grid');

  const setRotation = number('set rotation of x axis label', 45, { step: 1, min: 0, max: 359, range: true }, 'labels');
  const allowOverflow = boolean('set overflow property for x axis labels', true, 'labels');
  const maxTextLength = text('set the max text length for the x axis labels', '20', 'labels');
  const shouldAlternate = boolean('set x axis labels to alternate', false, 'labels');
  return (
    <Chart>
      <Settings
        onElementClick={action('onElementClick')}
        showLegend
        legendPosition="right"
        brushAxis="both"
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
        config={{
          grid: {
            stroke: {
              width: 0,
            },
            cellHeight: {
              min: minCellHeight,
              max: maxCellHeight,
            },
          },
          cell: {
            maxWidth: 'fill',
            label: {
              minFontSize,
              maxFontSize,
              visible: showLabels,
              useGlobalMinFontSize,
            },
            border: {
              stroke: 'transparent',
              strokeWidth: 1,
            },
          },
          yAxisLabel: {
            visible: true,
          },
          xAxisLabel: {
            visible: true,
            rotation: setRotation,
            overflow: allowOverflow ? 'ellipsis' : false,
            maxTextLength: {
              max: parseFloat(maxTextLength),
            },
            alternate: shouldAlternate,
          },
        }}
      />
    </Chart>
  );
};
