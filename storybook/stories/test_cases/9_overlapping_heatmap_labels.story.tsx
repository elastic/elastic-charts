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

import { ECOMMERCE_DATA } from '../../../packages/charts/src/utils/data_samples/test_dataset_heatmap';
import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const heatmap: RecursivePartial<HeatmapStyle> = {
    xAxisLabel: {
      visible: boolean('xAxisLabel visible', true, 'Theme'),
      fontSize: number('xAxisLabel fontSize', 12, { range: true, min: 5, max: 20 }, 'Theme'),
      padding: number('xAxisLabel padding', 6, { range: true, min: 0, max: 15 }, 'Theme'),
      rotation: number('set rotation of x axis label', -45, { step: 1, min: -90, max: 0, range: true }, 'labels'),
      overflow: boolean('set overflow property for x axis labels', false, 'labels') ? 'ellipsis' : false,
      maxTextLength: parseFloat(text('set the max text length for the x axis labels', '20', 'labels')),
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
        debug
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
        data={ECOMMERCE_DATA}
        xAccessor={(d) => d[0]}
        yAccessor={(d) => d[1]}
        valueAccessor={(d) => d[2]}
        valueFormatter={(value) => (Number.isFinite(value) ? value.toFixed(0.2) : '')}
        xSortPredicate="alphaAsc"
      />
    </Chart>
  );
};
