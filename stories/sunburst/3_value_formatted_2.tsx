import { Chart, Datum, Partition } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import { getRandomNumber } from '../../src/mocks/utils';
import React from 'react';
import { ShapeTreeNode } from '../../src/chart_types/partition_chart/layout/types/viewmodel_types';
import { categoricalFillColor, colorBrewerCategoricalPastel12, productLookup } from '../utils/utils';

export default {
  title: 'Sunburst/Value Formatted Pie Chart 2',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const ValueFormattedPieChart2 = () => (
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
            fillColor: (d: ShapeTreeNode) => categoricalFillColor(colorBrewerCategoricalPastel12)(d.sortIndex),
          },
        },
      ]}
      config={{ outerSizeRatio: 0.9 }}
    />
  </Chart>
);
ValueFormattedPieChart2.story = {
  name: 'Value formatted pie chart with categorical color palette',
  info: {
    source: false,
  },
};
