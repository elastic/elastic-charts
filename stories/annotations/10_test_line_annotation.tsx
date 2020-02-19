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
  ScaleType,
  Settings,
} from '../../src';
import { getChartRotationKnob } from '../common';
import { Position } from '../../src/utils/commons';

export default {
  title: 'Annotations/Test Line Annotation Single Value Histogram',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const testLineAnnotationSingleValueHistogram = () => {
  const dataValues = [
    {
      dataValue: 3.5,
    },
  ];

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

  const xDomain = {
    minInterval: 1,
  };

  return (
    <Chart className={'story-chart'}>
      <Settings debug={boolean('debug', false)} rotation={getChartRotationKnob()} xDomain={xDomain} />
      <LineAnnotation id={'anno_1'} domainType={AnnotationDomainTypes.XDomain} dataValues={dataValues} style={style} />
      <Axis id={getAxisId('horizontal')} position={Position.Bottom} title={'x-domain axis'} />
      <Axis id={getAxisId('vertical')} title={'y-domain axis'} position={Position.Left} />
      <BarSeries
        enableHistogramMode={true}
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[{ x: 3, y: 2 }]}
      />
    </Chart>
  );
};
testLineAnnotationSingleValueHistogram.story = {
  name: '[test] line annotation single value histogram',
};
