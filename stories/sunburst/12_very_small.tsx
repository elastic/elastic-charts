import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import { getRandomNumber } from '../../src/mocks/utils';
import React from 'react';
import { indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export default {
  title: 'Sunburst/Very Large Small Pie Chart',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const VeryLargeSmallPieChart = () => (
  <Chart className={'story-chart'}>
    <Partition
      id={'spec_' + getRandomNumber()}
      data={[
        { sitc1: 'Machinery and transport equipment', exportVal: 9 },
        { sitc1: 'Mineral fuels, lubricants and related materials', exportVal: 1 },
      ]}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d))}`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => d,
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
VeryLargeSmallPieChart.story = {
  name: 'Pie chart with one very large and one very small slice',
};
