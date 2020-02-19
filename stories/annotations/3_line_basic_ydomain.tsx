import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import {
  AnnotationDomainTypes,
  Axis,
  BarSeries,
  Chart,
  getAxisId,
  getSpecId,
  LineAnnotation,
  LineAnnotationDatum,
  ScaleType,
  Settings,
} from '../../src';
import { Icon } from '../../src/components/icons/icon';
import { getChartRotationKnob, arrayKnobs } from '../common';
import { Position } from '../../src/utils/commons';

function generateAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}` }));
}

export default {
  title: 'Annotations/Line Basic yDomain',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const lineBasicYDomain = () => {
  const data = arrayKnobs('data values', [1.5, 7.2]);
  const dataValues = generateAnnotationData(data);

  const isLeft = boolean('y-domain axis is Position.Left', true);
  const axisTitle = isLeft ? 'y-domain axis (left)' : 'y-domain axis (right)';
  const axisPosition = isLeft ? Position.Left : Position.Right;

  return (
    <Chart className={'story-chart'}>
      <Settings debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <LineAnnotation
        id={'anno_'}
        domainType={AnnotationDomainTypes.YDomain}
        dataValues={dataValues}
        marker={<Icon type="alert" />}
      />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'x-domain axis'} />
      <Axis id={getAxisId('left')} title={axisTitle} position={axisPosition} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
lineBasicYDomain.story = {
  name: '[line] basic yDomain',
};
