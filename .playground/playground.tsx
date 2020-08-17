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
  LineSeries,
  Axis,
  Chart,
  IndexOrder,
  SmallMultiples,
  Position,
  ScaleType,
  Settings,
  DataGenerator,
} from '../src';

const dg = new DataGenerator();

const data = dg.generateGroupedSeries(50, 9).map(({ x, y, g }) => {
  switch (g) {
    case 'a':
      return { x, y, v: 'a', h: 1 };
    case 'b':
      return { x, y, v: 'b', h: 1 };
    case 'c':
      return { x, y, v: 'c', h: 1 };
    case 'd':
      return { x, y, v: 'a', h: 2 };
    case 'e':
      return { x, y, v: 'b', h: 2 };
    case 'f':
      return { x, y, v: 'c', h: 2 };
    case 'g':
      return { x, y, v: 'a', h: 3 };
    case 'h':
      return { x, y, v: 'b', h: 3 };
    case 'i':
      return { x, y, v: 'c', h: 3 };
    default:
      return { x, y, v: 'x', h: -2 };
  }
});

export const Playground = () => (
  <Chart className="chart">
    <Settings
      showLegend
      showLegendExtra
      legendPosition={Position.Right}
      theme={{
        lineSeriesStyle: {
          point: { visible: false },
        },
      }}
    />
    <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
    <Axis id="Y1" title="Y1" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

    <IndexOrder
      id="verticalGrid"
      by={(spec, datum: any) => {
        return [datum.v];
      }}
      order={['alphaDesc', 'alphaAsc']}
    />

    <IndexOrder
      id="horizontalGrid"
      by={(spec, datum: any) => {
        return [datum.h];
      }}
      order={['alphaDesc', 'alphaAsc']}
    />

    <SmallMultiples verticalIndex="verticalGrid" horizontalIndex="horizontalGrid" />

    <LineSeries
      id="bars1"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      data={data}
    />
  </Chart>
);
