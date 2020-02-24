import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { AreaSeries, Chart, ScaleType } from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

export const example = () => {
  const toggleSpec = boolean('toggle area spec', true);
  const data1 = KIBANA_METRICS.metrics.kibana_os_load[0].data;
  const data2 = data1.map((datum: any) => [datum[0], datum[1] - 1]);
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'areas1' : 'areas2';

  return (
    <Chart className="story-chart">
      <AreaSeries
        id={specId}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
