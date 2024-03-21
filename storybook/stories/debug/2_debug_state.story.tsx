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
  Chart,
  LineSeries,
  ScaleType,
  CurveType,
  AreaSeries,
  BarSeries,
  Settings,
  Axis,
  Position,
  SeriesNameFn,
  LegendValue,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getDebugStateLogger } from '../utils/debug_state_logger';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const debugState = boolean('debugState', true);
  const line = boolean('show line', true);
  const area = boolean('show area', true);
  const bar = boolean('show bar', true);
  const groupCount = number('number of groups', 1, { min: 1 });
  const splitSeriesAccessors = groupCount > 1 ? ['g'] : undefined;
  const naming: SeriesNameFn | undefined =
    groupCount === 1 ? undefined : ({ specId, seriesKeys }) => `${specId} | ${seriesKeys[0]}`;

  const dg = new SeededDataGenerator();
  const lineData = dg.generateGroupedSeries(40, groupCount);
  const areaData = dg.generateGroupedSeries(40, groupCount);
  const barData = dg.generateGroupedSeries(40, groupCount);

  return (
    <Chart title={title} description={description}>
      <Settings
        onRenderChange={getDebugStateLogger(debugState)}
        debug={debug}
        debugState={debugState}
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      {line && (
        <LineSeries
          id="lines"
          name={naming}
          xAccessor="x"
          yAccessors={['y']}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          splitSeriesAccessors={splitSeriesAccessors}
          data={lineData}
        />
      )}
      {area && (
        <AreaSeries
          id="areas"
          name={naming}
          xAccessor="x"
          yAccessors={['y']}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          data={areaData}
          splitSeriesAccessors={splitSeriesAccessors}
          curve={CurveType.CURVE_MONOTONE_X}
        />
      )}

      {bar && (
        <BarSeries
          id="bars"
          name={naming}
          xAccessor="x"
          yAccessors={['y']}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          splitSeriesAccessors={splitSeriesAccessors}
          data={barData}
        />
      )}
    </Chart>
  );
};
