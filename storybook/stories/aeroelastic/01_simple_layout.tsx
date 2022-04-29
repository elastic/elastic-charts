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
import { Example as SmallMultiplesExample } from '../small_multiples/6_heterogeneous_cartesians.story';
import { Example as TreemapExample } from '../treemap/2_one_layer_2.story';

const charts = (
  <>
    <SmallMultiplesExample />
    <TreemapExample />
    <TimeslipExample />
  </>
);

const chartDescriptors = [
  {
    id: 'sampleElement0',
    position: { left: 310, top: 200, width: 520, height: 400, angle: 0, parent: null },
  },
  {
    id: 'sampleElement1',
    position: { left: 30, top: 420, width: 260, height: 400, angle: 0, parent: null },
  },
  {
    id: 'sampleElement2',
    position: { left: 60, top: 60, width: 520, height: 200, angle: 0, parent: null },
  },
];

export const Example = () => <Canvas charts={charts} chartDescriptors={chartDescriptors}></Canvas>;

Example.parameters = {
  background: { default: 'white' },
};
