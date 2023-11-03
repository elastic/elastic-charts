/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import { Axis, Chart, BarSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();

const data: { t: number; values: { v: number; cat: string }[] }[] = [];
const end = moment(1699037055867);
const days = 3;
const maxCardinality = 100;
const start = end.clone().subtract(days, 'days');
const hours = 6;
while (start.isBefore(end)) {
  const values = Array.from({ length: maxCardinality }, (_, i) => ({
    v: rng(0, 100),
    cat: `Category ${i + 1}`,
  }));
  data.push({ t: start.add(hours, 'hours').valueOf(), values });
}

export const Example: ChartsStory = (_, { title, description }) => {
  const resizeDebounce = number('resizeDebounce (ms)', 10, { min: 0, step: 20 });
  const cardinality = number('cardinality', 100, { min: 1, max: maxCardinality });
  return (
    <div
      style={{
        resize: 'both',
        padding: '0px',
        overflow: 'auto',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        maxHeight: '100vh',
      }}
    >
      <Chart title={title} description={description}>
        <Settings baseTheme={useBaseTheme()} resizeDebounce={resizeDebounce} showLegend />
        <Axis
          id="bottom"
          position={Position.Bottom}
          style={{
            tickLine: { visible: true, size: 0.0001, padding: 4 },
            tickLabel: {
              alignment: { horizontal: Position.Left, vertical: Position.Bottom },
              padding: 0,
              offset: { x: 0, y: 0 },
            },
          }}
          timeAxisLayerCount={3}
        />
        <Axis id="left" position={Position.Left} />

        <BarSeries
          id="Sensor 1"
          enableHistogramMode
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor="t"
          yAccessors={['v']}
          splitSeriesAccessors={['cat']}
          stackAccessors={['yes']}
          data={data.flatMap(({ t, values }) => values.slice(0, cardinality).map(({ v, cat }) => ({ t, v, cat })))}
        />
      </Chart>
    </div>
  );
};

Example.parameters = {
  markdown: `The \`resizeDebounce\` option on the \`Settings\` spec provides control over the eagerness of the chart to re-render upon resize. A value of \`0\` will remove the debounce altogether.
You can play with the cardinality and debounce time to see how the debouncing affects the chart render timing`,
};
