/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, CurveType, Position, ScaleType, Settings, Fit } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const fitEnabled = boolean('enable fit function', false);
  const [Series] = customKnobs.enum.xySeries('series type', 'line', { exclude: ['bar', 'bubble'] });
  const maxDataPoints = number('max data points', 60, {
    range: true,
    min: 0,
    max: KIBANA_METRICS.metrics.kibana_os_load.v1.data.length,
    step: 1,
  });
  const pointRadius = number('default point radius', 0, {
    range: true,
    min: 0,
    max: 10,
    step: 1,
  });
  const radius = number('isolated point radius', 2, {
    range: true,
    min: 0,
    max: 10,
    step: 1,
  });
  const overrideRadius = number('override point radius', 0, {
    range: true,
    min: 0,
    max: 10,
    step: 1,
  });
  const overridePointRadius = boolean('override radius for isolated points', false);

  return (
    <Chart title={title} description={description}>
      <Settings
        legendPosition={Position.Right}
        theme={{
          areaSeriesStyle: {
            point: {
              visible: true,
              radius: pointRadius,
            },
            isolatedPoint: {
              radius,
              shape: customKnobs.enum.pointShape(),
            },
          },
          lineSeriesStyle: {
            point: {
              visible: true,
              radius: pointRadius,
            },
            isolatedPoint: {
              radius,
              shape: customKnobs.enum.pointShape(),
            },
          },
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis
        id="x"
        position={Position.Bottom}
        style={{
          tickLine: { size: 0.0001, padding: 4 },
          tickLabel: {
            alignment: { horizontal: Position.Left, vertical: Position.Bottom },
            padding: 0,
            offset: { x: 0, y: 0 },
          },
        }}
        timeAxisLayerCount={2}
        gridLine={{
          visible: true,
        }}
      />
      <Axis id="y" position={Position.Left} ticks={5} />

      <Series
        id="Count of records"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        splitSeriesAccessors={[2]}
        areaSeriesStyle={
          overrideRadius > 0
            ? {
                point: {
                  visible: true,
                  radius: overrideRadius,
                },
                isolatedPoint: overridePointRadius
                  ? {
                      radius,
                    }
                  : {},
              }
            : {}
        }
        lineSeriesStyle={
          overrideRadius > 0
            ? {
                point: {
                  visible: true,
                  radius: overrideRadius,
                },
                isolatedPoint: overridePointRadius
                  ? {
                      radius,
                    }
                  : {},
              }
            : {}
        }
        data={[
          ...KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, maxDataPoints).map((d, i) => {
            if ([1, 10, 12, 20, 22, 24, 28].includes(i)) {
              return [d[0], null, 'A'];
            }
            return [...d, 'A'];
          }),
          ...KIBANA_METRICS.metrics.kibana_os_load.v2.data.slice(0, maxDataPoints).map((d, i) => {
            if ([5, 7, 33, 35, 20, 22, 35].includes(i)) {
              return [d[0], null, 'B'];
            }
            return [...d, 'B'];
          }),
          ...KIBANA_METRICS.metrics.kibana_os_load.v3.data.slice(0, maxDataPoints).map((d, i) => {
            if ([9, 11, 13, 45, 47, 61, 62].includes(i)) {
              return [d[0], null, 'C'];
            }
            return [...d, 'C'];
          }),
        ]}
        fit={fitEnabled ? Fit.Linear : undefined}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};
