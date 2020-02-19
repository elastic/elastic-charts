import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, Chart, getAxisId, getSpecId, LineSeries, RectAnnotation, ScaleType, Settings } from '../../src';
import { getChartRotationKnob } from '../common';
import { BandedAccessorType } from '../../src/utils/geometry';
import { Position } from '../../src/utils/commons';

export default {
  title: 'Annotations/Rect Basic Annotation Line',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const rectBasicAnnotationLine = () => {
  const definedCoordinate = select(
    'defined coordinate',
    {
      x0: 'x0',
      x1: 'x1',
      y0: BandedAccessorType.Y0,
      y1: BandedAccessorType.Y1,
    },
    'x0',
  );

  const dataValues = [
    {
      coordinates: {
        x0: 1,
        x1: 1.25,
        y0: 0,
        y1: 7,
      },
      details: 'details about this annotation',
    },
    {
      coordinates: {
        x0: 2.0,
        x1: 2.1,
        y0: 0,
        y1: 7,
      },
      details: 'details about this annotation',
    },
    {
      coordinates: {
        x0: definedCoordinate === 'x0' ? 0.25 : null,
        x1: definedCoordinate === 'x1' ? 2.75 : null,
        y0: definedCoordinate === BandedAccessorType.Y0 ? 0.25 : null,
        y1: definedCoordinate === BandedAccessorType.Y1 ? 6.75 : null,
      },
      details: 'can have null values',
    },
  ];

  const isLeft = boolean('y-domain axis is Position.Left', true);
  const yAxisTitle = isLeft ? 'y-domain axis (left)' : 'y-domain axis (right)';
  const yAxisPosition = isLeft ? Position.Left : Position.Right;

  const isBottom = boolean('x-domain axis is Position.Bottom', true);
  const xAxisTitle = isBottom ? 'x-domain axis (botttom)' : 'x-domain axis (top)';
  const xAxisPosition = isBottom ? Position.Bottom : Position.Top;

  return (
    <Chart className={'story-chart'}>
      <Settings debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <RectAnnotation dataValues={dataValues} id={'rect'} />
      <Axis id={getAxisId('bottom')} position={xAxisPosition} title={xAxisTitle} />
      <Axis id={getAxisId('left')} title={yAxisTitle} position={yAxisPosition} />
      <LineSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={'x'}
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
rectBasicAnnotationLine.story = {
  name: '[rect] basic annotation (line)',
};
