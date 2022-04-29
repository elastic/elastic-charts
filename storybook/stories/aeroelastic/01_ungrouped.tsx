/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Canvas } from '@elastic/charts/src/common/aeroelastic/mini_canvas/view_components';

import { Example as TimeslipExample } from '../area/21_with_time_timeslip.story';

const charts = (
  <>
    <div />
    <TimeslipExample />
  </>
);

const chartDescriptors = [
  {
    id: 'group_chart',
    group: true,
    position: { left: 140, top: 160, width: 800, height: 300, angle: 0, parent: null },
  },
  {
    id: 'timeslip',
    position: { left: 140, top: 160, width: 800, height: 300, angle: 0, parent: 'group_chart' },
  },
];

export const Example = () => <Canvas charts={charts} chartDescriptors={chartDescriptors}></Canvas>;

Example.parameters = {
  background: { default: 'white' },
};
