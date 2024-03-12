/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { color } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  SeriesColorAccessor,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  LegendValue,
} from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const barColor = color('barSeriesColor', '#000');
  const barSeriesColorAccessor: SeriesColorAccessor = ({ specId, yAccessor, splitAccessors }) => {
    if (
      specId === 'bars' &&
      yAccessor === 'y1' &&
      splitAccessors.get('g1') === 'cloudflare.com' &&
      splitAccessors.get('g2') === 'direct-cdn'
    ) {
      return barColor;
    }
    return null;
  };

  const lineColor = color('linelineSeriesColor', '#ff0');
  const lineSeriesColorAccessor: SeriesColorAccessor = ({ specId, yAccessor, splitAccessors }) => {
    if (specId === 'lines' && yAccessor === 'y' && splitAccessors.size === 0) {
      return lineColor;
    }
    return null;
  };

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.LastValue]}
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g1', 'g2']}
        color={barSeriesColorAccessor}
        data={TestDatasets.BARCHART_2Y2G}
      />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        color={lineSeriesColorAccessor}
        data={[
          { x: 0, y: 3 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 10 },
        ]}
      />
    </Chart>
  );
};
