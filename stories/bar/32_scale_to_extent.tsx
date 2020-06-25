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

import { boolean, select, text } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType } from '../../src';
import { computeContinuousDataDomain } from '../../src/utils/domain';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const logDomains = (data: any[], customDomain: any) => {
  /* eslint-disable no-console */
  console.clear();
  console.log('data domain:', JSON.stringify(computeContinuousDataDomain(data, (d) => d.y)));
  console.log('computed domain:', JSON.stringify(computeContinuousDataDomain(data, (d) => d.y, customDomain)));
  /* eslint-enable */
};

export const Example = () => {
  const yScaleToDataExtent = boolean('yScaleDataToExtent', false);
  const fit = boolean('fit Y domain to data', true);
  const constrainPadding = boolean('constrain padding', true);
  const padding = text('domain padding', '0');
  const mixed = [
    { x: 0, y: -4 },
    { x: 1, y: -3 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
  ];

  const allPositive = mixed.map((datum) => ({ x: datum.x, y: Math.abs(datum.y) }));
  const allNegative = mixed.map((datum) => ({ x: datum.x, y: Math.abs(datum.y) * -1 }));

  const dataChoice = select(
    'data',
    {
      mixed: 'mixed',
      allPositive: 'all positive',
      allNegative: 'all negative',
    },
    'all negative',
  );
  const shouldLogDomains = boolean('console log domains', true);

  let data;
  switch (dataChoice) {
    case 'all positive':
      data = allPositive;
      break;
    case 'all negative':
      data = allNegative;
      break;
    default:
      data = mixed;
  }
  const customDomain = { fit, padding, constrainPadding };

  if (shouldLogDomains) {
    logDomains(data, customDomain);
  }

  return (
    <Chart className="story-chart">
      <Axis id="top" position={Position.Top} title="Top axis" />
      <Axis
        id="left2"
        domain={customDomain}
        title="Left axis"
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        data={data}
        yScaleToDataExtent={yScaleToDataExtent}
      />
    </Chart>
  );
};

Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
    info: {
      text: '`yScaleToDataExtent` has been **depricated** in favor of `domain.fit`. The functionality is identical between the two.',
    },
  },
};
