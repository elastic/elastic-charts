/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const subtype = getKnobFromEnum('subtype', BulletGraphSubtype, BulletGraphSubtype.vertical);
  return (
    <div
      style={{
        resize: 'both',
        padding: '0px',
        overflow: 'auto',
        width: 550,
        height: 640,
        boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
        borderRadius: '6px',
      }}
    >
      <Chart title={title} description={description}>
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
                title: 'Network inbound error rate',
                // subtitle: 'First row first column subtitle',
                domain: { min: 0, max: 100, nice: false },
                valueFormatter: (d) => `${d}`,
                tickFormatter: (d) => `${d}`,
              },
              {
                ticks: 'auto',
                target: 67,
                value: 123,
                title: 'Network outbound',
                subtitle: 'error rate (%)',
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
                title: 'Number of requests',
                subtitle: 'Requests per second',
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
