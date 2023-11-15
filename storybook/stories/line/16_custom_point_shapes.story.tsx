/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getColorPicker } from '../utils/components/get_color_picker';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));
const data = KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(10, 150);

export const Example: ChartsStory = (_, { title, description }) => {
  const showColorPicker = boolean('Show color picker', false);

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        showLegendExtra
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
        legendColorPicker={showColorPicker ? getColorPicker('leftCenter') : undefined}
      />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />
      <LineSeries
        id="test"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        color="lightgray" // never overridden
        pointStyleAccessor={(datum) => {
          return {
            shape: (ctx, coordinates) => {
              ctx.beginPath();
              ctx.ellipse(coordinates.x, coordinates.y, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
              ctx.fill();
              ctx.fillText(Math.floor(datum.y1), coordinates.x - 5, coordinates.y - 10);
            },
            visible: true;
          };
        }}
        data={data.map(([x, y], i) => [x, y + 60, i])}
      />
    </Chart>
  );
};
