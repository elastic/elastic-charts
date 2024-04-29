/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { text } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, LegendValue, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const data: Array<[number, string, number]> = [
    [2010, 'Apple', 10],
    [2010, 'Orange', 6],
    [2010, 'Banana', 4],
    [2011, 'Apple', 9],
    [2011, 'Orange', 6],
    [2011, 'Banana', 2],
    [2012, 'Apple', 7],
    [2012, 'Orange', 3],
    [2012, 'Banana', 3],
    [2013, 'Apple', 12],
    [2013, 'Orange', 10],
    [2013, 'Banana', 5],
  ];

  const onShownClickText = text('onShownClickLabel', 'Click: isolate series');
  const onHiddenClickText = text('onHiddenClickLabel', 'Click: show all series');
  const onShownShiftClickText = text('onShownShiftClickLabel', 'SHIFT + click: hide series');
  const onHiddenShifText = text('onHiddenShiftClickLabel', 'SHIFT + click: show series');
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendItemLabels={{
          onShownClick: onShownClickText,
          onHiddenClick: onHiddenClickText,
          onShownShiftClick: onShownShiftClickText,
          onHiddenShiftClick: onHiddenShifText,
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[2]}
        splitSeriesAccessors={[1]}
        stackAccessors={[0]}
        data={data}
        yNice
      />
    </Chart>
  );
};
