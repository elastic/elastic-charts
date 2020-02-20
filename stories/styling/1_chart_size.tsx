import React from 'react';

import { BarSeries, Chart, getSpecId, ScaleType, Settings, TooltipType, RecursivePartial, Theme } from '../../src/';
import { SeededDataGenerator } from '../../src/mocks/utils';

const dg = new SeededDataGenerator();
const data2 = dg.generateSimpleSeries(40);

export default {
  title: 'Stylings/Chart Size',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const chartSize = () => {
  const theme: RecursivePartial<Theme> = {
    chartMargins: {
      bottom: 0,
      left: 0,
      top: 0,
      right: 0,
    },
  };
  return (
    <div>
      <Chart className={'story-chart'} size={{ width: 100, height: 50 }}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart className={'story-chart'} size={{ height: 50 }}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart className={'story-chart'} size={['50%', 50]}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart className={'story-chart'} size={[undefined, 50]}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
      <Chart className={'story-chart'} size={50}>
        <Settings tooltip={TooltipType.None} theme={theme} />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data2}
        />
      </Chart>
    </div>
  );
};
chartSize.story = {
  name: 'chart size',
};
