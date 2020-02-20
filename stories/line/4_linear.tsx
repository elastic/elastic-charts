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
  timeFormatter,
} from '../../src/';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export default {
  title: 'Line Chart/Linear with Axis',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const linearWAxis = () => {
  return (
    <Chart className={'story-chart'}>
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
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 5)}
      />
    </Chart>
  );
};
linearWAxis.story = {
  name: 'linear w axis',
};
