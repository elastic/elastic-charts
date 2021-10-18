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
import { config } from '@elastic/charts/src/chart_types/partition_chart/layout/config';
import { arrayToLookup, hueInterpolator } from '@elastic/charts/src/common/color_calcs';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';
import { productDimension } from '@elastic/charts/src/mocks/hierarchical/dimension_codes';
import { palettes } from '@elastic/charts/src/mocks/hierarchical/palettes';

import { useBaseTheme } from '../../use_base_theme';

const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);

// style calcs
const interpolatorCET2s = hueInterpolator(palettes.CET2s.map(([r, g, b]) => [r, g, b, 0.7]));

const defaultFillColor = (colorMaker: any) => (d: any, i: number, a: any[]) => colorMaker(i / (a.length + 1));

export const Example = () => {
  const useRtl = boolean('use rtl text', true);
  const showLegend = boolean('show legend', true);
  const type = select(
    'Chart type',
    {
      Bar: SeriesType.Bar,
      Treemap: PartitionLayout.treemap,
      Sunburst: PartitionLayout.sunburst,
    },
    PartitionLayout.treemap,
  );

  const renderSeries = () =>
    type === SeriesType.Bar ? (
      <>
        <Axis id="x" position={Position.Bottom} tickFormat={(d) => numeral(d).format('0.0 a')} />
        <Axis id="y" position={Position.Left} />
        <BarSeries
          id="bar"
          data={mocks.pie}
          xScaleType={ScaleType.Ordinal}
          xAccessor={({ sitc1 }) => (useRtl ? productLookup[sitc1].nameAR : productLookup[sitc1].name)}
          yAccessors={[(d: Datum) => d.exportVal]}
          splitSeriesAccessors={[({ sitc1 }) => (useRtl ? productLookup[sitc1].nameAR : productLookup[sitc1].name)]}
        />
      </>
    ) : (
      <Partition
        id="partition"
        data={mocks.pie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => (useRtl ? productLookup[d].nameAR : productLookup[d].name),
            fillLabel: {
              valueFormatter: (d: number) => numeral(d).format('0.0 a'),
            },
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          partitionLayout: type,
        }}
      />
    );

  return (
    <Chart>
      <Settings
        rotation={type === SeriesType.Bar ? 90 : 0}
        debugState
        showLegend={showLegend}
        baseTheme={useBaseTheme()}
      />
      {renderSeries()}
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
