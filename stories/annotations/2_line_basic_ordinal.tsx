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
  title: 'Annotations/Line Basic xDomain Ordinal',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const lineBasicXDomainOrdinal = () => {
  const dataValues = generateAnnotationData(arrayKnobs('annotation values', ['a', 'c']));
  return (
    <Chart className={'story-chart'}>
      <Settings debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <LineAnnotation
        id={'anno_1'}
        domainType={AnnotationDomainTypes.XDomain}
        dataValues={dataValues}
        marker={<Icon type="alert" />}
      />
      <Axis id={getAxisId('top')} position={Position.Top} title={'x-domain axis (top)'} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'x-domain axis (bottom)'} />
      <Axis id={getAxisId('left')} title={'y-domain axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 7 },
          { x: 'c', y: 3 },
          { x: 'd', y: 6 },
        ]}
      />
    </Chart>
  );
};
lineBasicXDomainOrdinal.story = {
  name: '[line] basic xDomain ordinal',
};
