/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { array, boolean, color, number, text } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  CurveType,
  Position,
  ScaleType,
  TexturedStyles,
  Settings,
  TextureShape,
  LIGHT_THEME,
  SeriesType,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const dg = new SeededDataGenerator();
const barData = dg.generateBasicSeries(4);
const areaData = dg.generateBasicSeries(20, 10);

const group = {
  texture: 'Texture',
  pattern: 'Pattern',
  series: 'Series',
};
const STAR =
  'M -7.75 -2.5 l 5.9 0 l 1.85 -6.1 l 1.85 6.1 l 5.9 0 l -4.8 3.8 l 1.85 6.1 l -4.8 -3.8 l -4.8 3.8 l 1.85 -6.1 l -4.8 -3.8 z';
const DEFAULT_COLOR = LIGHT_THEME.colors.vizColors[0];

const getTextureKnobs = (useCustomPath: boolean): TexturedStyles => ({
  ...(useCustomPath
    ? { path: text('Custom path', STAR, group.texture) }
    : {
        shape: customKnobs.fromEnum('Shape', TextureShape, TextureShape.Line, {
          group: group.texture,
        }),
      }),
  stroke: boolean('Use stroke color', true, group.texture)
    ? color('Stoke color', DEFAULT_COLOR, group.texture)
    : undefined,
  strokeWidth: number('Stroke width', 1, { min: 0, max: 10, step: 0.5 }, group.texture),
  dash: array('Stroke dash', [], ',', group.texture).map((n) => parseInt(n, 10)),
  fill: boolean('Use fill color', true, group.texture) ? color('Fill color', DEFAULT_COLOR, group.texture) : undefined,
  rotation: number('Rotation (degrees)', 45, { min: -365, max: 365 }, group.pattern),
  opacity: number('Opacity', 1, { min: 0, max: 1, step: 0.1 }, group.texture),
  shapeRotation: number('Shape rotation (degrees)', 0, { min: -365, max: 365 }, group.texture),
  size: useCustomPath
    ? number('Shape size - custom path', 20, { min: 0 }, group.texture)
    : number('Shape size', 20, { min: 0 }, group.texture),
  spacing: {
    x: number('Shape spacing - x', 10, { min: 0 }, group.pattern),
    y: number('Shape spacing - y', 0, { min: 0 }, group.pattern),
  },
  offset: {
    x: number('Pattern offset - x', 0, {}, group.pattern),
    y: number('Pattern offset - y', 0, {}, group.pattern),
    global: boolean('Apply offset along global coordinate axes', true, group.pattern),
  },
});

export const Example = () => {
  const useCustomPath = boolean('Use custom path', false, group.texture);
  const texture: TexturedStyles = getTextureKnobs(useCustomPath);
  const opacity = number('Series opacity', 1, { min: 0, max: 1, step: 0.1 }, group.series);
  const showFill = boolean('Show series fill', false, group.series);
  const seriesColor = color('Series color', DEFAULT_COLOR, group.series);
  const [Series, seriesType] = customKnobs.enum.xySeries('Series type', 'area', {
    group: group.series,
    exclude: [SeriesType.Bubble, SeriesType.Line],
  });

  return (
    <Chart>
      <Settings
        theme={{
          areaSeriesStyle: {
            area: {
              texture,
              opacity,
              fill: showFill ? undefined : 'transparent',
            },
          },
          barSeriesStyle: {
            rect: {
              fill: showFill ? undefined : 'transparent',
              opacity,
              texture,
            },
            rectBorder: {
              visible: true,
              strokeWidth: 2,
            },
          },
        }}
        baseTheme={useBaseTheme()}
      />

      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <Series
        id="series"
        color={seriesColor}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={seriesType === 'bar' ? barData : areaData}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};
