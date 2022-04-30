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
    <div
      role="presentation"
      tabIndex={0}
      onKeyPress={(keyEvent: KeyboardEvent) => {
        //keyEvent.stopPropagation();
        //keyEvent.preventDefault();
        console.log(keyEvent.key);
      }}
      style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
    >
      <input
        type="text"
        defaultValue="time (1-minute measurements)"
        readOnly={false}
        disabled={false}
        id="name"
        name="name"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          fontFamily: '"Atkinson Hyperlegible"',
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'rgb(108, 108, 108)',
          textAlign: 'center',
        }}
        minLength={4}
        maxLength={80}
        size={30}
      />
    </div>
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
  {
    id: 'xLabel',
    position: { left: 400, top: 426, width: 330, height: 28, angle: 0, parent: null },
  },
];

export const Example = () => <Canvas charts={charts} chartDescriptors={chartDescriptors}></Canvas>;

Example.parameters = {
  background: { default: 'white' },
};
