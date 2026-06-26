/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';

import type { AreaGradient } from '@elastic/charts';
import {
  AreaSeries,
  Axis,
  Chart,
  ColorVariant,
  CurveType,
  LIGHT_THEME,
  Position,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator();
const areaData = dg.generateBasicSeries(20, 10);

const group = {
  gradient: 'Gradient',
  series: 'Series',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const seriesColor = color('Series color', LIGHT_THEME.colors.vizColors[0], group.series);
  const seriesOpacity = number('Series opacity', 1, { min: 0, max: 1, step: 0.05 }, group.series);

  const useSeriesColor = boolean('Stops use series color', true, group.gradient);
  const topColor = color('Top color', LIGHT_THEME.colors.vizColors[0], group.gradient);
  const bottomColor = color('Bottom color', LIGHT_THEME.colors.vizColors[0], group.gradient);
  const topOpacity = number('Top opacity', 0.7, { min: 0, max: 1, step: 0.05 }, group.gradient);
  const bottomOpacity = number('Bottom opacity', 0, { min: 0, max: 1, step: 0.05 }, group.gradient);

  // Direction in normalized [0,1] bbox coords. Default: bottom (y1:1) -> top (y2:0).
  const x1 = number('x1', 0, { min: 0, max: 1, step: 0.1 }, group.gradient);
  const y1 = number('y1', 1, { min: 0, max: 1, step: 0.1 }, group.gradient);
  const x2 = number('x2', 0, { min: 0, max: 1, step: 0.1 }, group.gradient);
  const y2 = number('y2', 0, { min: 0, max: 1, step: 0.1 }, group.gradient);

  const gradient: AreaGradient = {
    type: 'linear',
    x1,
    y1,
    x2,
    y2,
    stops: [
      { offset: 0, color: useSeriesColor ? ColorVariant.Series : bottomColor, opacity: bottomOpacity },
      { offset: 1, color: useSeriesColor ? ColorVariant.Series : topColor, opacity: topOpacity },
    ],
  };

  return (
    <Chart title={title} description={description}>
      <Settings
        baseTheme={useBaseTheme()}
        theme={{
          areaSeriesStyle: {
            area: {
              opacity: seriesOpacity,
              gradient,
            },
          },
        }}
      />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <AreaSeries
        id="series"
        color={seriesColor}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={areaData}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};
