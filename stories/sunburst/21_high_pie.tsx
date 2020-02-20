import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import { getRandomNumber } from '../../src/mocks/utils';
import React from 'react';
import { countryLookup, indexInterpolatedFillColor, interpolatorCET2s } from '../utils/utils';

export default {
  title: 'Sunburst/High Number of Slices',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const HighNumberOfSlice = () => (
  <Chart className={'story-chart'}>
    <Partition
      id={'spec_' + getRandomNumber()}
      data={mocks.manyPie}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.origin,
          nodeLabel: (d: Datum) => countryLookup[d].name,
          fillLabel: { textInvertible: true },
          shape: {
            fillColor: indexInterpolatedFillColor(interpolatorCET2s),
          },
        },
      ]}
      config={{
        partitionLayout: PartitionLayout.sunburst,
        linkLabel: { maxCount: 15 },
      }}
    />
  </Chart>
);
HighNumberOfSlice.story = {
  name: 'Hundreds of slices, vanishing & tapering borders',
};
