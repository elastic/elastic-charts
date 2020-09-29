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

import { boolean, select } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import { AreaSeries, Axis, BarSeries, Chart, CurveType, Position, ScaleType, Settings } from '../../src';

const getData = (data: number[], ykey?: string) =>
  data.map((y, i) => ({
    ...{ y: ykey ? { [ykey]: y } : y },
    x: {
      from: moment()
        .add(i, 'd')
        .valueOf(),
      to: moment()
        .add(i + 1, 'd')
        .valueOf(),
    },
  }));

const serializerMap = {
  none: undefined,
  stringify: JSON.stringify,
  simple: ({ from, to }: any) => `${moment(from).format('l')} - ${moment(to).format('l')}`,
};

export const Example = () => {
  const stacked = boolean('stacked', true);
  const serializerType = select<keyof typeof serializerMap>(
    'serializer',
    {
      None: 'none',
      Simple: 'simple',
      'JSON.stringify': 'stringify',
    },
    'simple',
  );
  const serializer = serializerMap[serializerType];

  return (
    <Chart renderer="canvas" className="story-chart">
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Bottom axis"
        style={{
          tickLabel: {
            rotation: -90,
          },
        }}
      />
      <Axis id="left" title="Left axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        stackAccessors={stacked ? ['x'] : undefined}
        xSerializer={serializer}
        ySerializer={({ value }) => value}
        data={getData([2, 7, 3, 6], 'value')}
      />
      <AreaSeries
        id="areas"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        stackAccessors={stacked ? ['x'] : undefined}
        curve={CurveType.CURVE_MONOTONE_X}
        xSerializer={serializer}
        data={getData([2.5, 7, 13, 6])}
      />
    </Chart>
  );
};
