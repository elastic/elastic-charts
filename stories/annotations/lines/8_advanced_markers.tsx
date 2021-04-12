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

import { EuiIcon } from '@elastic/eui';
import { boolean, number } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import {
  Chart,
  Axis,
  Settings,
  HistogramBarSeries,
  Position,
  ScaleType,
  LineAnnotation,
  AnnotationDomainType,
} from '../../../src';

export const Example = () => {
  const days = 30;
  const start = moment('4/1/2020').startOf('d');
  const debug = boolean('Debug', true);
  const showLegend = boolean('show legend', true);
  const hour = number('Annotation day', days, { step: 1, min: 0, max: days, range: true });
  return (
    <Chart className="story-chart">
      <Settings debug={debug} showLegend={showLegend} />
      <Axis id="count" integersOnly position={Position.Left} />
      <Axis
        id="x"
        style={{ tickLine: { padding: 30 } }}
        title="time"
        tickFormat={(d) => moment(d).format('L')}
        position={Position.Bottom}
      />
      <LineAnnotation
        id="annotation_1"
        domainType={AnnotationDomainType.XDomain}
        dataValues={[{ dataValue: start.clone().add(hour, 'd').valueOf() }]}
        style={{
          line: {
            strokeWidth: 1,
            stroke: 'red',
            opacity: 1,
          },
        }}
        markerPosition={Position.Bottom}
        hideTooltips
        marker={<EuiIcon type="arrowUp" />}
        markerBody={({ dataValue }) => <div>{moment(dataValue).format('lll')}</div>}
      />
      <HistogramBarSeries
        id="bars"
        xScaleType={ScaleType.Time}
        data={Array.from({ length: days })
          .fill(0)
          .map((_, i) => ({ x: start.clone().add(i, 'd').valueOf(), y: 1 }))}
      />
    </Chart>
  );
};
