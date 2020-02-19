import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, RectAnnotation, ScaleType, Settings } from '../../src';
import { getChartRotationKnob } from '../common';
import { Position } from '../../src/utils/commons';

export default {
  title: 'Annotations/Rect Basic Annotation Ordinal Bar',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const rectBasicAnnotationOrdinalBar = () => {
  const dataValues = [
    {
      coordinates: {
        x0: 'a',
        x1: 'b',
      },
      details: 'details about this annotation',
    },
  ];

  return (
    <Chart className={'story-chart'}>
      <Settings debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <RectAnnotation dataValues={dataValues} id={'rect'} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'x-domain axis'} />
      <Axis id={getAxisId('left')} title={'y-domain axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor={'x'}
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 7 },
          { x: 'c', y: 0 },
          { x: 'd', y: 6 },
        ]}
      />
    </Chart>
  );
};
rectBasicAnnotationOrdinalBar.story = {
  name: '[rect] basic annotation (ordinal bar)',
};
