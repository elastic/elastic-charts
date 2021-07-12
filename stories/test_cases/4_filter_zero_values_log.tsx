/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Axis, Position, AreaSeries, ScaleType, LogBase } from '../../packages/charts/src';
import { logFormatter } from '../utils/formatters';

/**
 * Should filter out zero values when fitting domain
 */
export const Example = () => {
  const fit = boolean('fit', true);
  const logMinLimit = number('logMinLimit', 0.001);
  return (
    <Chart className="story-chart">
      <Axis
        id="count"
        position={Position.Left}
        domain={{ fit, logMinLimit }}
        tickFormat={logFormatter(LogBase.Common)}
      />
      <Axis id="x" position={Position.Bottom} integersOnly />
      <AreaSeries
        id="bars"
        name="amount"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Log}
        areaSeriesStyle={{ point: { visible: true } }}
        data={[
          { x: 1, y: 100 },
          { x: 2, y: 0 },
          { x: 3, y: 10 },
          { x: 4, y: 0 },
          { x: 5, y: 1 },
          { x: 6, y: 0 },
          { x: 7, y: 0.01 },
          { x: 8, y: 0 },
        ]}
      />
    </Chart>
  );
};
