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
import { TSVB_DATASET } from '../../src/utils/data_samples/test_dataset_tsvb';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

export default {
  title: 'Line Chart/Multi Series with Log Values',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const multiserieswithlogvalues = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
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
      {TSVB_DATASET.series.map((series) => {
        return (
          <LineSeries
            key={series.id}
            id={getSpecId(series.label)}
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Log}
            xAccessor={0}
            yAccessors={[1]}
            data={series.data}
            curve={CurveType.CURVE_MONOTONE_X}
          />
        );
      })}
    </Chart>
  );
};
multiserieswithlogvalues.story = {
  name: 'multi series with log values (limit 0 or negative values)',
};
