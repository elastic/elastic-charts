/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  LineSeriesStyle,
  RecursivePartial,
} from '@elastic/charts';

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
      visible: boolean(`point.visible (${tag})`, true, groupName),
      radius: range(`point.radius (${tag})`, 0, 20, pointRadius || 5, groupName, 0.5),
      opacity: range(`point.opacity (${tag})`, 0, 1, 1, groupName, 0.01),
      stroke: color(`point.stroke (${tag})`, pointStroke || 'black', groupName),
      fill: color(`point.fill (${tag})`, pointFill || 'lightgray', groupName),
      strokeWidth: range(`point.strokeWidth (${tag})`, 0, 5, pointStrokeWidth || 2, groupName, 0.01),
    },
  };
}

export const Example = () => {
  const applyLineStyles = boolean('apply line series style', true, 'Chart Global Theme');
  const lineSeriesStyle1 = generateLineAndPointSeriesStyleKnobs('Line 1 style', 'line1', 'lime', 'green', 4, 10, 6);
  const lineSeriesStyle2 = generateLineAndPointSeriesStyleKnobs('Line 2 style', 'line2', 'blue', 'violet', 2, 5, 4);

  const chartTheme = {
    lineSeriesStyle: generateLineAndPointSeriesStyleKnobs('Chart Global Theme', 'chartTheme'),
  };

  const dataset1 = [
    { x: 0, y: 3 },
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 10 },
  ];
  const dataset2 = dataset1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const dataset3 = dataset1.map((datum) => ({ ...datum, y: datum.y - 2 }));

  return (
    <Chart renderer="canvas">
      <Settings
        showLegend
        legendValue="lastBucket"
        legendPosition={Position.Right}
        theme={chartTheme}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />
      <LineSeries
        id="lines1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={dataset1}
        lineSeriesStyle={applyLineStyles ? lineSeriesStyle1 : undefined}
      />
      <LineSeries
        id="lines2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={dataset2}
        lineSeriesStyle={applyLineStyles ? lineSeriesStyle2 : undefined}
      />
      <LineSeries
        id="lines3"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={dataset3}
      />
    </Chart>
  );
};
