/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, color } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, PartialTheme } from '@elastic/charts';
import { ColorVariant } from '@elastic/charts/src/utils/common';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const fillOption = select(
    'fillColor',
    {
      None: ColorVariant.None,
      Series: ColorVariant.Series,
      Custom: 'custom',
    },
    ColorVariant.None,
  );
  const fillColor = color('custom fill color', 'aquamarine');
  const fill = fillOption === 'custom' ? fillColor : fillOption;
  const strokeOption = select(
    'strokeColor',
    {
      None: ColorVariant.None,
      Series: ColorVariant.Series,
      Custom: 'custom',
    },
    ColorVariant.Series,
  );
  const strokeColor = color('custom stroke color', 'aquamarine');
  const stroke = strokeOption === 'custom' ? strokeColor : strokeOption;
  const customTheme: PartialTheme = {
    barSeriesStyle: {
      rect: {
        fill,
      },
      rectBorder: {
        visible: true,
        strokeWidth: 10,
        stroke,
      },
    },
  };

  return (
    <Chart>
      <Settings
        showLegend
        legendValue="lastBucket"
        legendPosition={Position.Right}
        theme={customTheme}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bar"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g']}
        data={TestDatasets.BARCHART_2Y1G}
      />
    </Chart>
  );
};
