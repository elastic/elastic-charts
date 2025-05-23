/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import type { PartialTheme } from '@elastic/charts';
import {
  AreaSeries,
  Axis,
  BarSeries,
  Chart,
  CurveType,
  DEFAULT_MISSING_COLOR,
  LegendValue,
  LineSeries,
  Position,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';
import { BOREALIS_COLORS_PALETTE } from '@elastic/charts/src/utils/themes/borealis_colors';
import { palettes } from '@elastic/charts/src/utils/themes/legacy_colors';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

function range(title: string, min: number, max: number, value: number, groupId?: string, step = 1) {
  return number(
    title,
    value,
    {
      range: true,
      min,
      max,
      step,
    },
    groupId,
  );
}

const dg = new SeededDataGenerator();
const data1 = dg.generateGroupedSeries(40, 4);
const data2 = dg.generateSimpleSeries(40);
const data3 = dg.generateSimpleSeries(40);

export const Example: ChartsStory = (_, { title, description }) => {
  const customizeLineStroke = boolean('customizeLineStroke', false, 'line');
  const customizePointStroke = boolean('customizeLinePointStroke', false, 'line');
  const customizeAreaFill = boolean('customizeAreaFill', false, 'area');
  const customizeAreaLineStroke = boolean('customizeAreaLineStroke', false, 'area');
  const customizeRectFill = boolean('customizeRectFill', false, 'bar');
  const theme: PartialTheme = {
    chartMargins: {
      left: range('margin left', 0, 50, 10, 'Margins'),
      right: range('margin right', 0, 50, 10, 'Margins'),
      top: range('margin top', 0, 50, 10, 'Margins'),
      bottom: range('margin bottom', 0, 50, 10, 'Margins'),
    },
    chartPaddings: {
      left: range('padding left', 0, 50, 10, 'Paddings'),
      right: range('padding right', 0, 50, 10, 'Paddings'),
      top: range('padding top', 0, 50, 10, 'Paddings'),
      bottom: range('padding bottom', 0, 50, 10, 'Paddings'),
    },
    lineSeriesStyle: {
      line: {
        stroke: customizeLineStroke ? color('customLineStroke', 'red', 'line') : undefined,
        strokeWidth: range('lineStrokeWidth', 0, 10, 1, 'line'),
        visible: boolean('lineVisible', true, 'line'),
      },
      point: {
        visible: boolean('linePointVisible', true, 'line') ? 'always' : 'never',
        radius: range('linePointRadius', 0, 20, 1, 'line', 0.5),
        fill: color('linePointFill', 'white', 'line'),
        stroke: customizePointStroke ? color('customLinePointStroke', 'red', 'line') : undefined,
        strokeWidth: range('linePointStrokeWidth', 0, 20, 0.5, 'line'),
        opacity: range('linePointOpacity', 0, 1, 1, 'line', 0.01),
      },
    },
    areaSeriesStyle: {
      area: {
        fill: customizeAreaFill ? color('customAreaFill', 'red', 'area') : undefined,
        visible: boolean('aAreaVisible', true, 'area'),
        opacity: range('aAreaOpacity', 0, 1, 1, 'area'),
      },
      line: {
        stroke: customizeAreaLineStroke ? color('customAreaLineStroke', 'red', 'area') : undefined,
        strokeWidth: range('aStrokeWidth', 0, 10, 1, 'area'),
        visible: boolean('aLineVisible', true, 'area'),
      },
      point: {
        visible: boolean('aPointVisible', true, 'area') ? 'always' : 'never',
        fill: color('aPointFill', 'white', 'area'),
        radius: range('aPointRadius', 0, 20, 1, 'area'),
        stroke: color('aPointStroke', 'white', 'area'),
        strokeWidth: range('aPointStrokeWidth', 0, 20, 0.5, 'area'),
        opacity: range('aPointOpacity', 0, 1, 0.01, 'area'),
      },
    },
    barSeriesStyle: {
      rect: {
        fill: customizeRectFill ? color('recCustomFull', 'red', 'bar') : undefined,
        opacity: range('rectOpacity', 0, 1, 0.5, 'bar', 0.1),
      },
      rectBorder: {
        stroke: color('bBorderStroke', 'white', 'bar'),
        strokeWidth: range('bStrokeWidth', 0, 10, 1, 'bar'),
        visible: boolean('bBorderVisible', true, 'bar'),
      },
    },
    sharedStyle: {
      default: {
        opacity: range('sOpacity', 0, 1, 1, 'Shared', 0.05),
      },
      highlighted: {
        opacity: range('sHighlighted', 0, 1, 1, 'Shared', 0.05),
      },
      unhighlighted: {
        opacity: range('sUnhighlighted', 0, 1, 0.25, 'Shared', 0.05),
      },
    },
    colors: {
      vizColors: select(
        'vizColors',
        {
          colorBlind: BOREALIS_COLORS_PALETTE,
          darkBackground: palettes.echPaletteForDarkBackground.colors,
          lightBackground: palettes.echPaletteForLightBackground.colors,
          forStatus: palettes.echPaletteForStatus.colors,
        },
        BOREALIS_COLORS_PALETTE,
        'Colors',
      ),
      defaultVizColor: DEFAULT_MISSING_COLOR,
    },
  };

  return (
    <Chart title={title} description={description}>
      <Settings
        theme={theme}
        baseTheme={useBaseTheme()}
        debug={boolean('debug', false)}
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <Axis id="top" position={Position.Top} title="Top axis" showOverlappingTicks />
      <Axis id="right" title="Right axis" position={Position.Right} tickFormat={(d) => Number(d).toFixed(2)} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        stackAccessors={['x']}
        data={data1}
      />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        curve={CurveType.CURVE_MONOTONE_X}
        data={data2}
      />
      <AreaSeries
        id="areas"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        curve={CurveType.CURVE_MONOTONE_X}
        data={data3}
      />
    </Chart>
  );
};
