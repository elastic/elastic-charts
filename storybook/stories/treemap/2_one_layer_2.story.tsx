/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings } from '@elastic/charts';
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { ShapeTreeNode } from '@elastic/charts/src/chart_types/partition_chart/layout/types/viewmodel_types';
import { arrayToLookup } from '@elastic/charts/src/common/color_calcs';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';
import { productDimension } from '@elastic/charts/src/mocks/hierarchical/dimension_codes';

import { useBaseTheme } from '../../use_base_theme';
import { discreteColor, colorBrewerCategoricalPastel12 } from '../utils/utils';

const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);

export const Example = () => (
  <Chart>
    <Settings baseTheme={useBaseTheme()} />
    <Partition
      id="spec_1"
      data={mocks.pie}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: {
            textInvertible: true,
            valueFormatter: (d: number) => `${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            valueFont: {
              fontWeight: 100,
            },
          },
          shape: {
            fillColor: (d: ShapeTreeNode) => discreteColor(colorBrewerCategoricalPastel12)(d.sortIndex),
          },
        },
      ]}
      config={{
        partitionLayout: PartitionLayout.treemap,
      }}
    />
  </Chart>
);
