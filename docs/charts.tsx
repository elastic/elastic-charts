import { boolean } from '@storybook/addon-knobs';

import { Chart, BarSeries, getSpecId, ScaleType, AreaSeries } from '../src';

import React from 'react';
import { KIBANA_METRICS } from '../src/utils/data_samples/test_dataset_kibana';

export default {
  title: 'Introduction',
  includeStories: [],
};

export const Basic = () => {
  const darkmode = boolean('darkmode', false);
  const className = darkmode ? 'story-chart-dark' : 'story-chart';
  const toggleSpec = boolean('toggle bar spec', true);
  const data1 = [
    { x: 0, y: 2 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 6 },
  ];
  const data2 = data1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'bars1' : 'bars2';
  return (
    <Chart className={className}>
      <BarSeries
        id={getSpecId(specId)}
        name={'Simple bar series'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
Basic.story = {
  name: 'basic',
};

export const AreaBasic = () => {
  const toggleSpec = boolean('toggle area spec', true);
  const data1 = KIBANA_METRICS.metrics.kibana_os_load[0].data;
  const data2 = data1.map((datum) => [datum[0], datum[1] - 1]);
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'areas1' : 'areas2';

  return (
    <Chart className={'story-chart'}>
      <AreaSeries
        id={getSpecId(specId)}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
AreaBasic.story = {
  name: 'area basic',
};
