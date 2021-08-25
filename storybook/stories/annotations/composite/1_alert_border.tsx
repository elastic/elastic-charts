/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Axis, BarSeries, Chart, RectAnnotation, ScaleType, Settings } from '@elastic/charts';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { Position } from '@elastic/charts/src/utils/common';

import { useBaseTheme } from '../../../use_base_theme';

export const Example = () => {
  return (
    <Chart>
      <Settings showLegend showLegendExtra baseTheme={useBaseTheme()} />
      <RectAnnotation
        id="rect"
        dataValues={[
          {
            coordinates: {
              x0: 1,
              x1: 3,
              y0: 0,
              y1: 4,
            },
            details: 'details about this annotation',
          },
        ]}
        style={{
          fill: 'red',
          marker: <Icon type="alert" />,
          markerPosition: Position.Top,
          lineBorderPosition: Position.Left,
        }}
      />
      <Axis id="horizontal" position={Position.Bottom} title="x-domain axis" />
      <Axis id="vertical" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
