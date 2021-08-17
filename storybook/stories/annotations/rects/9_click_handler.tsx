/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// import { action } from '@storybook/addon-actions';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  RectAnnotation,
  ScaleType,
  Settings,
  Position,
  // ElementClickListener,
} from '@elastic/charts';

import { useBaseTheme } from '../../../use_base_theme';

export const Example = () => {
  // eslint-disable-next-line no-console
  const handleClick = () => console.log('\n\n\n\n\n clicked the rect annotation!');
  // const handleClick: ElementClickListener = () => action('clicked series key');

  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} onRectAnnotationClick={handleClick} />
      <RectAnnotation
        id="rect"
        dataValues={[
          {
            coordinates: {
              x0: 0,
              x1: 1,
              y0: 0,
              y1: 4,
            },
            details: 'details about this annotation',
          },
        ]}
        style={{ fill: 'red' }}
        // onClickHandler={handleClick}
      />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis" />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: ``,
};
