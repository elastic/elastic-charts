/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { select, text } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, ScaleType, Settings } from '../../packages/charts/src';
import { BABYNAME_DATA } from '../../packages/charts/src/utils/data_samples/babynames';

export const Example = () => {
  const data = BABYNAME_DATA.filter(([year]) => year > 1950 && year < 1960);
  const colorScale = select(
    'color scale',
    {
      [ScaleType.Linear]: ScaleType.Linear,
      [ScaleType.Quantile]: ScaleType.Quantile,
      [ScaleType.Quantize]: ScaleType.Quantize,
      [ScaleType.Threshold]: ScaleType.Threshold,
    },
    ScaleType.Linear,
  );
  const ranges = text('ranges', 'auto');
  const colors = text('colors', 'green, yellow, red');

  return (
    <Chart className="story-chart">
      <Settings onElementClick={action('onElementClick')} showLegend legendPosition="right" brushAxis="both" />
      <Heatmap
        id="heatmap2"
        colorScale={colorScale}
        ranges={ranges === 'auto' ? undefined : ranges.split(',').map((d) => Number(d.trim()))}
        colors={colors.split(',').map((d) => d.trim())}
        data={data}
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
          },
          cell: {
            maxWidth: 'fill',
            maxHeight: 20,
            label: {
              visible: true,
            },
            border: {
              stroke: 'white',
              strokeWidth: 1,
            },
          },
          yAxisLabel: {
            visible: true,
          },
          onBrushEnd: action('onBrushEnd'),
        }}
      />
    </Chart>
  );
};
