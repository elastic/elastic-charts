/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => (
  <Chart>
    <Settings showLegend legendExtra="lastBucket" legendPosition={Position.Right} baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <BarSeries
      id="bars1"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y1', 'y2']}
      data={TestDatasets.BARCHART_2Y0G}
    />
  </Chart>
);
