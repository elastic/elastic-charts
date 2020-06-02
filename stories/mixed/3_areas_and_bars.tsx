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

import { AreaSeries, Axis, BarSeries, Chart, CurveType, Position, ScaleType, Settings } from '../../src';

export const Example = () => (
  <Chart renderer="canvas" className="story-chart">
    <Settings showLegend showLegendExtra legendPosition={Position.Right} />
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
      stackAccessors={['x']}
      data={[
        { x: 0, y: 2 },
        { x: 1, y: 7 },
        { x: 2, y: 3 },
        { x: 3, y: 6 },
      ]}
      yScaleToDataExtent={false}
    />
    <AreaSeries
      id="areas"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      curve={CurveType.CURVE_MONOTONE_X}
      data={[
        { x: 0, y: 2.5 },
        { x: 1, y: 7 },
        { x: 2, y: 3 },
        { x: 3, y: 6 },
      ]}
      yScaleToDataExtent={false}
    />
  </Chart>
);
