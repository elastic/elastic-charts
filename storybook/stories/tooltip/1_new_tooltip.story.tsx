/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Settings, Axis, Position, DataGenerator } from '@elastic/charts';

import { SeriesType } from '../../../e2e/constants';
import { BarSeries } from '../../../packages/charts/src/chart_types/specs';
import { ScaleType } from '../../../packages/charts/src/scales/constants';
import { getXYSeriesKnob } from '../utils/knobs';

const dg = new DataGenerator();
const PREFIX = 'Example ';

const data = dg.generateGroupedSeries(100, 50, PREFIX);
/**
 * Should render no data value
 */
export const Example = () => {
  const barsPadding = number('bar paddings', 0.5, {
    range: true,
    min: 0,
    max: 0.9,
    step: 0.05,
  });
  const maxPoints = number('max points', 5, {
    range: true,
    min: 1,
    max: 100,
    step: 1,
  });
  const maxSeries = number('max series', 3, {
    range: true,
    min: 1,
    max: 50,
    step: 1,
  });

  const stacked = boolean('stacked', false);
  const filteredData = data.filter(({ x, g }) => {
    return x < maxPoints && g.charCodeAt(PREFIX.length) - 97 < maxSeries;
  });
  const [Series] = getXYSeriesKnob('SeriesType', SeriesType.Bar, undefined);
  return (
    <Chart>
      <Settings theme={{ scales: { barsPadding } }} />
      <Axis id="count" title="count" position={Position.Left} tickFormat={(d) => d.toFixed(1)} />
      <Axis id="x" title="goods" position={Position.Bottom} />

      <Series
        id="data"
        xAccessor="x"
        yAccessors={['y']}
        xScaleType={ScaleType.Linear}
        splitSeriesAccessors={['g']}
        stackAccessors={stacked ? ['x'] : undefined}
        data={filteredData}
        yNice
      />
    </Chart>
  );
};
