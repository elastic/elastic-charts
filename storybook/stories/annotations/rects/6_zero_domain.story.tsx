/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, RectAnnotation, ScaleType, Settings } from '@elastic/charts';
import { Position } from '@elastic/charts/src/utils/common';

import { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';

const getKnobs = () => {
  const minY = number('min y', 0);
  const maxY = number('max y', 20);
  const x0 = number('x0', 5);
  const x1 = number('x1', 10);
  const enableYValues = boolean('enable y0 and y1 values', true);
  return {
    minY,
    maxY,
    x0,
    x1,
    y0: enableYValues ? number('y0', 1) : undefined,
    y1: enableYValues ? number('y1', 5) : undefined,
  };
};

export const Example: ChartsStory = (_, { title, description }) => {
  const xAxisKnobs = getKnobs();
  // only show the fit enable or disable if relevant
  const fit = xAxisKnobs.minY === xAxisKnobs.maxY ? boolean('fit to the domain', false) : undefined;
  const outside = boolean('render outside', false);

  return (
    <Chart title={title} description={description}>
      <RectAnnotation
        id="rect"
        dataValues={[{ coordinates: xAxisKnobs, details: 'My Annotation' }]}
        style={{ fill: 'red' }}
        outside={outside}
        outsideDimension={4}
      />
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis" />
      <Axis
        domain={{
          min: NaN,
          max: NaN,
          fit,
        }}
        id="left"
        title="y-domain axis"
        position={Position.Left}
      />
      <BarSeries
        id="bars"
        xAccessor="x"
        yAccessors={['y']}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        data={[
          { x: 0, y: xAxisKnobs.minY },
          { x: 5, y: (xAxisKnobs.minY + xAxisKnobs.maxY) / 2 },
          { x: 20, y: xAxisKnobs.maxY },
        ]}
      />
    </Chart>
  );
};
