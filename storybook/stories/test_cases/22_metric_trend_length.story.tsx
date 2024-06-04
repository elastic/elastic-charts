/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import { Chart, Settings, Metric } from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator();

export const Example: ChartsStory = (_, { title, description }) => {
  const trendLength = number('Trend length x', 3, { min: 0 });
  const trendData = Array.from({ length: trendLength })
    .fill(0)
    .map((_, x) => ({
      x,
      y: rng(0, 100),
    }));

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Metric
        id="metrics"
        data={[
          [
            {
              color: '#3c3c3c',
              title: 'Zero length trend',
              value: 0,
              valueFormatter: (v) => `${v} length`,
              trend: [],
              trendShape: 'area',
            },
            {
              color: '#add3f5',
              title: 'Trend - length 1',
              value: 1,
              valueFormatter: (v) => `${v} length`,
              trend: useMemo(
                () => [
                  {
                    x: 1,
                    y: rng(0, 100),
                  },
                ],
                [],
              ),
              trendShape: 'area',
            },
          ],
          [
            {
              color: '#db9b2c',
              title: 'Trend - length 2',
              value: 2,
              valueFormatter: (v) => `${v} length`,
              trend: useMemo(
                () => [
                  {
                    x: 1,
                    y: rng(0, 100),
                  },
                  {
                    x: 2,
                    y: rng(0, 100),
                  },
                ],
                [],
              ),
              trendShape: 'area',
            },
            {
              color: '#1ceec6',
              title: 'Trend - length x',
              value: trendLength,
              valueFormatter: (v) => `${v} length`,
              trend: trendData,
              trendShape: 'area',
            },
          ],
        ]}
      />
    </Chart>
  );
};
