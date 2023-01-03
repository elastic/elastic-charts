/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import {
  AreaSeries,
  Axis,
  Chart,
  Position,
  ScaleType,
  Settings,
  niceTimeFormatter,
  RecursivePartial,
  AxisStyle,
  BarSeries,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} integersOnly />

      <BarSeries
        id="Thermal changes"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={[
          ['Sensor 1', 0.2],
          ['Sensor 2', 0.8],
          ['Sensor 3', 0.76],
          ['Sensor 4', 0.12],
        ]}
      />
    </Chart>
  );
};
Example.parameters = {
  markdown: 'Currently not correctly rendered due to [#1920](https://github.com/elastic/elastic-charts/issues/1920)',
};
