/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype } from '@elastic/charts';

import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example = () => {
  const subtype = getKnobFromEnum('subtype', BulletGraphSubtype, BulletGraphSubtype.horizontal);
  return (
    <div
      style={{
        resize: 'both',
        padding: '0px',
        overflow: 'auto',
        width: 500,
        height: 590,
        boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
        borderRadius: '6px',
      }}
    >
      <Chart>
        <BulletGraph
          id="bubbles"
          subtype={subtype}
          data={[
            [
              {
                ticks: 'auto',
                target: 85,
                value: 23,
                title: 'CPU',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}%`,
                tickFormatter: (d) => `${d}%`,
              },
            ],
            [
              {
                ticks: 'auto',
                target: 75,
                value: 98,
                title: 'Memory',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}%`,
                tickFormatter: (d) => `${d}%`,
              },
            ],
            [
              {
                ticks: 'auto',
                target: 25,
                value: 35.5,
                title: 'Network In',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}%`,
                tickFormatter: (d) => `${d}%`,
              },
            ],
            [
              {
                ticks: 'auto',
                target: 25,
                value: 91,
                title: 'Network out',

                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}%`,
                tickFormatter: (d) => `${d}%`,
              },
            ],
          ]}
        />
      </Chart>
    </div>
  );
};
