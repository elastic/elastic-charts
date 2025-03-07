/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, button } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import type { TexturedStyles } from '@elastic/charts';
import { Axis, Chart, CurveType, Position, Settings, TextureShape, SeriesType } from '@elastic/charts';
import { getRandomNumberGenerator, SeededDataGenerator, getRandomEntryFn } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const group = {
  random: 'Randomized parameters',
  default: 'Default parameters',
};
const dg = new SeededDataGenerator();
const rng = getRandomNumberGenerator();
const getRandomEntry = getRandomEntryFn();

interface Random {
  shape: boolean;
  rotation: boolean;
  shapeRotation: boolean;
  size: boolean;
  spacing: {
    x: boolean;
    y: boolean;
  };
  offset: {
    x: boolean;
    y: boolean;
  };
}

const getDefaultTextureKnobs = (): TexturedStyles => ({
  shape: customKnobs.fromEnum('Shape', TextureShape, TextureShape.Circle, {
    group: group.default,
  }),
  strokeWidth: number('Stroke width', 1, { min: 0, max: 10, step: 0.5 }, group.default),
  rotation: number('Rotation (degrees)', 45, { min: -365, max: 365 }, group.default),
  shapeRotation: number('Shape rotation (degrees)', 0, { min: -365, max: 365 }, group.default),
  size: number('Shape size', 20, { min: 0 }, group.default),
  opacity: number('Opacity', 1, { min: 0, max: 1, step: 0.1 }, group.default),
  spacing: {
    x: number('Shape spacing - x', 10, { min: 0 }, group.default),
    y: number('Shape spacing - y', 10, { min: 0 }, group.default),
  },
  offset: {
    x: number('Pattern offset - x', 0, {}, group.default),
    y: number('Pattern offset - y', 0, {}, group.default),
    global: true,
  },
});

const getRandomKnobs = (): Random => ({
  shape: boolean('Shape', true, group.random),
  rotation: boolean('Rotation', false, group.random),
  shapeRotation: boolean('Shape rotation', false, group.random),
  size: boolean('Size', true, group.random),
  spacing: {
    x: boolean('X spacing', false, group.random),
    y: boolean('Y spacing', false, group.random),
  },
  offset: {
    x: boolean('X offset', false, group.random),
    y: boolean('Y offset', false, group.random),
  },
});

const getTexture = (randomize: Random): Partial<TexturedStyles> => ({
  shape: randomize.shape ? getRandomEntry(TextureShape) : undefined,
  rotation: randomize.rotation ? rng(0, 365) : undefined,
  shapeRotation: randomize.shapeRotation ? rng(0, 365) : undefined,
  size: randomize.size ? rng(5, 30) : undefined,
  spacing: {
    x: randomize.spacing.x ? rng(0, 30) : undefined,
    y: randomize.spacing.y ? rng(0, 30) : undefined,
  },
  offset: {
    x: randomize.offset.x ? rng(0, 30) : undefined,
    y: randomize.offset.y ? rng(0, 30) : undefined,
  },
});

const data = new Array(10).fill(0).map(() => dg.generateBasicSeries(10, 10));

export const Example: ChartsStory = (_, { title, description }) => {
  const [count, setCount] = useState(0);
  button('Randomize', () => setCount((i) => i + 1), group.random);
  const n = number('Total series', 4, { min: 0, max: 10, step: 1 }) ?? 2;
  const showLegend = boolean('Show legend', false);
  const showFill = boolean('Show series fill', false);
  const chartColor = color('Chart color', 'rgba(0,0,0,1)');
  const random = getRandomKnobs();
  const [Series] = customKnobs.enum.xySeries('Series type', 'area', {
    exclude: [SeriesType.Bubble, SeriesType.Line],
  });
  const texture = getDefaultTextureKnobs();

  return (
    <Chart title={title} description={description} data-count={count}>
      <Settings
        showLegend={showLegend}
        theme={{
          areaSeriesStyle: {
            area: {
              texture,
              fill: showFill ? undefined : 'transparent',
            },
          },
          barSeriesStyle: {
            rect: {
              texture,
              fill: showFill ? undefined : 'transparent',
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
      <Axis id="left" position={Position.Left} />

      {new Array(n).fill(0).map((v, i) => (
        <Series
          key={i}
          id={`series-${i}`}
          areaSeriesStyle={{
            area: {
              texture: getTexture(random),
            },
          }}
          barSeriesStyle={{
            rect: {
              texture: getTexture(random),
            },
          }}
          xAccessor="x"
          yAccessors={['y']}
          color={chartColor}
          stackAccessors={['yes']}
          data={data[i]}
          curve={CurveType.CURVE_MONOTONE_X}
        />
      ))}
    </Chart>
  );
};
