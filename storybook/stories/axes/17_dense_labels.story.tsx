/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import type { Rotation } from '@elastic/charts';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings, defaultColorBandFormatter } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const CHART_CONFIG_GROUP = 'Chart config';
const AXIS_X_GROUP = 'Axis X';
const AXIS_Y_GROUP = 'Axis Y';

const MAX_CATEGORIES = 150;

const COUNTRIES = Array.from(
  { length: MAX_CATEGORIES },
  (_, i) => `${String.fromCharCode(65 + Math.floor(i / 26))}${String.fromCharCode(65 + (i % 26))}`,
);

const RANGE_STEPS = {
  Categories: 0,
  Ranges: 5,
  'Decimal ranges': 0.1,
};

type DatasetKey = keyof typeof RANGE_STEPS;

// rounds away floating point errors, e.g. 3 * 0.1 = 0.30000000000000004
const formatRange = defaultColorBandFormatter((value) => `${Number(value.toFixed(2))}`);

const rangeFormatter = (step: number) => (value: string | number) => formatRange(Number(value), Number(value) + step);

export const Example: ChartsStory = (_, { title, description }) => {
  const chartRotation = customKnobs.numberSelect<Rotation>(
    'Chart rotation',
    { '0 deg': 0, '90 deg': 90, '-90 deg': -90, '180 deg': 180 },
    0,
    CHART_CONFIG_GROUP,
  );
  const datasetKey = select('Dataset', Object.keys(RANGE_STEPS) as DatasetKey[], 'Categories', CHART_CONFIG_GROUP);
  const barCount = number(
    'Number of bars',
    80,
    { min: 1, max: MAX_CATEGORIES, step: 1, range: true },
    CHART_CONFIG_GROUP,
  );
  const debug = boolean('debug', true, CHART_CONFIG_GROUP);

  const xRotation = number('rotation', 0, { range: true, min: -90, max: 90, step: 1 }, AXIS_X_GROUP);
  const xShowOverlappingLabels = boolean('show overlapping labels', false, AXIS_X_GROUP);
  const xShowOverlappingTicks = boolean('show overlapping ticks', false, AXIS_X_GROUP);

  const yTicks = number('number of ticks', 10, { range: true, min: 2, max: 50, step: 1 }, AXIS_Y_GROUP);
  const yShowOverlappingLabels = boolean('show overlapping labels', false, AXIS_Y_GROUP);
  const yShowOverlappingTicks = boolean('show overlapping ticks', false, AXIS_Y_GROUP);

  const isRange = datasetKey !== 'Categories';
  const step = RANGE_STEPS[datasetKey];
  // a rotated chart moves the X axis to the left, the Y axis to the bottom
  const isRotated = chartRotation === 90 || chartRotation === -90;

  const data = Array.from({ length: barCount }, (__, i) => ({
    x: isRange ? i * step : COUNTRIES[i],
    y: ((i * 7) % 100) * 10,
  }));

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} baseTheme={useBaseTheme()} rotation={chartRotation} />
      <Axis
        id="x-axis"
        position={isRotated ? Position.Left : Position.Bottom}
        title={isRange ? 'Duration (s)' : 'Origin country'}
        tickFormat={isRange ? rangeFormatter(step) : String}
        showOverlappingLabels={xShowOverlappingLabels}
        showOverlappingTicks={xShowOverlappingTicks}
        style={{ tickLabel: { rotation: xRotation } }}
      />
      <Axis
        id="y-axis"
        position={isRotated ? Position.Bottom : Position.Left}
        title="Distance (km)"
        ticks={yTicks}
        showOverlappingLabels={yShowOverlappingLabels}
        showOverlappingTicks={yShowOverlappingTicks}
      />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};

Example.parameters = {
  resize: true,
  markdown: `The XY counterpart of the Heatmap \`Dense labels\` story, with the same datasets.

Each X axis label overlapping the last visible one is hidden, unless \`showOverlappingLabels\` is set.
\`showOverlappingTicks\` keeps the ticks of the hidden labels.
Increase the Y axis \`number of ticks\` to hide overlapping labels on a linear scale.`,
};
