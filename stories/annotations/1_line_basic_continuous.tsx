import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import {
  AnnotationDomainTypes,
  Axis,
  BarSeries,
  Chart,
  getAnnotationId,
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
  title: 'Annotations/Line Basic xDomain Continuous',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const example0 = () => {
  const data = arrayKnobs('data values', [2.5, 7.2]);
  const dataValues = generateAnnotationData(data);

  const style = {
    line: {
      strokeWidth: 3,
      stroke: '#f00',
      opacity: 1,
    },
    details: {
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: 'gray',
      padding: 0,
    },
  };

  const isBottom = boolean('x domain axis is bottom', true);
  const axisPosition = isBottom ? Position.Bottom : Position.Top;

  return (
    <Chart className={'story-chart'}>
      <Settings showLegend debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <LineAnnotation
        id={getAnnotationId('anno_1')}
        domainType={AnnotationDomainTypes.XDomain}
        dataValues={dataValues}
        style={style}
        marker={<Icon type="alert" />}
      />
      <Axis id={getAxisId('horizontal')} position={axisPosition} title={'x-domain axis'} />
      <Axis id={getAxisId('vertical')} title={'y-domain axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
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
example0.story = {
  name: '[line] basic xDomain continuous',
};
