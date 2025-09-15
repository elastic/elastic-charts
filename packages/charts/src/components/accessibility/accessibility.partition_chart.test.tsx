/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render, screen, within } from '@testing-library/react';
import React from 'react';

import { defaultPartitionValueFormatter } from '../../chart_types/partition_chart/layout/config';
import { PartitionLayout } from '../../chart_types/partition_chart/layout/types/config_types';
import { arrayToLookup } from '../../common/color_calcs';
import { mocks } from '../../mocks/hierarchical';
import { productDimension } from '../../mocks/hierarchical/dimension_codes';
import { Partition, Settings } from '../../specs';
import type { Datum } from '../../utils/common';
import { Chart } from '../chart';

describe('Partition charts accessibility', () => {
  const productLookup = arrayToLookup((d: any) => d.sitc1, productDimension);
  type TestDatum = { cat1: string; cat2: string; val: number };

  it('should include the series type if partition chart', () => {
    render(
      <Chart size={[100, 100]} id="chart1">
        <Partition
          id="spec_1"
          data={mocks.pie}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
        />
      </Chart>,
    );
    expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('Sunburst chart. 10 data points.');
  });
  it('should include series type if treemap type', () => {
    render(
      <Chart size={[100, 100]} id="chart1">
        <Partition
          id="spec_1"
          data={mocks.pie}
          layout={PartitionLayout.treemap}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
        />
      </Chart>,
    );
    expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('Treemap chart. 10 data points.');
  });
  it('should test defaults for screen reader data  table', () => {
    render(
      <Chart size={[100, 100]} id="chart1">
        <Partition
          id="spec_1"
          data={mocks.pie}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${defaultPartitionValueFormatter(Math.round(d / 1000000000))}\u00A0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
        />
      </Chart>,
    );
    const firstRow = within(screen.getByTestId('echScreenReaderTable')).queryAllByRole('row')[0];
    expect(firstRow?.textContent).toEqual('LabelValuePercentage');
  });
  it('should  include additional columns if a multilayer pie chart', () => {
    render(
      <Chart>
        <Settings showLegend flatLegend={false} legendMaxDepth={2} />
        <Partition
          id="spec_1"
          data={[
            { cat1: 'A', cat2: 'A', val: 1 },
            { cat1: 'A', cat2: 'B', val: 1 },
            { cat1: 'B', cat2: 'A', val: 1 },
            { cat1: 'B', cat2: 'B', val: 1 },
            { cat1: 'C', cat2: 'A', val: 1 },
            { cat1: 'C', cat2: 'B', val: 1 },
          ]}
          valueAccessor={(d: TestDatum) => d.val}
          layers={[
            {
              groupByRollup: (d: TestDatum) => d.cat1,
            },
            {
              groupByRollup: (d: TestDatum) => d.cat2,
            },
          ]}
        />
      </Chart>,
    );
    const firstRow = within(screen.getByTestId('echScreenReaderTable')).queryAllByRole('row')[0];
    expect(firstRow?.textContent).toEqual('DepthLabelParentValuePercentage');
  });
});
