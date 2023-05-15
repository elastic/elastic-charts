/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example = () => {
  const subtype = getKnobFromEnum('subtype', BulletGraphSubtype, BulletGraphSubtype.angular);
  return (
    <div
      style={{
        resize: 'both',
        padding: '10px',
        overflow: 'auto',
        width: 500,
        height: 590,
        boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
        borderRadius: '6px',
      }}
    >
      <Chart>
        <Settings baseTheme={useBaseTheme()} />
        <BulletGraph
          id="bubbles"
          subtype={subtype}
          data={[
            [
              {
                ticks: 'auto',
                target: 10,
                value: 23,
                title: 'First row first column title',
                // subtitle: 'First row first column subtitle',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}`,
                tickFormatter: (d) => `${d}`,
              },
              {
                ticks: 'auto',
                target: 67,
                value: 123,
                title: 'First row second column title',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}`,
                tickFormatter: (d) => `${d}`,
              },
            ],
            [
              {
                ticks: 'auto',
                target: 50,
                value: 11,
                title: 'dsads',
                subtitle: 'Second row first column subtitle',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}`,
                tickFormatter: (d) => `${d}`,
              },
              {
                ticks: 'auto',
                target: 80,
                value: 92,
                title: 'Second row second column title',
                subtitle: 'percentage',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}`,
                tickFormatter: (d) => `${d}`,
              },
            ],
          ]}
        />
      </Chart>
    </div>
  );
};
