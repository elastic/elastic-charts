import React from 'react';
import {
  Axis,
  Chart,
  CurveType,
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

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export default {
  title: 'Line Chart/Curved with Axis and Legend',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const curvedwaxisandlegend = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={true} legendPosition={Position.Right} />
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
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />

      <LineSeries
        id={getSpecId('monotone x')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
        curve={CurveType.CURVE_MONOTONE_X}
      />
      <LineSeries
        id={getSpecId('basis')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
        curve={CurveType.CURVE_BASIS}
      />
      <LineSeries
        id={getSpecId('cardinal')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
        curve={CurveType.CURVE_CARDINAL}
      />
      <LineSeries
        id={getSpecId('catmull rom')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
        curve={CurveType.CURVE_CATMULL_ROM}
      />
      <LineSeries
        id={getSpecId('natural')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
        curve={CurveType.CURVE_NATURAL}
      />
      <LineSeries
        id={getSpecId('linear')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
        curve={CurveType.LINEAR}
      />
    </Chart>
  );
};
curvedwaxisandlegend.story = {
  name: 'curved w axis and legend',
};
