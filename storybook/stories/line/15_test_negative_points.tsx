/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import { LineSeries, Chart, ScaleType, Settings, Position, Axis } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const negative = boolean('use negative values', true);
  const yScaleType = select(
    'Y scale type',
    {
      [ScaleType.Linear]: ScaleType.Linear,
      [ScaleType.Log]: ScaleType.Log,
    },
    ScaleType.Linear,
  );
  const now = moment();
  const data = new Array(12).fill(0).map((_, i) => {
    return {
      y: i === 10 ? (negative ? -1 : 1) : 0,
      x: now.add(1, 'm').valueOf(),
    };
  });
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="y" position={Position.Left} />
      <Axis id="x" position={Position.Bottom} />
      <LineSeries fit="linear" id="line" xScaleType={ScaleType.Time} yScaleType={yScaleType} data={data} />
    </Chart>
  );
};
