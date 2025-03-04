/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { XYChartSeriesIdentifier } from '../../../packages/charts/src/chart_types/xy_chart/utils/series';
import type { SeriesIdentifier } from '../../../packages/charts/src/common/series_id';
import type { ChartsStory } from '../../types';
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
  // the sorting value can be part of the dataset or externally defined
  const categoricalIndex: Array<unknown> = ['Apple', 'Orange', 'Banana'];

  const reverseSort = boolean('reverse', true);
  const defaultSort = boolean('default sort', false);

  const legendSort = (a: SeriesIdentifier, b: SeriesIdentifier) => {
    // extract the value from the accessors to identify the current selected series
    // the SeriesIdentifier can be casted to the chart type specific one
    const categoryA = (a as XYChartSeriesIdentifier)?.splitAccessors?.get(1) ?? '';
    const categoryB = (b as XYChartSeriesIdentifier)?.splitAccessors?.get(1) ?? '';
    // find the index of each series
    const catAIndex = categoricalIndex.indexOf(categoryA);
    const catBIndex = categoricalIndex.indexOf(categoryB);
    // compare the indices and return the order
    return reverseSort ? catAIndex - catBIndex : catBIndex - catAIndex;
  };
  return (
    <Chart title={title} description={description}>
      <Settings showLegend baseTheme={useBaseTheme()} legendSort={defaultSort ? undefined : legendSort} />
      <Axis id="bottom" position={Position.Bottom} title="[2010-2013] harvest" showOverlappingTicks />
      <Axis id="left2" position={Position.Left} ticks={4} tickFormat={(d) => `${d} tons`} />

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
