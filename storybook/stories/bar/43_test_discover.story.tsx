/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  HistogramBarSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const TEST_DATASET_DISCOVER = {
  xAxisLabel: 'timestamp per 30 seconds',
  yAxisLabel: 'Count',
  series: [
    {
      x: 1560438420000,
      y: 1,
    },
    {
      x: 1560438510000,
      y: 1,
    },
  ],
};

// for testing purposes only
export const Example: ChartsStory = (_, { title, description }) => {
  const formatter = timeFormatter(niceTimeFormatByDay(1));

  const xDomain = {
    min: NaN,
    max: NaN,
    minInterval: 30000,
  };

  const useCustomMinInterval = boolean('use custom minInterval of 30s', true);
  const multiLayerAxis = boolean('use multilayer time axis', false);
  return (
    <Chart title={title} description={description}>
      <Settings xDomain={useCustomMinInterval ? xDomain : undefined} baseTheme={useBaseTheme()} />
      <Axis id="discover-histogram-left-axis" position={Position.Left} title={TEST_DATASET_DISCOVER.yAxisLabel} />
      <Axis
        timeAxisLayerCount={multiLayerAxis ? 3 : 0}
        id="discover-histogram-bottom-axis"
        position={Position.Bottom}
        title={TEST_DATASET_DISCOVER.xAxisLabel}
        tickFormat={formatter}
      />

      <HistogramBarSeries
        id="discover-histogram"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={TEST_DATASET_DISCOVER.series}
        timeZone="local"
        name="Count"
      />
    </Chart>
  );
};
