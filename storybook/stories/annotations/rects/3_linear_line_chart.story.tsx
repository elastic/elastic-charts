/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, LineSeries, RectAnnotation, ScaleType, Settings, RectAnnotationDatum } from '@elastic/charts';
import { Position } from '@elastic/charts/src/utils/common';
import { BandedAccessorType } from '@elastic/charts/src/utils/geometry';

import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

export const Example = () => {
  const debug = boolean('debug', false);
  const rotation = customKnobs.enum.rotation();

  const definedCoordinate = select(
    'green annotation defined coordinate',
    {
      x0: 'x0',
      x1: 'x1',
      y0: BandedAccessorType.Y0,
      y1: BandedAccessorType.Y1,
    },
    'x0',
  );

  const dataValuesRed: RectAnnotationDatum[] = [
    {
      coordinates: {
        x0: 1,
        x1: 1.25,
        y0: 0,
        y1: 7,
      },
      details: 'red annotation',
    },
  ];
  const dataValuesBlue: RectAnnotationDatum[] = [
    {
      coordinates: {
        x0: 2,
        x1: 2.1,
        y0: 0,
        y1: 7,
      },
      details: 'blue annotation',
    },
  ];
  const dataValuesGreen: RectAnnotationDatum[] = [
    {
      coordinates: {
        x0: definedCoordinate === 'x0' ? 0.5 : null,
        x1: definedCoordinate === 'x1' ? 2.5 : null,
        y0: definedCoordinate === BandedAccessorType.Y0 ? 1.5 : null,
        y1: definedCoordinate === BandedAccessorType.Y1 ? 5.5 : null,
      },
      details: 'green annotation',
    },
  ];

  const isLeft = boolean('y-domain axis is Position.Left', true);
  const yAxisTitle = isLeft ? 'y-domain axis (left)' : 'y-domain axis (right)';
  const yAxisPosition = isLeft ? Position.Left : Position.Right;

  const isBottom = boolean('x-domain axis is Position.Bottom', true);
  const xAxisTitle = isBottom ? 'x-domain axis (botttom)' : 'x-domain axis (top)';
  const xAxisPosition = isBottom ? Position.Bottom : Position.Top;

  return (
    <Chart>
      <Settings debug={debug} rotation={rotation} baseTheme={useBaseTheme()} />
      <RectAnnotation dataValues={dataValuesGreen} id="rect3" style={{ fill: 'lightgreen' }} />
      <RectAnnotation dataValues={dataValuesBlue} id="rect2" style={{ fill: 'blue' }} />
      <RectAnnotation dataValues={dataValuesRed} id="rect1" style={{ fill: 'red' }} />
      <Axis id="bottom" position={xAxisPosition} title={xAxisTitle} />
      <Axis id="left" title={yAxisTitle} position={yAxisPosition} />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
