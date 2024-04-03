/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  euiPaletteColorBlind,
  euiPaletteComplementary,
  euiPaletteCool,
  euiPaletteForDarkBackground,
  euiPaletteForLightBackground,
  euiPaletteForStatus,
  euiPaletteForTemperature,
  euiPaletteGray,
  euiPaletteNegative,
  euiPalettePositive,
  euiPaletteWarm,
} from '@elastic/eui';
import { number, boolean, object, color } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React, { useCallback } from 'react';

import {
  Chart,
  Bullet,
  BulletSubtype,
  Settings,
  BulletColorConfig,
  ColorBandSimpleConfig,
  ColorBandComplexConfig,
} from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme, useThemeId } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const isDarkTheme = useThemeId().includes('dark');
  const getPalettes = useCallback(
    (steps: number) => [
      ['#164863', '#427D9D', '#9BBEC8', '#DDF2FD'],
      ['#F1EAFF', '#E5D4FF', '#DCBFFF', '#D0A2F7'],
      ['#0802A3', '#FF4B91', '#FF7676', '#FFCD4B'],
      euiPaletteColorBlind(),
      isDarkTheme ? euiPaletteForDarkBackground() : euiPaletteForLightBackground(),
      euiPaletteForTemperature(steps),
      euiPaletteForStatus(steps),
      euiPaletteComplementary(steps),
      euiPaletteNegative(steps),
      euiPalettePositive(steps),
      euiPaletteCool(steps),
      euiPaletteWarm(steps),
      euiPaletteGray(steps),
    ],
    [isDarkTheme],
  );

  // Colors
  const colorOptionIndex = getKnobFromEnum(
    'color config',
    {
      '1 Single Color': 1,
      '2 Array of Colors via palettes': 2,
      '3 Array with options': 3,
      '4 Fully custom bands': 4,
    },
    1,
    { group: 'Color Bands' },
  );
  const colorBands1 = color('Config 1 - Color', 'RGBA(70, 130, 96, 1)', 'Color Bands');
  const colorBands2 = getKnobFromEnum(
    'Config 2 - Palette',
    {
      Navy: 0,
      Pink: 1,
      Mixed: 2,
      'eui Palette color blind': 3,
      'eui Palette For Temperature': 4,
      'eui Palette For Status': 5,
      'eui Palette Complementary': 6,
      'eui Palette Negative': 7,
      'eui Palette Positive': 8,
      'eui Palette Cool': 9,
      'eui Palette Warm': 10,
      'eui Palette Gray': 11,
    },
    0,
    { group: 'Color Bands' },
  );
  const colorBands2Steps = number('Config 2 - Steps', 5, { min: 1, max: 10, range: true, step: 1 }, 'Color Bands');
  const colorBands2Reverse = boolean('Config 2 - Reverse', false, 'Color Bands');

  const colorBands3 = object<ColorBandSimpleConfig>(
    'Config 3 - json',
    {
      steps: 5,
      colors: ['pink', 'yellow', 'blue'],
    },
    'Color Bands',
  );
  const colorBands4 = object<ColorBandComplexConfig>(
    'Config 4 - json',
    [
      { color: 'red', gte: 0, lt: 20 },
      { color: 'green', gte: 20, lte: 40 },
      {
        color: 'blue',
        gt: 40,
        lte: {
          type: 'percentage',
          value: 100,
        },
      },
    ],
    'Color Bands',
  );
  const palette = getPalettes(colorBands2Steps)[colorBands2];
  const colorOptions = [, [colorBands1], colorBands2Reverse ? palette.reverse() : palette, colorBands3, colorBands4];

  // Domain
  const start = number('start', 0, { range: true, min: -200, max: 200 }, 'Domain');
  const end = number('end', 100, { range: true, min: -200, max: 200 }, 'Domain');
  const value = number('value', 56, { range: true, min: -200, max: 200 }, 'Domain');
  const target = number('target', 75, { range: true, min: -200, max: 200 }, 'Domain');

  // Ticks
  const niceDomain = boolean('niceDomain', false, 'Ticks');
  const tickStrategy = customKnobs.multiSelect(
    'tick strategy',
    {
      Auto: 'auto',
      TickCount: 'count',
      TickPlacements: 'placements',
    },
    'auto',
    'select',
    'Ticks',
  );
  const ticks = number('ticks(approx. count)', 5, { min: 0, step: 1 }, 'Ticks');
  const tickPlacements = customKnobs.numbersArray(
    'ticks(placements)',
    [-200, -100, 0, 5, 10, 15, 20, 25, 50, 100, 200],
    undefined,
    'Ticks',
  );

  // Other
  const debug = boolean('debug', false);
  const subtype = getKnobFromEnum('subtype', BulletSubtype, BulletSubtype.horizontal);

  const formatter = (d: number) => numeral(d).format('0.[0]');

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} baseTheme={useBaseTheme()} />
      <Bullet
        id="bullet"
        subtype={subtype}
        colorBands={colorOptions[colorOptionIndex] as BulletColorConfig}
        data={[
          [
            {
              target,
              value,
              title: 'The Title',
              subtitle: 'The Subtitle',
              domain: [start, end],
              niceDomain,
              ticks:
                tickStrategy[0] === 'count'
                  ? ticks
                  : tickStrategy[0] === 'placements'
                    ? () => tickPlacements
                    : undefined,
              valueFormatter: formatter,
              tickFormatter: formatter,
            },
          ],
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  resize: {
    width: 500,
    height: 500,
    boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
    borderRadius: '6px',
  },
};
