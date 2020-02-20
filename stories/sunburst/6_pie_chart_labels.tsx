import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import { getRandomNumber } from '../../src/mocks/utils';
import React from 'react';
import { indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export default {
  title: 'Sunburst/Pie Chart Labels',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const PieChartLabels = () => (
  <Chart className={'story-chart'}>
    <Partition
      id={'spec_' + getRandomNumber()}
      data={[
        { sitc1: 'Machinery and transport equipment', exportVal: 5 },
        { sitc1: 'Mineral fuels, lubricants and related materials', exportVal: 4 },
      ]}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d))}`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          // nodeLabel: (d: Datum) => d,
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
PieChartLabels.story = {
  name: 'Pie chart with direct text labels instead of dimensions lookup',
};
