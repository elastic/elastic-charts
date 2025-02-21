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

import type { HeatmapStyle, RecursivePartial } from '@elastic/charts';
import { Chart, Heatmap, Settings } from '@elastic/charts';

import { ScaleType } from '../../../packages/charts/src/scales/constants';
import { DATA_1, ECOMMERCE_DATA } from '../../../packages/charts/src/utils/data_samples/test_dataset_heatmap';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const yAxisAutoWidth = boolean('Y-axis auto width', true);
  const yAxisWidth = number('Y-axis width', 50, { range: true, min: 0, max: 100 });
  const heatmap: RecursivePartial<HeatmapStyle> = {
    xAxisLabel: {
      visible: boolean('X-Axis visible', true),
      fontSize: number('X-Axis label fontSize', 12, { range: true, min: 5, max: 20 }),
      padding: number('X-Axis label padding', 6, { range: true, min: 0, max: 15 }),
      rotation: number('X-Axis label rotation', 0, { step: 1, min: 0, max: 90, range: true }),
    },
    yAxisLabel: {
      width: yAxisAutoWidth ? 'auto' : yAxisWidth,
    },
  };
  const useCategoricalDataset = boolean('Use categorical data', false);
  const dataset = useCategoricalDataset ? ECOMMERCE_DATA : DATA_1.data;
  const debugState = boolean('Enable debug state', true);

  return (
    <Chart title={title} description={description}>
      <Settings
        onElementClick={action('onElementClick')}
        showLegend={boolean('Show legend', false)}
        legendPosition="right"
        brushAxis="both"
        theme={{ heatmap }}
        baseTheme={useBaseTheme()}
        debugState={debugState}
      />
      <Heatmap<{ x: number | string; y: string; value: number }>
        id="heatmap2"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 100, color: '#AADC32' },
            { start: 100, end: 200, color: '#35B779' },
            { start: 200, end: 300, color: '#24868E' },
            { start: 300, end: 400, color: '#3B528B' },
            { start: 400, end: Infinity, color: '#471164' },
          ],
        }}
        xScale={
          useCategoricalDataset
            ? {
                type: ScaleType.Ordinal,
              }
            : {
                type: ScaleType.Time,
                interval: DATA_1.interval,
              }
        }
        data={dataset}
        timeZone={DATA_1.timeZone}
        xAxisLabelFormatter={useCategoricalDataset ? (d) => `${d}` : DATA_1.xFormatter}
        xAccessor={(d) => d.x}
        yAccessor={(d) => d.y}
        valueAccessor={(d) => d.value}
        valueFormatter={(value) => (Number.isFinite(value) ? value.toFixed(0.2) : '')}
        xSortPredicate="dataIndex"
      />
    </Chart>
  );
};
