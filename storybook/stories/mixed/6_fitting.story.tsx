/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, boolean, color, number, text } from '@storybook/addon-knobs';
import React from 'react';

import {
  AreaSeries,
  Axis,
  Chart,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  Fit,
  SeriesType,
  RecursivePartial,
} from '@elastic/charts';

import { ColorVariant } from '../../../packages/charts/src/utils/common';
import { AreaFitStyle, LineFitStyle, TextureShape } from '../../../packages/charts/src/utils/themes/theme';
import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

interface MixedDatum {
  x: number | string;
  y: number | string | null;
}

export const Example: ChartsStory = (_, { title, description }) => {
  const dataTypes: Record<string, MixedDatum[]> = {
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

  const seriesType = select<string>(
    'seriesType',
    {
      Area: SeriesType.Area,
      Line: SeriesType.Line,
    },
    SeriesType.Area,
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
  const baseTheme = useBaseTheme();

  const useSeriesColorLine = boolean('use series color for line', true, 'fit style');
  const customLineColor = color('fit line color', 'rgba(0,0,0,1)', 'fit style');

  const fitLineStyle: RecursivePartial<LineFitStyle> = {
    opacity: number(
      'fit line opacity',
      seriesType === SeriesType.Area
        ? baseTheme.areaSeriesStyle.fit.line.opacity
        : baseTheme.lineSeriesStyle.fit.line.opacity,
      {
        range: true,
        min: 0,
        max: 1,
        step: 0.05,
      },
      'fit style',
    ),
    stroke: useSeriesColorLine ? ColorVariant.Series : customLineColor,
    dash: text(
      'fit line dash array',
      (seriesType === SeriesType.Area
        ? baseTheme.areaSeriesStyle.fit.line.dash
        : baseTheme.lineSeriesStyle.fit.line.dash
      ).join(','),
      'fit style',
    )
      .split(',')
      .map(Number),
  };
  const useSeriesColor = boolean('use series color for area', true, 'fit style');
  const fitAreaCustomColor = color('fit area color', 'rgba(0,0,0,1)', 'fit style');
  const fitAreaOpacity = number(
    'fit area opacity',
    baseTheme.areaSeriesStyle.fit.area.opacity,
    {
      range: true,
      min: 0,
      max: baseTheme.areaSeriesStyle.area.opacity,
      step: 0.01,
    },
    'fit style',
  );
  const fitAreaStyle: RecursivePartial<AreaFitStyle> = {
    opacity: fitAreaOpacity,
    fill: useSeriesColor ? ColorVariant.Series : fitAreaCustomColor,
    texture: boolean('use texture on area', false, 'fit style')
      ? { shape: TextureShape.Line, rotation: -45, opacity: fitAreaOpacity }
      : undefined,
  };

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        showLegendExtra
        theme={{
          areaSeriesStyle: {
            point: {
              visible: true,
            },
          },
        }}
        baseTheme={baseTheme}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left" title="Left axis" position={Position.Left} />
      {seriesType === SeriesType.Area ? (
        <AreaSeries
          id="test"
          xScaleType={xScaleType}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          curve={curve}
          fit={{
            type: fit,
            value: fit === Fit.Explicit ? value : undefined,
            endValue: endValue === 'none' ? undefined : parsedEndValue,
          }}
          areaSeriesStyle={{
            fit: {
              line: fitLineStyle,
              area: fitAreaStyle,
            },
          }}
          data={dataset}
        />
      ) : (
        <LineSeries
          id="test"
          xScaleType={xScaleType}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          curve={curve}
          fit={{
            type: fit,
            value: fit === Fit.Explicit ? value : undefined,
            endValue: endValue === 'none' ? undefined : parsedEndValue,
          }}
          lineSeriesStyle={{
            fit: {
              line: fitLineStyle,
            },
          }}
          data={dataset}
        />
      )}
    </Chart>
  );
};
