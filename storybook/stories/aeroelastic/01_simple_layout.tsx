/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { translate } from '@elastic/charts/src/common/aeroelastic/matrix';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Canvas, shapeToElementForReal } from '@elastic/charts/src/common/aeroelastic/mini_canvas/view_components';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-duplicates
import { componentLayoutState } from '@elastic/charts/src/common/aeroelastic/mini_canvas/workpad_interactive_page';

// eslint-disable-next-line import/no-duplicates
// import { LayoutAnnotation } from '@elastic/charts/src/common/aeroelastic/mini_canvas/workpad_interactive_page';
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

const elements = [
  {
    id: 'sampleElement0',
    position: { left: 310, top: 200, width: 520, height: 400, angle: 0, parent: null, type: 'element' },
  },
  {
    id: 'sampleElement1',
    position: { left: 30, top: 420, width: 260, height: 400, angle: 0, parent: null, type: 'element' },
  },
  {
    id: 'sampleElement2',
    position: { left: 60, top: 60, width: 520, height: 200, angle: 0, parent: null, type: 'element' },
  },
];

const store = componentLayoutState({
  aeroStore: undefined,
  setAeroStore: () => {},
  elements,
  selectedToplevelNodes: [],
  height: 800,
  width: 800,
});

export const Example = () => <Canvas store={store} charts={charts}></Canvas>;

Example.parameters = {
  background: { default: 'white' },
};
