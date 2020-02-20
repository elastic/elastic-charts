import { Chart, Datum, Partition } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import { getRandomNumber } from '../../src/mocks/utils';
import React from 'react';
import { indexInterpolatedFillColor, interpolatorTurbo, productLookup } from '../utils/utils';

export default {
  title: 'Sunburst/Value Formatted Pie Chart',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const ValueFormattedPieChart = () => (
  <Chart className={'story-chart'}>
    <Partition
      id={'spec_' + getRandomNumber()}
      data={mocks.pie}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: {
            textInvertible: true,
            fontWeight: 100,
            fontStyle: 'italic',
            valueFont: {
              fontFamily: 'Menlo',
              fontStyle: 'normal',
              fontWeight: 900,
            },
          },
          shape: {
            fillColor: indexInterpolatedFillColor(interpolatorTurbo),
          },
        },
      ]}
      config={{ outerSizeRatio: 0.9 }}
    />
  </Chart>
);
ValueFormattedPieChart.story = {
  name: 'Value formatted pie chart',
  info: {
    source: false,
  },
};
