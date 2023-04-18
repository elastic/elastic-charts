/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
  Tooltip,
  TooltipType,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example = () => {
  const hideBars = boolean('hideBars', false);
  const formatter = timeFormatter(niceTimeFormatByDay(1));
  const chartRotation = customKnobs.enum.rotation();
  const numberFormatter = (d: any) => Number(d).toFixed(2);

  const tooltipType = select(
    'tooltipType',
    {
      cross: TooltipType.Crosshairs,
      vertical: TooltipType.VerticalCursor,
      follow: TooltipType.Follow,
      none: TooltipType.None,
    },
    TooltipType.Crosshairs,
  );

  return (
    <Chart>
      <Settings debug={boolean('debug', false)} baseTheme={useBaseTheme()} rotation={chartRotation} />
      <Tooltip type={tooltipType} snap={boolean('tooltip snap to grid', true)} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Bottom axis"
        tickFormat={[0, 180].includes(chartRotation) ? formatter : numberFormatter}
      />
      <Axis
        id="left2"
        title="Left axis"
        domain={{
          min: NaN,
          max: NaN,
          fit: hideBars,
        }}
        position={Position.Left}
        tickFormat={[0, 180].includes(chartRotation) ? numberFormatter : formatter}
      />
      {!hideBars && (
        <>
          <BarSeries
            id="data 1"
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[1]}
            stackAccessors={[0]}
            data={KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, 20)}
          />
          <BarSeries
            id="data 2"
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[1]}
            stackAccessors={[0]}
            data={KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, 20)}
          />
        </>
      )}
      <LineSeries
        id="data 3"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load.v3.data.slice(0, 20)}
      />
    </Chart>
  );
};
