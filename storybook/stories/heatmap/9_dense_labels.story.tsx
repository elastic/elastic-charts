/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, ScaleType, Settings, defaultColorBandFormatter } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getDebugStateLogger } from '../utils/debug_state_logger';

const MAX_CATEGORIES = 150;

const COUNTRIES = Array.from(
  { length: MAX_CATEGORIES },
  (_, i) => `${String.fromCharCode(65 + Math.floor(i / 26))}${String.fromCharCode(65 + (i % 26))}`,
);

const RANGE_STEPS = {
  Categories: { x: 0, y: 250 },
  Ranges: { x: 5, y: 250 },
  'Decimal ranges': { x: 0.1, y: 0.05 },
};

type DatasetKey = keyof typeof RANGE_STEPS;

// rounds away floating point errors, e.g. 3 * 0.1 = 0.30000000000000004
const formatRange = defaultColorBandFormatter((value) => `${Number(value.toFixed(2))}`);

const rangeFormatter = (step: number) => (value: string | number) => formatRange(Number(value), Number(value) + step);

export const Example: ChartsStory = (_, { title, description }) => {
  const datasetKey = select('Dataset', Object.keys(RANGE_STEPS) as DatasetKey[], 'Categories');
  const xCount = number('X categories', 80, { min: 1, max: MAX_CATEGORIES, step: 1, range: true });
  const yCount = number('Y categories', 80, { min: 1, max: MAX_CATEGORIES, step: 1, range: true });
  const rotation = number('X-Axis label rotation', 0, { step: 1, min: 0, max: 90, range: true });
  const xAxisShowOverlappingLabels = boolean('X-Axis show overlapping labels', false);
  const yAxisShowOverlappingLabels = boolean('Y-Axis show overlapping labels', false);
  const debug = boolean('Debug', false);
  const debugState = boolean('Enable debug state', true);
  const isRange = datasetKey !== 'Categories';
  const steps = RANGE_STEPS[datasetKey];

  const data = Array.from({ length: xCount }, (__, xIndex) =>
    Array.from({ length: yCount }, (___, yIndex) => ({
      x: isRange ? xIndex * steps.x : COUNTRIES[xIndex],
      y: yIndex * steps.y,
      value: ((xIndex * 7 + yIndex * 13) % 100) * 10,
    })),
  ).flat();

  return (
    <Chart title={title} description={description}>
      <Settings
        onRenderChange={getDebugStateLogger(debugState)}
        onElementClick={action('onElementClick')}
        showLegend
        legendPosition="right"
        brushAxis="both"
        theme={{ heatmap: { xAxisLabel: { rotation } } }}
        baseTheme={useBaseTheme()}
        debugState={debugState}
        debug={debug}
      />
      <Heatmap
        id="heatmap1"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 250, color: '#AADC32' },
            { start: 250, end: 500, color: '#35B779' },
            { start: 500, end: 750, color: '#24868E' },
            { start: 750, end: Infinity, color: '#3B528B' },
          ],
        }}
        xScale={{ type: ScaleType.Ordinal }}
        data={data}
        xAccessor="x"
        yAccessor="y"
        valueAccessor="value"
        valueFormatter={(d) => `${Number(d.toFixed(2))}`}
        xSortPredicate={isRange ? 'numAsc' : 'alphaAsc'}
        ySortPredicate="numAsc"
        xAxisLabelFormatter={isRange ? rangeFormatter(steps.x) : String}
        yAxisLabelFormatter={isRange ? rangeFormatter(steps.y) : String}
        xAxisShowOverlappingLabels={xAxisShowOverlappingLabels}
        yAxisShowOverlappingLabels={yAxisShowOverlappingLabels}
        xAxisTitle={isRange ? 'Duration (s)' : 'Origin country'}
        yAxisTitle="Distance (km)"
      />
    </Chart>
  );
};

Example.parameters = {
  resize: true,
  markdown: `By default every axis label is rendered, also the overlapping ones.
Hiding categorical labels is discouraged, because a cell can't be matched to its category without a label:
prefer enlarging the chart when possible.

Set \`xAxisShowOverlappingLabels\` and \`yAxisShowOverlappingLabels\` to \`false\` to render the labels
at a regular interval and avoid overlaps when there are more categories than the available space.

With the \`Ranges\` and \`Decimal ranges\` datasets, both axes use numeric buckets
formatted as \`start - end\` ranges with \`defaultColorBandFormatter\`.`,
};
