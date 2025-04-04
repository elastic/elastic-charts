/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';

import type { LineSeriesStyle, PartialTheme, RecursivePartial } from '@elastic/charts';
import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, LegendValue } from '@elastic/charts';

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

function generateLineAndPointSeriesStyleKnobs(
  groupName: string,
  tag: string,
  pointFill?: string,
  pointStroke?: string,
  pointStrokeWidth?: number,
  pointRadius?: number,
  lineStrokeWidth?: number,
  lineStroke?: string,
): RecursivePartial<LineSeriesStyle> {
  return {
    line: {
      stroke: lineStroke ? color(`line.stroke (${tag})`, lineStroke, groupName) : undefined,
      strokeWidth: range(`line.strokeWidth (${tag})`, 0, 10, lineStrokeWidth || 1, groupName),
      visible: boolean(`line.visible (${tag})`, true, groupName),
      opacity: range(`line.opacity (${tag})`, 0, 1, 1, groupName, 0.01),
    },
    point: {
      visible: boolean(`point.visible (${tag})`, true, groupName) ? 'always' : 'never',
      radius: range(`point.radius (${tag})`, 0, 20, pointRadius || 5, groupName, 0.5),
      opacity: range(`point.opacity (${tag})`, 0, 1, 1, groupName, 0.01),
      stroke: color(`point.stroke (${tag})`, pointStroke || 'black', groupName),
      fill: color(`point.fill (${tag})`, pointFill || 'lightgray', groupName),
      strokeWidth: range(`point.strokeWidth (${tag})`, 0, 50, pointStrokeWidth || 2, groupName, 0.01),
    },
  };
}

function generateAreaSeriesStyleKnobs(
  groupName: string,
  tag: string,
  pointFill?: string,
  pointStroke?: string,
  pointStrokeWidth?: number,
  pointRadius?: number,
  lineStrokeWidth?: number,
  lineStroke?: string,
  areaFill?: string,
) {
  return {
    ...generateLineAndPointSeriesStyleKnobs(
      groupName,
      tag,
      pointFill,
      pointStroke,
      pointStrokeWidth,
      pointRadius,
      lineStrokeWidth,
      lineStroke,
    ),
    area: {
      fill: areaFill ? color(`area.fill (${tag})`, areaFill, groupName) : undefined,
      visible: boolean(`area.visible (${tag})`, true, groupName),
      opacity: range(`area.opacity (${tag})`, 0, 1, 0.8, groupName, 0.01),
    },
  };
}

export const Example: ChartsStory = (_, { title, description }) => {
  const applyLineStyles = boolean('apply line series style', true, 'Chart Global Theme');

  const chartTheme: PartialTheme = {
    areaSeriesStyle: generateAreaSeriesStyleKnobs('Chart Global Theme', 'chartTheme'),
  };

  const dataset1 = [
    { x: 0, y: 3 },
    { x: 1, y: 6 },
    { x: 2, y: 4 },
    { x: 3, y: 10 },
  ];
  const dataset2 = dataset1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const dataset3 = dataset1.map((datum) => ({ ...datum, y: datum.y - 2 }));

  const areaStyle1 = generateAreaSeriesStyleKnobs('Area 1 Style', 'area1', 'lime', 'green', 4, 10, 6, 'black');
  const areaStyle2 = generateAreaSeriesStyleKnobs('Area 2 Style', 'area2', 'blue', 'violet', 2, 5, 4, undefined, 'red');

  return (
    <Chart title={title} description={description} renderer="canvas">
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
        theme={chartTheme}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <AreaSeries
        id="area1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={dataset1}
        areaSeriesStyle={applyLineStyles ? areaStyle1 : undefined}
      />
      <AreaSeries
        id="area2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={dataset2}
        areaSeriesStyle={applyLineStyles ? areaStyle2 : undefined}
      />
      <AreaSeries
        id="area3"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={dataset3}
      />
    </Chart>
  );
};
