/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  MODEL_KEY,
  Partition,
  PartitionLayout,
  Settings,
  PartialTheme,
  defaultPartitionValueFormatter,
  Color,
  Tooltip,
  TooltipAction,
  TooltipValue,
} from '@elastic/charts';
import { ShapeTreeNode } from '@elastic/charts/src/chart_types/partition_chart/layout/types/viewmodel_types';
import { combineColors } from '@elastic/charts/src/common/color_calcs';
import { colorToRgba, RGBATupleToString } from '@elastic/charts/src/common/color_library_wrappers';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../../use_base_theme';
import {
  discreteColor,
  colorBrewerCategoricalStark9,
  countryLookup,
  productLookup,
  regionLookup,
} from '../../utils/utils';

const theme: PartialTheme = {
  chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
  partition: {
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
    maxFontSize: 18,
    idealFontSizeJump: 1.1,
    outerSizeRatio: 1,
    emptySizeRatio: 0,
    circlePadding: 4,
  },
};

function plainColor(foreground: Color, bg: Color): Color {
  return RGBATupleToString(combineColors(colorToRgba(foreground), colorToRgba(bg)));
}
const stringPluralize = (d: unknown[], one: string, many: string) => (d.length > 1 ? many : one);

const actionByDepth = (depth: number): TooltipAction => {
  const name = depth === 1 ? 'categor' : depth === 2 ? 'continent' : 'countr';
  const pluralize = depth === 1 ? ['y', 'ies'] : depth === 2 ? ['', 's'] : ['y', 'ies'];
  const filter = (d: TooltipValue) => d.valueAccessor === depth;
  const actionName = (d: unknown[]) => `${name}${stringPluralize(d, pluralize[0], pluralize[1])}`;
  return {
    hide: (d) => d.some(filter), //  TODO we should double check this as it seems to work the opposite way
    disabled: (d) => d.filter(filter).length < 1,
    label: (d) => {
      const currentDepthValues = d.filter(filter);
      return currentDepthValues.length < 1
        ? `Select to filter ${actionName(currentDepthValues)}`
        : `Filter by ${currentDepthValues.length} ${actionName(currentDepthValues)}`;
    },

    onSelect: (s) => action(`filter ${actionName(s.filter(filter))}`)(s.filter(filter).map((d) => d.label)),
  };
};

export const Example = () => {
  const layout = select<PartitionLayout>(
    'layout',
    {
      [PartitionLayout.sunburst]: PartitionLayout.sunburst,
      [PartitionLayout.treemap]: PartitionLayout.treemap,
      [PartitionLayout.mosaic]: PartitionLayout.mosaic,
      [PartitionLayout.waffle]: PartitionLayout.waffle,
    },
    PartitionLayout.sunburst,
  );
  const background = 'white';
  return (
    <Chart>
      <Settings theme={theme} baseTheme={useBaseTheme()} />
      <Tooltip
        maxVisibleTooltipItems={4}
        actions={() => {
          return [
            {
              disabled: (d) => d.length !== 1,
              label: (d) => {
                return d.length !== 1 ? 'Select one to drilldown' : `Drilldown to ${d[0].label}`;
              },
              onSelect: (s) => action('drilldown to')(s[0].label),
            },
            actionByDepth(1),
            actionByDepth(2),
            actionByDepth(3),
            {
              disabled: (d) => d.length < 1,
              label: (d) =>
                d.length < 1 ? 'Select to copy labels' : `Copy ${d.length} label${stringPluralize(d, '', 's')}`,
              onSelect: (s) => action('copy')(s.map((d) => d.label)),
            },
          ];
        }}
      />
      <Partition
        id="spec_1"
        data={mocks.miniSunburst}
        layout={layout}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: any) => productLookup[d].name,
            fillLabel: { maximizeFontSize: false },
            shape: {
              fillColor: (d: ShapeTreeNode) =>
                plainColor(discreteColor(colorBrewerCategoricalStark9, 0.7)(d.sortIndex), background),
            },
          },
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.slice(0, 2),
            nodeLabel: (d: any) => regionLookup[d].regionName,
            fillLabel: { maximizeFontSize: false },
            shape: {
              fillColor: (d: ShapeTreeNode) =>
                plainColor(discreteColor(colorBrewerCategoricalStark9, 0.5)(d[MODEL_KEY].sortIndex), background),
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            fillLabel: { maximizeFontSize: false },
            shape: {
              fillColor: (d: ShapeTreeNode) =>
                plainColor(discreteColor(colorBrewerCategoricalStark9, 0.3)(d[MODEL_KEY].parent.sortIndex), background),
            },
          },
        ].filter((d, i) => (layout === 'waffle' ? i === 0 : true))}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
