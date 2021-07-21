/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Datum, LegendStrategy, MODEL_KEY, Partition, PartitionLayout, Settings } from '@elastic/charts';
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { ShapeTreeNode } from '@elastic/charts/src/chart_types/partition_chart/layout/types/viewmodel_types';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import {
  discreteColor,
  colorBrewerCategoricalStark9,
  countryLookup,
  productLookup,
  regionLookup,
} from '../utils/utils';

export const Example = () => {
  const partitionLayout = select(
    'Partition Layout',
    {
      treemap: PartitionLayout.treemap,
      sunburst: PartitionLayout.sunburst,
    },
    PartitionLayout.sunburst,
  );
  const flatLegend = boolean('flatLegend', true);
  const showLegendExtra = boolean('showLegendExtra', false);
  const legendMaxDepth = number('legendMaxDepth', 2, {
    min: 0,
    max: 3,
    step: 1,
  });
  const legendStrategy = select('legendStrategy', LegendStrategy, LegendStrategy.Key);

  return (
    <Chart>
      <Settings
        showLegend
        showLegendExtra={showLegendExtra}
        flatLegend={flatLegend}
        legendStrategy={legendStrategy}
        legendMaxDepth={legendMaxDepth}
        baseTheme={useBaseTheme()}
      />
      <Partition
        id="spec_1"
        data={mocks.miniSunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: any) => productLookup[d].name,
            shape: {
              fillColor: (d: ShapeTreeNode) => discreteColor(colorBrewerCategoricalStark9, 0.7)(d.sortIndex),
            },
          },
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
            nodeLabel: (d: any) => regionLookup[d].regionName,
            shape: {
              fillColor: (d: ShapeTreeNode) => discreteColor(colorBrewerCategoricalStark9, 0.5)(d[MODEL_KEY].sortIndex),
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            shape: {
              fillColor: (d: ShapeTreeNode) =>
                discreteColor(colorBrewerCategoricalStark9, 0.3)(d[MODEL_KEY].parent.sortIndex),
            },
          },
        ]}
        config={{
          partitionLayout,
          linkLabel: {
            maxCount: 0,
            fontSize: 14,
          },
          fontFamily: 'Arial',
          fillLabel: {
            valueFormatter: (d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
            fontStyle: 'italic',
            textInvertible: true,
            fontWeight: 900,
            valueFont: {
              fontFamily: 'Menlo',
              fontStyle: 'normal',
              fontWeight: 100,
            },
          },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
          minFontSize: 1,
          idealFontSizeJump: 1.1,
          outerSizeRatio: 1,
          emptySizeRatio: 0,
          circlePadding: 4,
          backgroundColor: 'rgba(229,229,229,1)',
        }}
      />
    </Chart>
  );
};

Example.parameters = {
  backgrounds: { default: 'White' },
  docs: {
    description: {
      story: `To flatten a hierarchical legend (like the rendered in a pie chart or a treemap when using a multi-layer configuration) you can
add the \`flatLegend\` prop into the \`<Settings  baseTheme={useBaseTheme()} />\` component.

To limit displayed hierarchy to a specific depth, you can use the \`legendMaxDepth\` prop. The first layer will have a depth of \`1\`.`,
    },
  },
};
