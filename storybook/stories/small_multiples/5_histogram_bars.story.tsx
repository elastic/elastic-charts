/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { ScaleType, Position, Chart, Axis, GroupBy, SmallMultiples, Settings, BarSeries } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const data = [
  { x: 30, split: 'Cloudy', y: 9 },
  { x: 45, split: 'Sunny', y: 8 },
  { x: 60, split: 'Rain', y: 5 },
  { x: 75, split: 'Sunny', y: 7 },
  { x: 90, split: 'Rain', y: 6 },
  { x: 105, split: 'Rain', y: 7 },
  { x: 120, split: 'Clear', y: 7 },
  { x: 135, split: 'Cloudy', y: 8 },
  { x: 150, split: 'Cloudy', y: 8 },
  { x: 165, split: 'Rain', y: 8 },
  { x: 180, split: 'Rain', y: 10 },
  { x: 195, split: 'Rain', y: 10 },
  { x: 210, split: 'Sunny', y: 9 },
  { x: 225, split: 'Rain', y: 10 },
  { x: 240, split: 'Clear', y: 12 },
  { x: 255, split: 'Cloudy', y: 9 },
  { x: 270, split: 'Clear', y: 12 },
  { x: 285, split: 'Cloudy', y: 5 },
  { x: 300, split: 'Rain', y: 7 },
  { x: 315, split: 'Sunny', y: 8 },
  { x: 330, split: 'Cloudy', y: 8 },
  { x: 345, split: 'Sunny', y: 8 },
  { x: 360, split: 'Sunny', y: 10 },
];
const numberOptions = {
  min: 0,
  max: 1,
  step: 0.05,
};
const colorMap: Record<string, string> = {
  Rain: 'blue',
  Sunny: 'orange',
  Cloudy: 'gray',
  Clear: 'lightblue',
  Default: 'red',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const enableHistogramMode = boolean('EnableHistogramMode', true);
  const barsPadding = number('barsPadding', 0, numberOptions);
  const histogramPadding = number('histogramPadding', 0, numberOptions);

  return (
    <Chart title={title} description={description}>
      <Settings theme={{ scales: { barsPadding, histogramPadding } }} showLegend baseTheme={useBaseTheme()} />
      <Axis id="x" position={Position.Bottom} />
      <Axis
        id="y"
        title="Humidity %"
        position={Position.Left}
        labelFormat={(label) => {
          return `${label} %`;
        }}
      />

      <GroupBy id="splitId" by={(_, datum) => datum.split} sort="dataIndex" />
      <SmallMultiples splitHorizontally="splitId" />

      <BarSeries
        id="bars"
        enableHistogramMode={enableHistogramMode}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={data}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['split']}
        color={(seriesIdentifier) => {
          return colorMap[seriesIdentifier.splitAccessors.get('split') ?? 'Default'];
        }}
      />
    </Chart>
  );
};
