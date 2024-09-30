/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const defaultPointStyles = {
  radius: 4,
  strokeWidth: 2,
};

const defaultlineStyles = {
  stroke: 'black',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const enablePointStyles = !boolean('disable isolated point styles', false);
  const [Series] = customKnobs.enum.xySeries('series type', 'line', { exclude: ['bar', 'bubble'] });
  const themeLevelStroke = color('point.stroke - theme level', 'red');
  const themeLevelStrokeIso = color('isolatedPoint.stroke - theme level', 'green');
  const useSeriesOverrides = boolean('use series overrides', false);
  const seriesLevelStroke = color('point.stroke - series level', 'blue');
  const useSeriesIsoOverrides = boolean('use series iso overrides', false);
  const seriesLevelStrokeIso = color('isolatedPoint.stroke - series level', 'orange');
  const usePointStyleOverrides = boolean('use point style overrides', false);
  const pointStyleStroke = color('stroke - pointStyleAccessor', 'black');

  return (
    <Chart title={title} description={description}>
      <Settings
        legendPosition={Position.Right}
        theme={{
          areaSeriesStyle: {
            line: defaultlineStyles,
            point: {
              visible: 'always',
              stroke: themeLevelStroke,
              ...defaultPointStyles,
            },
            isolatedPoint: {
              stroke: themeLevelStrokeIso,
              ...defaultPointStyles,
              enabled: enablePointStyles,
            },
          },
          lineSeriesStyle: {
            line: defaultlineStyles,
            point: {
              visible: 'always',
              stroke: themeLevelStroke,
              ...defaultPointStyles,
            },
            isolatedPoint: {
              stroke: themeLevelStrokeIso,
              ...defaultPointStyles,
              enabled: enablePointStyles,
            },
          },
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis
        id="x"
        position={Position.Bottom}
        style={{
          tickLine: { size: 0, padding: 4 },
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
        pointStyleAccessor={
          !usePointStyleOverrides
            ? undefined
            : () => ({
                stroke: pointStyleStroke,
              })
        }
        areaSeriesStyle={{
          ...(useSeriesOverrides && {
            point: {
              stroke: seriesLevelStroke,
            },
          }),
          ...(useSeriesIsoOverrides && {
            isolatedPoint: {
              stroke: seriesLevelStrokeIso,
            },
          }),
        }}
        lineSeriesStyle={{
          ...(useSeriesOverrides && {
            point: {
              stroke: seriesLevelStroke,
            },
          }),
          ...(useSeriesIsoOverrides && {
            isolatedPoint: {
              stroke: seriesLevelStrokeIso,
            },
          }),
        }}
        data={[
          ...KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, 40).map((d, i) => {
            if ([1, 10, 12, 20, 22, 24, 28].includes(i)) {
              return [d[0], null, 'A'];
            }
            return [...d, 'A'];
          }),
        ]}
      />
    </Chart>
  );
};
