import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import { getRandomNumber } from '../../src/mocks/utils';
import React from 'react';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export default {
  title: 'Sunburst/Negative No Pie',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const NegativeNoPie = () => (
  <Chart className={'story-chart'}>
    <Partition
      id={'spec_' + getRandomNumber()}
      data={mocks.pie
        .slice(0, 2)
        .concat(mocks.pie.slice(2, 3).map((s) => ({ ...s, exportVal: -0.1 })))
        .concat(mocks.pie.slice(3))}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`}
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
NegativeNoPie.story = {
  name: 'No pie chart if some slices are negative',
};
