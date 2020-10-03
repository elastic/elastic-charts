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
import { select, boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, RectAnnotation, ScaleType, Settings } from '../../../src';
import { Position } from '../../../src/utils/commons';

const getKnobs = (group: string) => ({
  enabled: boolean('Enable annotation', group === 'x axis', group),
  groupId:
    select('Annotation groupId', { group1: 'group1', group2: 'group2', none: undefined }, 'group1', group) || undefined,
  x0: group === 'x axis' ? number('x0', 5, {}, group) : undefined,
  x1: group === 'x axis' ? number('x1', 10, {}, group) : undefined,
  y0: group === 'y axis' ? number('y0', 5, {}, group) : undefined,
  y1: group === 'y axis' ? number('y1', 10, {}, group) : undefined,
});
export const Example = () => {
  const xAxisKnobs = getKnobs('x axis');
  const yAxisKnobs = getKnobs('y axis');

  return (
    <Chart className="story-chart">
      {xAxisKnobs.enabled && (
        <RectAnnotation
          groupId={xAxisKnobs.groupId}
          id="x axis"
          dataValues={[{ coordinates: xAxisKnobs }]}
          style={{ fill: 'red' }}
        />
      )}
      {yAxisKnobs.enabled && (
        <RectAnnotation
          groupId={yAxisKnobs.groupId}
          id="y axis"
          // xAxis coordinates are required
          dataValues={[{ coordinates: yAxisKnobs }]}
          style={{ fill: 'red' }}
        />
      )}
      <Settings />
      <Axis id="bottom" groupId="group2" position={Position.Bottom} title="Bottom (groupId=group2)" />
      <Axis id="left" groupId="group1" position={Position.Left} title="Left (groupId=group1)" />
      <Axis id="top" groupId="group1" position={Position.Top} title="Top (groupId=group1)" />
      <Axis id="right" groupId="group2" position={Position.Right} title="Right (groupId=group2)" />
      <BarSeries
        id="bars"
        groupId="group1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 5 },
          { x: 5, y: 1 },
          { x: 20, y: 10 },
        ]}
      />
      <BarSeries
        id="bars1"
        groupId="group2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 61 },
          { x: 5, y: 43 },
          { x: 20, y: 49 },
        ]}
      />
    </Chart>
  );
};
