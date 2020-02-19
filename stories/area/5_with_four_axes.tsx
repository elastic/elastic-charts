import React from 'react';
import { AreaSeries, Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings, timeFormatter } from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

const dateFormatter = timeFormatter('HH:mm');

export default {
  title: 'Area Chart/With 4 Axes',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const with4Axes = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings debug={false} />
      <Axis
        id={getAxisId('bottom')}
        title={'timestamp per 1 minute'}
        position={Position.Bottom}
        showOverlappingTicks={true}
        tickFormat={dateFormatter}
      />
      <Axis
        id={getAxisId('left')}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />
      <Axis
        id={getAxisId('top')}
        position={Position.Top}
        showOverlappingTicks={true}
        tickFormat={timeFormatter('HH:mm:ss')}
      />
      <Axis
        id={getAxisId('right')}
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Right}
        tickFormat={(d) => `${Number(d).toFixed(0)} %`}
      />

      <AreaSeries
        id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[0].metric.label)}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
      />
    </Chart>
  );
};
with4Axes.story = {
  name: 'with 4 axes',
};
