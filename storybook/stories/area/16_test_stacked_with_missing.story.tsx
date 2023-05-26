/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, CurveType, AreaSeries, Position, Axis, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings baseTheme={useBaseTheme()} />
    <Axis id="bottom" position={Position.Bottom} />
    <Axis id="left" position={Position.Left} />
    <AreaSeries
      id="path-order"
      xScaleType={ScaleType.Ordinal}
      yScaleType={ScaleType.Linear}
      xAccessor="col-0-3"
      yAccessors={['col-2-5']}
      data={data}
      curve={CurveType.CURVE_CATMULL_ROM}
      splitSeriesAccessors={['col-1-6']}
      stackAccessors={['col-1-6']}
      areaSeriesStyle={{
        point: { visible: true },
      }}
    />
  </Chart>
);

const data = [
  {
    'col-0-3': 'ZRH',
    'col-1-6': 'Logstash Airways',
    'col-2-5': 27,
  },
  {
    'col-0-3': 'ZRH',
    'col-1-6': 'Kibana Airlines',
    'col-2-5': 38,
  },
  {
    'col-0-3': 'ZRH',
    'col-1-6': 'JetBeats',
    'col-2-5': 26,
  },
  {
    'col-0-3': 'ZRH',
    'col-1-6': 'ES-Air',
    'col-2-5': 33,
  },
  {
    'col-0-3': 'YYZ',
    'col-1-6': 'Kibana Airlines',
    'col-2-5': 5,
  },
  {
    'col-0-3': 'YYZ',
    'col-1-6': 'JetBeats',
    'col-2-5': 7,
  },
  {
    'col-0-3': 'YYZ',
    'col-1-6': 'ES-Air',
    'col-2-5': 4,
  },
  {
    'col-0-3': 'YWG',
    'col-1-6': 'ES-Air',
    'col-2-5': 10,
  },
  {
    'col-0-3': 'YWG',
    'col-1-6': 'Logstash Airways',
    'col-2-5': 17,
  },
  {
    'col-0-3': 'YWG',
    'col-1-6': 'Kibana Airlines',
    'col-2-5': 19,
  },
  {
    'col-0-3': 'YUL',
    'col-1-6': 'Logstash Airways',
    'col-2-5': 4,
  },
  {
    'col-0-3': 'YUL',
    'col-1-6': 'Kibana Airlines',
    'col-2-5': 7,
  },
  {
    'col-0-3': 'YUL',
    'col-1-6': 'JetBeats',
    'col-2-5': 4,
  },
  {
    'col-0-3': 'YUL',
    'col-1-6': 'ES-Air',
    'col-2-5': 13,
  },
  {
    'col-0-3': 'YOW',
    'col-1-6': 'Logstash Airways',
    'col-2-5': 11,
  },
  {
    'col-0-3': 'YOW',
    'col-1-6': 'Kibana Airlines',
    'col-2-5': 6,
  },
  {
    'col-0-3': 'YOW',
    'col-1-6': 'ES-Air',
    'col-2-5': 14,
  },
];
