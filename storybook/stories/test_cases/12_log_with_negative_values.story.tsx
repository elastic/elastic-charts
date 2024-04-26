/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const rng = getRandomNumberGenerator();

const data = new Array(20).fill(1).flatMap((_, x) =>
  ['A', 'B', 'C'].map((g) => {
    const y1 = rng(30, 100);
    const y0 = rng(0.01, 20);
    return {
      x,
      g,
      y1Pos: y1,
      y1Neg: -y1,
      y0Pos: y0,
      y0Neg: -y0,
    };
  }),
);

export const Example: ChartsStory = (_, { title, description }) => {
  const showLegend = boolean('Show legend', false);
  const yScaleType = customKnobs.enum.scaleType('Scale Type', ScaleType.Log, { include: ['Linear', 'Log'] });
  const [Series] = customKnobs.enum.xySeries('Series Type', 'bar', { exclude: ['bubble'] });
  const logMinLimit = number('logMinLimit', 1, { min: 0 });
  const yNice = boolean('Nice y ticks', false);
  const banded = boolean('Banded', false);
  const split = boolean('Split', false);
  const stacked = boolean('Stacked', true);
  const showPosData = boolean('Show positive data', false);

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} showLegend={showLegend} legendValues={['currentAndLastValue']} />
      <Axis id="bottom" title="x" position={Position.Bottom} ticks={20} />
      <Axis id="left" title="y" position={Position.Left} domain={{ min: NaN, max: NaN, logMinLimit }} />
      <Series
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={yScaleType}
        tickFormat={(d: number) => numeral(d).format('0.[0]')}
        data={split ? data : data.filter(({ g }) => g === 'A')}
        yNice={yNice}
        xAccessor="x"
        yAccessors={showPosData ? ['y1Pos'] : ['y1Neg']}
        y0Accessors={!banded ? [] : showPosData ? ['y0Pos'] : ['y0Neg']}
        splitSeriesAccessors={split ? ['g'] : []}
        stackAccessors={stacked ? ['g'] : []}
      />
    </Chart>
  );
};
