/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, Settings } from '@elastic/charts';
import { BABYNAME_DATA } from '@elastic/charts/src/utils/data_samples/babynames';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const data = boolean('filter dataset', true)
    ? BABYNAME_DATA.filter(([year]) => year > 1950 && year < 1960)
    : BABYNAME_DATA;
  const showLabels = boolean('show', true, 'labels');
  const useGlobalMinFontSize = boolean('use global min fontSize', true, 'labels');

  const minFontSize = number('min fontSize', 6, { step: 1, min: 4, max: 10, range: true }, 'labels');
  const maxFontSize = number('max fontSize', 12, { step: 1, min: 10, max: 64, range: true }, 'labels');

  const showXAxisTitle = boolean('Show x axis title', true);
  const showYAxisTitle = boolean('Show y axis title', true);

  return (
    <Chart title={title} description={description} size={['100%', 320]}>
      <Settings
        onElementClick={action('onElementClick')}
        showLegend
        legendPosition="right"
        brushAxis="both"
        baseTheme={useBaseTheme()}
        theme={{
          heatmap: {
            grid: {
              stroke: {
                width: 0,
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
          },
        }}
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
        data={data}
        xAccessor={(d) => d[2]}
        yAccessor={(d) => d[0]}
        valueAccessor={(d) => d[3]}
        valueFormatter={(value) => value.toFixed(0.2)}
        xSortPredicate="alphaAsc"
        xAxisTitle={showXAxisTitle ? 'Popular baby names' : undefined}
        yAxisTitle={showYAxisTitle ? 'Years' : undefined}
      />
    </Chart>
  );
};
