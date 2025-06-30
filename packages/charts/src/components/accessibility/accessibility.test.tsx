/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render, screen, within } from '@testing-library/react';
import React from 'react';

import { Goal } from '../../chart_types/goal_chart/specs';
import { GoalSubtype } from '../../chart_types/goal_chart/specs/constants';
import { defaultPartitionValueFormatter } from '../../chart_types/partition_chart/layout/config';
import { PartitionLayout } from '../../chart_types/partition_chart/layout/types/config_types';
import { arrayToLookup } from '../../common/color_calcs';
import { mocks } from '../../mocks/hierarchical';
import { productDimension } from '../../mocks/hierarchical/dimension_codes';
import { BarSeries, LineSeries, Partition, Settings } from '../../specs';
import type { Datum } from '../../utils/common';
import { Chart } from '../chart';

describe('Accessibility', () => {
  describe('Screen reader summary xy charts', () => {
    it('should include the series types if one type of series', () => {
      render(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe(
        'Bar chart with 1 categories, values ranging from 2 to 2.',
      );
    });
    it('should include the series types if multiple types of series', () => {
      render(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
          <LineSeries id="test2" data={[{ x: 3, y: 5 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('Mixed chart: bar and line chart.');
    });
  });

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
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('Sunburst chart.');
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
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('Treemap chart.');
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

  describe('Goal chart type accessibility', () => {
    const bandLabelsAscending = ['freezing', 'chilly', 'brisk'];
    const bandsAscending = [200, 250, 300];

    it('should test defaults for goal charts', () => {
      render(
        <Chart>
          <Goal
            id="spec_1"
            subtype={GoalSubtype.Goal}
            base={0}
            target={260}
            actual={170}
            bands={[200, 250, 300]}
            domain={{ min: 0, max: 300 }}
            ticks={[0, 50, 100, 150, 200, 250, 300]}
            labelMajor="Revenue 2020 YTD  "
            labelMinor="(thousand USD)  "
            centralMajor="170"
            centralMinor=""
            angleStart={Math.PI}
            angleEnd={0}
          />
        </Chart>,
      );
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe(
        'Goal chart.Major label:Revenue 2020 YTD  Minor label:(thousand USD)  Minimum:0Maximum:300Target:260Value:170',
      );
    });
    it('should correctly render ascending semantic values', () => {
      render(
        <Chart className="story-chart">
          <Goal
            id="spec_1"
            subtype={GoalSubtype.Goal}
            base={0}
            target={260}
            actual={170}
            bands={bandsAscending}
            domain={{ min: 0, max: 300 }}
            ticks={[0, 50, 100, 150, 200, 250, 300]}
            labelMajor="Revenue 2020 YTD  "
            labelMinor="(thousand USD)  "
            centralMajor="170"
            centralMinor=""
            angleStart={Math.PI}
            angleEnd={0}
            bandLabels={bandLabelsAscending}
          />
        </Chart>,
      );

      expect(screen.getByTestId('echGoalScreenReaderDescription').textContent).toBe(
        '0 - 200freezing200 - 250chilly250 - 300brisk',
      );
    });
  });
});
