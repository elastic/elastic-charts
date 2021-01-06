/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  SeriesIdentifier,
  Settings,
  XYChartSeriesIdentifier,
} from '../../src';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';
import { SB_SOURCE_PANEL } from '../utils/storybook';

function getGroups(a: SeriesIdentifier, b: SeriesIdentifier) {
  // we can cast the SeriesIdentifier to the XYChartSeriesIdentifier safely since we know that we are using
  // only XY series on our chart in this example
  const { splitAccessors: aSplit, yAccessor: aYAccessor, specId: specIdA } = a as XYChartSeriesIdentifier;
  const { splitAccessors: bSplit, yAccessor: bYAccessor, specId: specIdB } = b as XYChartSeriesIdentifier;
  const aGroup = `${aSplit.get('g') ?? ''}`;
  const bGroup = `${bSplit.get('g') ?? ''}`;
  return { aGroup, bGroup, aYAccessor: `${aYAccessor}`, bYAccessor: `${bYAccessor}`, specIdA, specIdB };
}

// sort ascending by group and yAccessor (a,y1)(a,y2)(b,y1)(b,y2)
function compareSeriesFn(a: SeriesIdentifier, b: SeriesIdentifier) {
  const { aGroup, bGroup, aYAccessor, bYAccessor, specIdA, specIdB } = getGroups(a, b);
  if (aGroup === bGroup) {
    return aYAccessor.localeCompare(bYAccessor);
  }
  if (specIdA === specIdB && specIdA === 'stacked') {
    return bGroup.localeCompare(aGroup);
  }
  return aGroup.localeCompare(bGroup);
}

export const Example = () => (
  <Chart className="story-chart">
    <Settings showLegend showLegendExtra />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />
    <BarSeries
      id="series1"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      splitSeriesAccessors={['g']}
      stackAccessors={['x']}
      data={[
        { x: 0, g: 'Group1StackA', y: 1 },
        { x: 0, g: 'Group1StackB', y: 2 },
      ]}
    />

    <BarSeries
      id="series2"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y1', 'y2']}
      splitSeriesAccessors={['g']}
      data={TestDatasets.BARCHART_2Y1G.slice(0, 2)}
    />

    <BarSeries
      id="series3"
      groupId="group2"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      splitSeriesAccessors={['g']}
      stackAccessors={['x']}
      data={[
        { x: 0, g: 'Group2StackA', y: 1 },
        { x: 0, g: 'Group2StackB', y: 2 },
      ]}
    />
  </Chart>
);

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
