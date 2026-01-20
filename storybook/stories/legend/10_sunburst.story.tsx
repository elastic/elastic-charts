/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import type { Datum, PartialTheme, SeriesIdentifier } from '@elastic/charts';
import {
  Chart,
  LegendStrategy,
  Partition,
  PartitionLayout,
  Settings,
  defaultPartitionValueFormatter,
  LegendValue,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import {
  discreteColor,
  colorBrewerCategoricalStark9,
  countryLookup,
  productLookup,
  regionLookup,
} from '../utils/utils';

export const Example: ChartsStory = (_, { title, description }) => {
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
  const useDimmedColors = boolean('Use dimmed colors on unhighlight', true);

  const shadeOptions = {
    'shade30 @ 15% (lighter)': 'rgba(202, 211, 226, 0.15)',
    'shade30 @ 20%': 'rgba(202, 211, 226, 0.20)',
    'shade30 @ 25%': 'rgba(202, 211, 226, 0.25)',
    'shade30 @ 30%': 'rgba(202, 211, 226, 0.30)',
    'shade30 @ 35% (default light)': 'rgba(202, 211, 226, 0.35)',
    'shade30 @ 40%': 'rgba(202, 211, 226, 0.40)',
    'shade30 @ 45%': 'rgba(202, 211, 226, 0.45)',
    'shade30 @ 50% (darker)': 'rgba(202, 211, 226, 0.50)',
    'shade60 @ 15% (lighter)': 'rgba(142, 159, 188, 0.15)',
    'shade60 @ 20%': 'rgba(142, 159, 188, 0.20)',
    'shade60 @ 25%': 'rgba(142, 159, 188, 0.25)',
    'shade60 @ 30%': 'rgba(142, 159, 188, 0.30)',
    'shade60 @ 35% (default dark)': 'rgba(142, 159, 188, 0.35)',
    'shade60 @ 40%': 'rgba(142, 159, 188, 0.40)',
    'shade60 @ 45%': 'rgba(142, 159, 188, 0.45)',
    'shade60 @ 50% (darker)': 'rgba(142, 159, 188, 0.50)',
  };

  const legendSortStrategy = select(
    'Custom legend sorting',
    { RegionsFirst: 'regionsFirst', ProductsFirst: 'productsFirst', DefaultSort: 'default' },
    'regionsFirst',
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

  const baseTheme = useBaseTheme();
  const defaultShade =
    baseTheme.theme === 'light' ? 'rgba(202, 211, 226, 0.35)' : 'rgba(142, 159, 188, 0.35)';

  const dimmedFillColor = useDimmedColors
    ? select('Dimmed fill color', shadeOptions, defaultShade)
    : undefined;

  const arcSeriesTheme: PartialTheme['arcSeriesStyle'] = useDimmedColors
    ? {
        arc: {
          dimmed: {
            fill: dimmedFillColor,
            stroke: baseTheme.theme === 'light' ? 'black' : 'white',
          },
        },
      }
    : {
        arc: {
          dimmed: undefined,
        },
      };

  const isFlatLegendSupported =
    partitionLayout === PartitionLayout.treemap || partitionLayout === PartitionLayout.sunburst;

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={showLegendExtra ? [LegendValue.CurrentAndLastValue] : []}
        flatLegend={isFlatLegendSupported ? flatLegend : true}
        legendStrategy={legendStrategy}
        legendMaxDepth={legendMaxDepth}
        legendSort={legendSortStrategy !== 'default' ? customLegendSort : undefined}
        baseTheme={baseTheme}
        theme={{
          partition: partitionTheme,
          arcSeriesStyle: arcSeriesTheme,
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
              fillColor: (key, sortIndex) => discreteColor(colorBrewerCategoricalStark9, 0.7)(sortIndex),
            },
          },
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
            nodeLabel: (d: any) => regionLookup[d].regionName,
            shape: {
              fillColor: (key, sortIndex, node) =>
                discreteColor(colorBrewerCategoricalStark9, 0.5)(node.parent.sortIndex),
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            shape: {
              fillColor: (key, sortIndex, node) =>
                discreteColor(colorBrewerCategoricalStark9, 0.3)(node.parent.parent.sortIndex),
            },
          },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `To flatten a hierarchical legend (like the rendered in a pie chart or a treemap when using a multi-layer configuration) you can
add the \`flatLegend\` prop into the \`<Settings  baseTheme={useBaseTheme()} />\` component.

To limit displayed hierarchy to a specific depth, you can use the \`legendMaxDepth\` prop. The first layer will have a depth of \`1\`.

It is possible to provide a custom sorting logic for a legend when flattened, when not flattened the \`legendSort\` function is ignored.
`,
};
