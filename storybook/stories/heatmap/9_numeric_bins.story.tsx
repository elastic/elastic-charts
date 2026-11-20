/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, Predicate, ScaleType, Settings } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator('numeric_bins');
const interval = 10;
const yInterval = 5;
const data = Array.from({ length: 8 }, (_, j) => j)
  .filter((j) => j !== 3)
  .flatMap((j) =>
    Array.from({ length: 20 }, (_, i) => i)
      .filter((i) => i < 6 || i > 10)
      .map((i) => ({
        x: i * interval,
        y: j * yInterval,
        xCategory: String.fromCharCode(65 + i),
        yCategory: `host-${String.fromCharCode(97 + j)}`,
        count: rng(0, 100),
      })),
  );

const scaleTypes = ['linear', 'ordinal', 'categorical'] as const;
type AxisType = (typeof scaleTypes)[number];

export const Example: ChartsStory = (_, { title, description }) => {
  const xType = select<AxisType>('x axis', scaleTypes, 'linear');
  const yType = select<AxisType>('y axis', scaleTypes, 'linear');
  const useDomain = boolean('Custom domain', false);
  const min = number('Domain min', -20, { step: 5 }, 'Domain');
  const max = number('Domain max', 140, { step: 5 }, 'Domain');
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} onBrushEnd={action('onBrushEnd')} />
      <Heatmap
        id="numericBinsHeatmap"
        colorScale={{
          type: 'bands',
          bands: [
            { start: 0, end: 25, color: '#d2e9f7' },
            { start: 25, end: 50, color: '#8bc8fb' },
            { start: 50, end: 75, color: '#fdec25' },
            { start: 75, end: Infinity, color: '#fe5050' },
          ],
        }}
        data={data}
        xAccessor={xType === 'categorical' ? 'xCategory' : 'x'}
        yAccessor={yType === 'categorical' ? 'yCategory' : 'y'}
        valueAccessor="count"
        valueFormatter={(d) => `${Number(d.toFixed(0))}`}
        xScale={
          xType === 'linear'
            ? { type: ScaleType.Linear, interval, domain: useDomain ? { min, max } : undefined }
            : { type: ScaleType.Ordinal, sort: xType === 'ordinal' ? Predicate.NumAsc : Predicate.AlphaAsc }
        }
        // rows are ordered from top to bottom
        yScale={
          yType === 'linear'
            ? { type: ScaleType.Linear, interval: yInterval }
            : { type: ScaleType.Ordinal, sort: yType === 'ordinal' ? Predicate.NumDesc : Predicate.AlphaAsc }
        }
      />
    </Chart>
  );
};
