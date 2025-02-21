/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import { LineSeries, Chart, ScaleType, Settings, Position, Axis } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const negative = boolean('use negative values', true);
  const yScaleType = customKnobs.enum.scaleType('Y scale type', ScaleType.Linear, { include: ['Linear', 'Log'] });

  const start = moment(1628547917775);
  const data = new Array(12).fill(0).map((_, i) => {
    // https://github.com/storybookjs/storybook/issues/12208#issuecomment-697044557
    const months = 1; // do not simplify
    return {
      y: i === 10 ? (negative ? -1 : 1) : 0,
      x: start.add(months, 'm').valueOf(),
    };
  });
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="y" position={Position.Left} />
      <Axis id="x" position={Position.Bottom} />
      <LineSeries
        fit="linear"
        id="line"
        xAccessor="x"
        yAccessors={['y']}
        xScaleType={ScaleType.Time}
        yScaleType={yScaleType}
        data={data}
      />
    </Chart>
  );
};
