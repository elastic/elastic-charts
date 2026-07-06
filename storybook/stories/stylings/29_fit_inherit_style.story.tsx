/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import type { LinearGradient } from '@elastic/charts';
import {
  AreaSeries,
  Axis,
  Chart,
  ColorVariant,
  CurveType,
  Fit,
  LIGHT_THEME,
  Position,
  ScaleType,
  Settings,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const data = [
  { x: 0, y: 3 },
  { x: 1, y: 5 },
  { x: 2, y: null },
  { x: 3, y: null },
  { x: 4, y: 6 },
  { x: 5, y: 4 },
  { x: 6, y: null },
  { x: 7, y: 8 },
  { x: 8, y: 7 },
  { x: 9, y: null },
  { x: 10, y: 5 },
];

const SERIES_COLOR = LIGHT_THEME.colors.vizColors[2];

const gradient: LinearGradient = {
  type: 'linear',
  stops: [
    { offset: 0, color: ColorVariant.Series, opacity: 0 },
    { offset: 1, color: ColorVariant.Series, opacity: 0.8 },
  ],
};

export const Example: ChartsStory = (_, { title, description }) => {
  const fillType = select('Area fill', { 'Solid custom color': 'solid', Gradient: 'gradient' }, 'gradient');
  const applyFitStyle = boolean('Apply explicit fit style', false);

  return (
    <Chart title={title} description={description}>
      <Settings
        baseTheme={useBaseTheme()}
        theme={{
          areaSeriesStyle: {
            area: {
              opacity: 1,
              fill: fillType === 'solid' ? 'rgba(220,40,40,1)' : undefined,
              gradient: fillType === 'gradient' ? gradient : undefined,
            },
          },
        }}
      />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <AreaSeries
        id="series"
        color={SERIES_COLOR}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
        curve={CurveType.CURVE_MONOTONE_X}
        fit={Fit.Linear}
        areaSeriesStyle={applyFitStyle ? { fit: { area: { fill: 'rgba(0,0,0,0.6)' } } } : undefined}
      />
    </Chart>
  );
};
