import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import React from 'react';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export default {
  title: 'Sunburst/Full Zero Slice Pie Chart',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const FullZeroSlicePieChart = () => (
  <Chart className="story-chart">
    <Partition
      id="spec_1"
      data={[
        { sitc1: '7', exportVal: 1000000 },
        { sitc1: '3', exportVal: 0 },
      ]}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d))}`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: { textInvertible: true },
          shape: {
            fillColor: indexInterpolatedFillColor(interpolatorCET2s),
          },
        },
      ]}
      config={{ partitionLayout: PartitionLayout.sunburst }}
    />
  </Chart>
);
FullZeroSlicePieChart.story = {
  name: 'Pie chart with one full and one zero slice',
};
