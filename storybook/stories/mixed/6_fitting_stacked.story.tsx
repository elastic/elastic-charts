/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, number, boolean } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, Fit, StackMode } from '@elastic/charts';
import { getRandomNumberGenerator, getRNGSeed } from '@elastic/charts/src/mocks/utils';

import { TextureShape } from '../../../packages/charts/src/utils/themes/theme';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example = () => {
  const randomizeBoundingData = getRNGSeed() ? false : boolean('randomize bounding data', false);
  const dataTypes: Record<string, Array<{ x: number | string; y: number | null }>> = {
    isolated: [
      { x: 0, y: 3 },
      { x: 1, y: 5 },
      { x: 2, y: null },
      { x: 3, y: 4 },
      { x: 4, y: null },
      { x: 5, y: 5 },
      { x: 6, y: null },
      { x: 7, y: 12 },
      { x: 8, y: null },
      { x: 9, y: 10 },
      { x: 10, y: 7 },
    ],
    successive: [
      { x: 0, y: 3 },
      { x: 1, y: 5 },
      { x: 2, y: null },
      { x: 4, y: null },
      { x: 6, y: null },
      { x: 8, y: null },
      { x: 9, y: 10 },
      { x: 10, y: 7 },
    ],
    endPoints: [
      { x: 0, y: null },
      { x: 1, y: 5 },
      { x: 3, y: 4 },
      { x: 5, y: 5 },
      { x: 7, y: 12 },
      { x: 9, y: 10 },
      { x: 10, y: null },
    ],
    ordinal: [
      { x: 'a', y: null },
      { x: 'b', y: 3 },
      { x: 'c', y: 5 },
      { x: 'd', y: null },
      { x: 'e', y: 4 },
      { x: 'f', y: null },
      { x: 'g', y: 5 },
      { x: 'h', y: 6 },
      { x: 'i', y: null },
      { x: 'j', y: null },
      { x: 'k', y: null },
      { x: 'l', y: 12 },
      { x: 'm', y: null },
    ],
    all: [
      { x: 0, y: null },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: null },
      { x: 4, y: 4 },
      { x: 5, y: null },
      { x: 6, y: 5 },
      { x: 7, y: 6 },
      { x: 8, y: null },
      { x: 9, y: null },
      { x: 10, y: null },
      { x: 11, y: 12 },
      { x: 12, y: null },
    ],
  };

  const stackMode = select<StackMode | 'none'>(
    'stackMode',
    {
      Percentage: StackMode.Percentage,
      Silhouette: StackMode.Silhouette,
      Wiggle: StackMode.Wiggle,
      None: 'none',
    },
    'none',
  );

  const dataKey = select<keyof typeof dataTypes>(
    'dataset',
    {
      'Isolated Points': 'isolated',
      'Successive null Points': 'successive',
      'null end points': 'endPoints',
      'Ordinal x values': 'ordinal',
      'All edge cases': 'all',
    },
    'all',
  );

  const dataset = dataTypes[dataKey];
  const fit = customKnobs.enum.fit();
  const curve = customKnobs.enum.curve();
  const endValue = select<number | 'none' | 'nearest'>(
    'End value',
    {
      None: 'none',
      nearest: 'nearest',
      0: 0,
      2: 2,
    },
    'none',
  );
  const parsedEndValue: number | 'nearest' = Number.isNaN(Number(endValue)) ? 'nearest' : Number(endValue);
  const value = number('Explicit value (using Fit.Explicit)', 5);
  const xScaleType = dataKey === 'ordinal' ? ScaleType.Ordinal : ScaleType.Linear;
  const rngSeed = randomizeBoundingData ? undefined : getRNGSeed('__seed__');
  const rng = getRandomNumberGenerator(rngSeed);
  const tickFormat = stackMode === 'percentage' ? (d: any) => numeral(d).format('0[.]00%') : undefined;
  return (
    <Chart>
      <Settings
        showLegend
        legendExtra="lastBucket"
        theme={{
          areaSeriesStyle: {
            point: {
              visible: true,
            },
          },
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left" title="Left axis" position={Position.Left} tickFormat={tickFormat} />
      <AreaSeries
        id="test3"
        xScaleType={xScaleType}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        curve={curve}
        stackAccessors={['x']}
        fit={{
          type: fit,
          value: fit === Fit.Explicit ? value : undefined,
          endValue: endValue === 'none' ? undefined : parsedEndValue,
        }}
        data={dataset.map((d: any) => ({
          ...d,
          y: rng(2, 10),
        }))}
      />
      <AreaSeries
        id="test"
        xScaleType={xScaleType}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        stackMode={stackMode === 'none' ? undefined : stackMode}
        curve={curve}
        fit={{
          type: fit,
          value: fit === Fit.Explicit ? value : undefined,
          endValue: endValue === 'none' ? undefined : parsedEndValue,
        }}
        data={dataset}
        areaSeriesStyle={
          boolean('apply custom fit style', false)
            ? {
                fit: {
                  line: {
                    stroke: 'gray',
                    opacity: 0.5,
                  },
                  area: {
                    fill: 'gray',
                    texture: {
                      shape: TextureShape.Line,
                      rotation: -45,
                      opacity: 0.2,
                    },
                  },
                },
              }
            : undefined
        }
      />
      <AreaSeries
        id="test2"
        xScaleType={xScaleType}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        curve={curve}
        stackAccessors={['x']}
        fit={{
          type: fit,
          value: fit === Fit.Explicit ? value : undefined,
          endValue: endValue === 'none' ? undefined : parsedEndValue,
        }}
        data={dataset.map((d) => ({
          ...d,
          y: rng(2, 10),
        }))}
      />
    </Chart>
  );
};
