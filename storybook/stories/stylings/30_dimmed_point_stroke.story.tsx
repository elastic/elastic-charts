/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const data = [
  { x: 0, y: 2, series: 'First' },
  { x: 1, y: 5, series: 'First' },
  { x: 2, y: 3, series: 'First' },
  { x: 0, y: 6, series: 'Second' },
  { x: 1, y: 8, series: 'Second' },
  { x: 2, y: 7, series: 'Second' },
];

export const Example: ChartsStory = (_, { title, description }) => {
  const chartType = select('Chart type', { Line: 'line', Area: 'area' }, 'line');
  const Series = chartType === 'line' ? LineSeries : AreaSeries;
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
        theme={{
          lineSeriesStyle: { point: { visible: 'always' } },
          areaSeriesStyle: { point: { visible: 'always' } },
        }}
      />
      <Axis id="x" position={Position.Bottom} />
      <Axis id="y" position={Position.Left} />
      <Series
        id="values"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['series']}
        data={data}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'Hover either legend item. Dimmed point outlines use the same color as their connecting lines, while keeping their opaque fills. Compare line and area charts in light and dark themes.',
};
