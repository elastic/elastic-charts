/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, PartialTheme, LegendValue } from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { ChartsStory } from '../../types';
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

export const Example: ChartsStory = (_, { title, description }) => {
  const applyBarStyle = boolean('apply bar style (bar 1 series)', true, 'Chart Global Theme');
  const changeRectWidthPixel = boolean('enable custom rect width (px)', false, 'Bar width');
  const rectWidthPixel = range('rect width (px)', 0, 100, 30, 'Bar width', 1);
  const changeRectWidthRatio = boolean('enable custom rect width (ratio)', false, 'Bar width');
  const rectWidthRatio = range('rect width (ratio)', 0, 1, 0.5, 'Bar width', 0.01);
  const barSeriesStyle = {
    rectBorder: {
      stroke: color('border stroke', 'blue', 'Bar 1 Style'),
      strokeWidth: range('border strokeWidth', 0, 5, 2, 'Bar 1 Style', 0.1),
      visible: boolean('border visible', true, 'Bar 1 Style'),
    },
    rect: {
      fill: color('rect fill', '#22C61A', 'Bar 1 Style'),
      opacity: range('rect opacity', 0, 1, 0.3, 'Bar 1 Style', 0.1),
    },
  };

  const theme: PartialTheme = {
    barSeriesStyle: {
      rectBorder: {
        stroke: color('theme border stroke', 'red', 'Chart Global Theme'),
        strokeWidth: range('theme border strokeWidth', 0, 5, 2, 'Chart Global Theme', 0.1),
        visible: boolean('theme border visible', true, 'Chart Global Theme'),
      },
      rect: {
        opacity: range('theme opacity ', 0, 1, 0.9, 'Chart Global Theme', 0.1),
        widthPixel: changeRectWidthPixel ? rectWidthPixel : undefined,
        widthRatio: changeRectWidthRatio ? rectWidthRatio : undefined,
      },
    },
  };

  return (
    <Chart title={title} description={description} renderer="canvas">
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
        theme={theme}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bar 1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={TestDatasets.BARCHART_1Y0G}
        barSeriesStyle={applyBarStyle ? barSeriesStyle : undefined}
        name="bars 1"
      />
      <BarSeries
        id="bar 2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={TestDatasets.BARCHART_1Y0G}
        name="bars 2"
      />
    </Chart>
  );
};
