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
  timeFormatter,
} from '../../src';
import { Icon } from '../../src/components/icons/icon';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';
import { getChartRotationKnob } from '../common';
import { Position } from '../../src/utils/commons';

const dateFormatter = timeFormatter('HH:mm:ss');

function generateTimeAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({
    dataValue: value,
    details: `detail-${index}`,
    header: dateFormatter(value),
  }));
}

export default {
  title: 'Annotations/Line Time Series',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const lineTimeSeries = () => {
  const dataValues = generateTimeAnnotationData([
    1551438150000,
    1551438180000,
    1551438390000,
    1551438450000,
    1551438480000,
  ]);

  return (
    <Chart className={'story-chart'}>
      <Settings debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <LineAnnotation
        id={'anno_1'}
        domainType={AnnotationDomainTypes.XDomain}
        dataValues={dataValues}
        marker={<Icon type="alert" />}
      />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'x-domain axis'} tickFormat={dateFormatter} />
      <Axis id={getAxisId('left')} title={'y-domain axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 20)}
      />
    </Chart>
  );
};
lineTimeSeries.story = {
  name: '[line] time series',
};
