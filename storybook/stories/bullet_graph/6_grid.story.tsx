/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, text } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { Chart, BulletGraph, BulletGraphSubtype, Settings, Tooltip } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getKnobFromEnum } from '../utils/knobs/utils';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const hideTooltip = boolean('hide tooltip', false);
  const syncCursor = boolean('sync cursor', false);
  const tickSnapStep = number('active tick step', 1, { min: 0, max: 10 });
  const valueFormat = text('valueFormat', '0');
  const targetFormat = text('targetFormat', '');
  const tickFormat = text('tickFormat', '0[.]00');
  const subtype = getKnobFromEnum('subtype', BulletGraphSubtype, BulletGraphSubtype.vertical);

  const valueFormatter = (d: number) => numeral(d).format(valueFormat);
  const targetFormatter = targetFormat ? (d: number) => numeral(d).format(targetFormat) : undefined;
  const tickFormatter = (d: number) => numeral(d).format(tickFormat);

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} debug={debug} />
      <Tooltip type={hideTooltip ? 'none' : undefined} />
      <BulletGraph
        id="bubbles"
        subtype={subtype}
        tickSnapStep={tickSnapStep}
        data={[
          [
            {
              target: 10,
              value: 23,
              title: 'Network inbound error rate',
              // subtitle: 'First row first column subtitle',
              syncCursor,
              domain: [0, 100],
              valueFormatter,
              targetFormatter,
              tickFormatter,
            },
            {
              target: 67,
              value: 123,
              title: 'Network outbound',
              subtitle: 'error rate (%)',
              syncCursor,
              domain: [0, 100],
              valueFormatter,
              targetFormatter,
              tickFormatter,
            },
          ],
          [
            {
              target: 50,
              value: 11,
              title: 'Number of requests',
              subtitle: 'Requests per second',
              syncCursor,
              domain: [0, 100],
              valueFormatter,
              targetFormatter,
              tickFormatter,
            },
            {
              target: 80,
              value: 92,
              title: 'Second row second column title',
              subtitle: 'percentage',
              syncCursor,
              domain: [0, 200],
              valueFormatter,
              targetFormatter,
              tickFormatter,
            },
          ],
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `You can apply different formatter for ticks and values using
      different formats for \`tickFormatter\` and \`valueFormatter\`.

Use a [numeraljs](http://numeraljs.com/) format with the knobs to see the difference`,
  resize: {
    width: 550,
    height: 640,
    boxShadow: '5px 5px 15px 5px rgba(0,0,0,0.29)',
    borderRadius: '6px',
  },
};
