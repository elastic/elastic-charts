/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, ScaleType, Settings, PartialTheme } from '@elastic/charts';

import { BARCHART_1Y0G_LINEAR } from '../../../packages/charts/src/utils/data_samples/test_dataset';
import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const rotation = select(
    'Chart rotation',
    {
      '0 deg(default)': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    },
    0,
  );

  const theme: PartialTheme = {
    barSeriesStyle: {
      displayValue: {
        fontSize: 10,
        fill: 'black',
        alignment: {
          horizontal: select(
            'Horizontal alignment',
            {
              Default: undefined,
              Left: 'left',
              Center: 'center',
              Right: 'right',
            },
            undefined,
          ),
          vertical: select(
            'Vertical alignment',
            {
              Default: undefined,
              Top: 'top',
              Middle: 'middle',
              Bottom: 'bottom',
            },
            undefined,
          ),
        },
      },
    },
  };

  return (
    <Chart>
      <Settings theme={theme} baseTheme={useBaseTheme()} rotation={rotation} />
      <BarSeries
        id="bars"
        data={BARCHART_1Y0G_LINEAR}
        yAccessors={['y']}
        xScaleType={ScaleType.Linear}
        displayValueSettings={{ showValueLabel: true }}
      />
      <Axis id="bottom-axis" position="bottom" tickFormat={(d) => `${d} H`} />
      <Axis id="left-axis" position="left" tickFormat={(d) => `${d} V`} />
    </Chart>
  );
};
