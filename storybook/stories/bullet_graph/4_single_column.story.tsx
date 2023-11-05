/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, text } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const format = text('format', '0');
  const formatter = (d: number) => numeral(d).format(format);
  const subtype = getKnobFromEnum('subtype', BulletGraphSubtype, BulletGraphSubtype.horizontal);

  return (
    <div
      style={{
        padding: '0px',
        width: 500,
        height: 375,
        boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
        borderRadius: '6px',
      }}
      className="resizable"
    >
      <Chart title={title} description={description}>
        <Settings baseTheme={useBaseTheme()} debug={debug} />
        <BulletGraph
          id="bubbles"
          subtype={subtype}
          data={[
            [
              {
                value: 1320,
                title: 'Total requests',
                domain: [0, 2000],
                valueFormatter: formatter,
                tickFormatter: formatter,
              },
            ],
            [
              {
                target: 150,
                value: 483,
                title: 'Erroring Request duration millis',
                subtitle: '90th percentile',
                domain: [0, 500],
                valueFormatter: formatter,
                tickFormatter: formatter,
              },
            ],
            [
              {
                value: 12,
                title: 'Error rate',
                subtitle: 'percentage',
                domain: [0, 100],
                valueFormatter: formatter,
                tickFormatter: formatter,
              },
            ],
          ]}
        />
      </Chart>
    </div>
  );
};
