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
import { boolean } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import React from 'react';

import {
  ScaleType,
  Position,
  Chart,
  Axis,
  GroupBy,
  SmallMultiples,
  Settings,
  BarSeries,
  LineAnnotation,
  AnnotationDomainTypes,
  LIGHT_THEME,
} from '../../src';
import { SeededDataGenerator } from '../../src/mocks/utils';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const dg = new SeededDataGenerator();
const numOfDays = 7;
function generateData() {
  return dg.generateGroupedSeries(numOfDays, 2).map((d) => {
    return {
      ...d,
      x: DateTime.fromFormat(`${d.x + 1}`, 'E').toFormat('EEEE'),
      y: Math.floor(d.y * 10),
      g: d.g === 'a' ? 'new user' : 'existing user',
    };
  });
}
const data1 = generateData();
const data2 = generateData();
const data3 = generateData();

export const Example = () => {
  const marker = (
    <span
      style={{
        backgroundColor: 'lightgray',
        padding: 2,
        width: 30,
        height: 10,
        margin: 'auto',
        fontSize: 8,
        borderRadius: 2,
      }}
    >
      MIN
    </span>
  );
  const showLegend = boolean('Show Legend', false);

  return (
    <Chart className="story-chart">
      <Settings rotation={90} showLegend={showLegend} />
      <Axis id="time" title="metric" position={Position.Bottom} gridLine={{ visible: false }} />
      <Axis id="y" title="Day of week" position={Position.Left} gridLine={{ visible: false }} />

      <GroupBy
        id="h_split"
        by={(spec) => {
          return spec.id;
        }}
        sort="alphaAsc"
      />
      <SmallMultiples splitHorizontally="h_split" />
      <LineAnnotation
        dataValues={[
          {
            dataValue: 100,
            details: 'Minimum # of connected users',
          },
        ]}
        id="threshold"
        domainType={AnnotationDomainTypes.YDomain}
        marker={marker}
        style={{
          line: {
            dash: [5, 10],
            stroke: 'black',
            opacity: 0.8,
            strokeWidth: 1,
          },
        }}
      />
      <BarSeries
        id="website a"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={data1}
        color={[LIGHT_THEME.colors.vizColors[0], 'lightgray']}
      />
      <BarSeries
        id="website b"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={data2}
        color={[LIGHT_THEME.colors.vizColors[0], 'lightgray']}
      />
      <BarSeries
        id="website c"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={data3}
        color={[LIGHT_THEME.colors.vizColors[0], 'lightgray']}
      />
    </Chart>
  );
};
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
    info: {
      text: `Similarly to the Vertical Areas example, the above chart shows an example of small multiples technique
that splits our dataset into multiple sub-series horizontally positioned one aside the other.
In this case, the \`<GroupBy />\` id is used to specify the horizontal split via the \`splitHorizontally\` prop.

As for single charts, we can merge and handle multiple data-series together and specify a \`by\` accessor to consider
the specific case. An additional property \`sort\` is available to configure the sorting order of the vertical or
horizontal split.
`,
    },
  },
};
