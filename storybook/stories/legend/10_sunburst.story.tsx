/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  LegendStrategy,
  MODEL_KEY,
  PartialTheme,
  Partition,
  PartitionLayout,
  Settings,
  defaultPartitionValueFormatter,
  SeriesIdentifier,
} from '@elastic/charts';
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
      mosaic: PartitionLayout.mosaic,
      waffle: PartitionLayout.waffle,
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
  const legendStrategy = select('legendStrategy', LegendStrategy, LegendStrategy.Key as LegendStrategy);
  const maxLines = number('max legend label lines', 1, { min: 0, step: 1 });

  const legendSortStrategy = select(
    'Custom legend sorting',
    { RegionsFirst: 'regionsFirst', ProductsFirst: 'productsFirst', DefaultSort: 'default' },
    'default',
  );

  const customLegendSort = (a: SeriesIdentifier, b: SeriesIdentifier) => {
    if (legendSortStrategy === 'regionsFirst') {
      if (a.key in regionLookup && b.key in regionLookup) {
        return a.key.localeCompare(b.key);
      }
      return a.key in regionLookup ? -1 : b.key in regionLookup ? 1 : a.key.localeCompare(b.key);
    }
    if (a.key in productLookup && b.key in productLookup) {
      return a.key.localeCompare(b.key);
    }
    return a.key in productLookup ? -1 : b.key in productLookup ? 1 : a.key.localeCompare(b.key);
  };

  const partitionTheme: PartialTheme['partition'] = {
    linkLabel: {
      maxCount: 0,
      fontSize: 14,
    },
    fontFamily: 'Arial',
    fillLabel: {
      fontStyle: 'italic',
      fontWeight: 900,
      valueFont: {
        fontFamily: 'Menlo',
        fontStyle: 'normal',
        fontWeight: 100,
      },
    },
    minFontSize: 1,
    idealFontSizeJump: 1.1,
    outerSizeRatio: 1,
    emptySizeRatio: 0,
    circlePadding: 4,
  };

  const isFlatLegendSupported =
    partitionLayout === PartitionLayout.treemap || partitionLayout === PartitionLayout.sunburst;

  return (
    <Chart>
      <Settings
        showLegend
        showLegendExtra={showLegendExtra}
        flatLegend={isFlatLegendSupported ? flatLegend : true}
        legendStrategy={legendStrategy}
        legendMaxDepth={legendMaxDepth}
        legendSort={legendSortStrategy !== 'default' ? customLegendSort : undefined}
        baseTheme={useBaseTheme()}
        theme={{
          partition: partitionTheme,
          chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
          legend: { labelOptions: { maxLines } },
        }}
      />
      <Partition
        id="spec_1"
        layout={partitionLayout}
        data={mocks.miniSunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
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
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
  markdown: `To flatten a hierarchical legend (like the rendered in a pie chart or a treemap when using a multi-layer configuration) you can
add the \`flatLegend\` prop into the \`<Settings  baseTheme={useBaseTheme()} />\` component.

To limit displayed hierarchy to a specific depth, you can use the \`legendMaxDepth\` prop. The first layer will have a depth of \`1\`.

It is possible to provide a custom sorting logic for a legend when flattened, when not flattened the \`legendSort\` function is ignored.
`,
};
