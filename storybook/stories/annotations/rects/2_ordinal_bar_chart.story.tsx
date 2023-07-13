/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, RectAnnotation, ScaleType, Settings } from '@elastic/charts';
import { Position } from '@elastic/charts/src/utils/common';

import { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const rotation = customKnobs.enum.rotation();

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} rotation={rotation} baseTheme={useBaseTheme()} />
      <RectAnnotation
        dataValues={[
          {
            coordinates: {
              x0: 'a',
              x1: 'c',
            },
            details: 'annotation on ordinal bar chart',
          },
        ]}
        id="rect"
        style={{ fill: 'red' }}
      />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis" />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 3 },
          { x: 'c', y: 0 },
          { x: 'd', y: 6 },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `On Ordinal Bar charts, you can draw a rectangular annotation the same way it's done within a linear bar chart.
The annotation will cover fully the extent defined by the \`coordinate\` object, extending to the max/min domain values any
missing/out-of-range parameters.`,
};
