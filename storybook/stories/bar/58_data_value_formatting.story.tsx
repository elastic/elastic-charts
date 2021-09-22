/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, ScaleType, Settings } from '@elastic/charts';

import { GITHUB_DATASET_HIGH_VALUES } from '../../../packages/charts/src/utils/data_samples/test_dataset_github';
import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const noTickFormat = boolean('turn off special tickFormat', false);
  const rotation = select(
    'Rotation degree',
    {
      '0 deg(default)': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    },
    0,
  );
  return (
    <Chart>
      <Settings theme={[useBaseTheme()]} rotation={rotation} />
      <BarSeries
        id="issues"
        name="Issues"
        data={GITHUB_DATASET_HIGH_VALUES}
        xAccessor="vizType"
        yAccessors={['count']}
        xScaleType={ScaleType.Ordinal}
        displayValueSettings={{ showValueLabel: true }}
      />
      <Axis
        id="bottom-axis"
        position="bottom"
        tickFormat={
          (!noTickFormat && rotation === 90) || (!noTickFormat && rotation === -90)
            ? (d: string) => `${Math.round(Number(d) / 1000)}k`
            : undefined
        }
      />
      <Axis
        id="left-axis"
        position="left"
        tickFormat={
          (!noTickFormat && rotation === 0) || (!noTickFormat && rotation === 180)
            ? (d: string) => `${Math.round(Number(d) / 1000)}k`
            : undefined
        }
      />
    </Chart>
  );
};
