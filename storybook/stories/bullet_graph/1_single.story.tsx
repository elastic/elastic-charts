/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { text, number, boolean } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const bulletTitle = text('title', 'Error rate');
  const subtitle = text('subtitle', '');
  const value = number('value', 56, { range: true, min: -200, max: 200 });
  const target = number('target', 75, { range: true, min: -200, max: 200 });
  const start = number('start', 0, { range: true, min: -200, max: 200 });
  const end = number('end', 100, { range: true, min: -200, max: 200 });
  const format = text('format', '0');
  const formatter = (d: number) => numeral(d).format(format);
  const subtype = getKnobFromEnum('subtype', BulletGraphSubtype, BulletGraphSubtype.horizontal);

  return (
    <div
      style={{
        resize: 'both',
        padding: '0px',
        overflow: 'auto',
        width: 500,
        height: 500,
        boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
        borderRadius: '6px',
      }}
    >
      <Chart title={title} description={description}>
        <Settings debug={debug} baseTheme={useBaseTheme()} />
        <BulletGraph
          id="bullet"
          subtype={subtype}
          data={[
            [
              {
                ticks: 'auto',
                target,
                value,
                title: bulletTitle,
                subtitle,
                domain: [start, end],
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
