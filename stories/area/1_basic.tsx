import React from 'react';
import { AreaSeries, Chart, ScaleType } from '../../src';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';

export const example = () => {
  const data = KIBANA_METRICS.metrics.kibana_os_load[0].data;
  return (
    <Chart className="story-chart">
      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};

// storybook configuration
example.story = {
  parameters: {
    options: { selectedPanel: 'storybook/source-loader/panel' },
  },
};
