/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, AreaSeries, Chart, Position, ScaleType, Settings, PartialTheme } from '@elastic/charts';
import { ColorVariant } from '@elastic/charts/src/utils/common';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const customTheme: PartialTheme = {
    areaSeriesStyle: {
      point: {
        visible: true,
        radius: 10,
        fill: ColorVariant.Series,
        stroke: ColorVariant.None,
        opacity: 0.5,
      },
      area: {
        opacity: 0.2,
      },
      line: {
        visible: false,
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

      <AreaSeries
        id="area"
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
