/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { extent } from 'd3-array';
import React from 'react';

import { Chart, Heatmap, ScaleType, Settings } from '@elastic/charts';
import { BABYNAME_DATA } from '@elastic/charts/src/utils/data_samples/babynames';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const data = BABYNAME_DATA.filter(([year]) => year > 1950);
  const values = data.map((d) => +d[3]);
  const [min, max] = extent(values);
  return (
    <Chart>
      <Settings
        onElementClick={action('onElementClick')}
        showLegend
        legendPosition="right"
        brushAxis="both"
        baseTheme={useBaseTheme()}
      />
      <Heatmap
        id="heatmap2"
        colorScale={ScaleType.Linear}
        ranges={[min!, (max! - min!) / 2, max!]}
        colors={['green', 'yellow', 'red']}
        data={BABYNAME_DATA.filter(([year]) => year > 1950)}
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
