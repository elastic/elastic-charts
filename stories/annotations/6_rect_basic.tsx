import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, RectAnnotation, ScaleType, Settings } from '../../src';
import { getChartRotationKnob } from '../common';
import { Position } from '../../src/utils/commons';

export default {
  title: 'Annotations',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const rectBasicAnnotationLinearBar = () => {
  const dataValues = [
    {
      coordinates: {
        x0: 0,
        x1: 1,
        y0: 0,
        y1: 7,
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
rectBasicAnnotationLinearBar.story = {
  name: '[rect] basic annotation (linear bar)',
};
