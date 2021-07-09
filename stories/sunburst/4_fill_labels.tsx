/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings } from '../../packages/charts/src';
import { config } from '../../packages/charts/src/chart_types/partition_chart/layout/config';
import { mocks } from '../../packages/charts/src/mocks/hierarchical';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../utils/utils';

export const Example = () => (
  <Chart className="story-chart">
    <Settings theme={STORYBOOK_LIGHT_THEME} />
    <Partition
      id="spec_1"
      data={mocks.pie}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
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
      config={{
        partitionLayout: PartitionLayout.sunburst,
        linkLabel: {
          maxCount: 32,
          fontSize: 14,
        },
        fontFamily: 'Arial',
        fillLabel: {
          valueFormatter: (d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\u00A0Bn`,
          fontStyle: 'italic',
        },
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        minFontSize: 1,
        idealFontSizeJump: 1.1,
        outerSizeRatio: 0.9, // - 0.5 * Math.random(),
        emptySizeRatio: 0,
        circlePadding: 4,
        backgroundColor: 'rgba(229,229,229,1)',
      }}
    />
  </Chart>
);
