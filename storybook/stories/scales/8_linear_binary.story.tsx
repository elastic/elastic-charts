/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();

function generateRandomBinary(bitCount: number) {
  return rng(0, 2 ** bitCount - 1);
}

const data = new Array(20).fill(1).map((_, x) => ({
  x,
  'Base 10': rng(0, 2000),
  'Base 2': generateRandomBinary(11),
}));

export const Example: ChartsStory = (_, { title, description }) => {
  const yAccessor = select('Data type', ['Base 10', 'Base 2'], 'Base 2');
  const yScaleType = select(
    'yScaleType',
    {
      Linear: ScaleType.Linear,
      'Linear Binary': ScaleType.LinearBinary,
    },
    ScaleType.LinearBinary,
  );
  const yNice = boolean('Nice y ticks', false);

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" title="" position={Position.Bottom} showOverlappingTicks />
      <Axis id="binary" title={yAccessor} position={Position.Left} />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={yScaleType}
        data={data}
        yNice={yNice}
        xAccessor="x"
        yAccessors={[yAccessor]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `By default, \`Linear\` scales compute scale ticks per base 10 numerical system.
  You may set the \`yScaleType\` to \`LinearBinary\` to compute ticks per base 2 numerical system.
  This base is also applied to tick nicing.`,
};
