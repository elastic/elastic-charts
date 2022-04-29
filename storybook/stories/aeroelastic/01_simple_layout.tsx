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

const store = componentLayoutState({
  aeroStore: undefined,
  setAeroStore: () => {},
  elements: [
    {
      id: 'sampleElement0',
      type: 'rectangleElement',
      subtype: '',
      parent: null,
      transformMatrix: translate(570, 400, 0),
      a: 260,
      b: 200,
    },
    {
      id: 'sampleElement1',
      type: 'rectangleElement',
      subtype: '',
      parent: null,
      transformMatrix: translate(160, 620, 0),
      a: 130,
      b: 200,
    },
    {
      id: 'sampleElement2',
      type: 'rectangleElement',
      subtype: '',
      parent: null,
      transformMatrix: translate(320, 160, 0),
      a: 260,
      b: 100,
    },
  ].map(shapeToElementForReal),
  selectedToplevelNodes: [],
  height: 800,
  width: 800,
});

export const Example = () => <Canvas store={store} charts={charts}></Canvas>;

Example.parameters = {
  background: { default: 'white' },
};
