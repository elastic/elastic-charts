/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import {
  Chart,
  Datum,
  Partition,
  PartitionLayout,
  Settings,
  SeriesType,
  BarSeries,
  Axis,
  Position,
  ScaleType,
} from '@elastic/charts';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { useBaseTheme } from '../../use_base_theme';
import { getColorPicker } from '../utils/components/get_color_picker';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export const Example = () => {
  const lang = select(
    'rtl language',
    {
      Hebrew: 'HE',
      Arabic: 'AR',
    },
    'HE',
  );
  const charSet = select(
    'character set',
    {
      'Right to Left': 'rtl',
      'Left to Right': 'ltr',
      'Mostly RTL': 'mostly-rtl',
      'Mostly LTR': 'mostly-ltr',
    },
    'rtl',
  );
  const type = select(
    'Chart type',
    {
      Bar: SeriesType.Bar,
      Treemap: PartitionLayout.treemap,
      Sunburst: PartitionLayout.sunburst,
    },
    PartitionLayout.treemap,
  );
  const showLegend = boolean('show legend', true);

  const mixedIndices = new Set(['0', '2', '3']);
  const valueGetter = {
    rtl: (key: string) => productLookup[key][`name${lang}`],
    ltr: (key: string) => productLookup[key].name,
    'mostly-rtl': (key: string) => {
      if (mixedIndices.has(key)) return productLookup[key].name;
      return productLookup[key][`name${lang}`];
    },
    'mostly-ltr': (key: string) => {
      if (mixedIndices.has(key)) return productLookup[key][`name${lang}`];
      return productLookup[key].name;
    },
  }[charSet];
  const formatter = (d: any) => numeral(d).format('0.0 a');

  const renderSeries = () =>
    type === SeriesType.Bar ? (
      <>
        <Axis id="x" position={Position.Bottom} tickFormat={formatter} />
        <Axis id="y" position={Position.Left} />
        <BarSeries
          id="bar"
          data={mocks.pie}
          xScaleType={ScaleType.Ordinal}
          xAccessor={({ sitc1 }) => valueGetter(sitc1)}
          yAccessors={[(d: Datum) => d.exportVal]}
          splitSeriesAccessors={[({ sitc1 }) => valueGetter(sitc1)]}
        />
      </>
    ) : (
      <Partition
        id="partition"
        data={mocks.pie}
        layout={type}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={formatter}
        clockwiseSectors={type === PartitionLayout.sunburst && boolean('clockwiseSectors', true)}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => valueGetter(d),
            fillLabel: {
              valueFormatter: formatter,
            },
            shape: {
              fillColor: (key, sortIndex, node, tree) =>
                indexInterpolatedFillColor(interpolatorCET2s())(null, sortIndex, tree),
            },
          },
        ]}
      />
    );

  return (
    <Chart>
      <Settings
        rotation={type === SeriesType.Bar ? 90 : 0}
        debugState
        showLegend={showLegend}
        legendValue="lastBucket"
        baseTheme={useBaseTheme()}
        legendColorPicker={getColorPicker('leftCenter')}
      />
      {renderSeries()}
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
