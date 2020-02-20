import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';
import { FilterPredicate } from '../../src/chart_types/xy_chart/utils/specs';

export default {
  title: 'Bar Chart/2y2g',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const barChart2y2g = () => {
  const isVisibleFunction: FilterPredicate = (series) => {
    return series.splitAccessors.size > 0
      ? series.specId === 'bars1' && series.yAccessor === 'y1' && series.splitAccessors.get('g1') === 'cloudflare.com'
      : series.specId === 'bars1' && series.yAccessor === 'y1';
  };

  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id={'bottom'} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis id={'left2'} title={'Left axis'} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id={'bars1'}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g1', 'g2', 'g3']}
        data={TestDatasets.BARCHART_2Y2G}
        filterSeriesInTooltip={isVisibleFunction}
      />
    </Chart>
  );
};
barChart2y2g.story = {
  name: '2y2g',
};
