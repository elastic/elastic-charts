import React from 'react';
import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '../../src/';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';
import { getChartRotationKnob } from '../common';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export default {
  title: 'Line Chart/Ordinal with Axis',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const ordinalWAxis = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings rotation={getChartRotationKnob()} />
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        showOverlappingTicks={true}
        tickFormat={dateFormatter}
      />
      <Axis
        id={getAxisId('left')}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(2)}%`}
      />
      <LineSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 5)}
      />
    </Chart>
  );
};
ordinalWAxis.story = {
  name: 'ordinal w axis',
};
