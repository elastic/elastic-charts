/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Chart, ScaleType, StackMode, Axis, Position, CurveType, Settings } from '@elastic/charts';
import { BABYNAME_DATA } from '@elastic/charts/src/utils/data_samples/babynames';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const stackMode = select<StackMode>(
    'stackMode',
    {
      Silhouette: StackMode.Silhouette,
      Wiggle: StackMode.Wiggle,
    },
    StackMode.Silhouette,
  );
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="x" position={Position.Bottom} />
      <Axis id="y" position={Position.Left} />
      <AreaSeries
        id="area1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[3]}
        splitSeriesAccessors={[2]}
        data={BABYNAME_DATA}
        stackAccessors={[0]}
        curve={CurveType.CURVE_MONOTONE_X}
        stackMode={stackMode}
        areaSeriesStyle={{
          area: {
            opacity: 0.7,
          },
          line: {
            visible: false,
          },
        }}
      />
    </Chart>
  );
};
