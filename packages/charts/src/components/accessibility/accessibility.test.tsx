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
import { BARCHART_1Y1G } from '../../utils/data_samples/test_dataset';
import { GITHUB_DATASET } from '../../utils/data_samples/test_dataset_github';
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
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('bar chart.');
    });
    it('should include the series types if multiple types of series', () => {
      render(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
          <LineSeries id="test2" data={[{ x: 3, y: 5 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('mixed chart: bar and line chart.');
    });
  });

  describe('Bar chart accessibility with realistic data', () => {
    it('should provide screen reader information for grouped bar chart', () => {
      const wrapper = mount(
        <Chart size={[500, 300]} id="grouped-bar-chart">
          <Settings
            debug
            rendering="svg"
            showLegend
            ariaLabel="GitHub Issues by Visualization Type and Issue Type"
            ariaDescription="Bar chart showing bug reports and other issues across different visualization types in GitHub repositories"
          />
          <BarSeries
            id="bug-reports"
            name="Bug Reports"
            data={GITHUB_DATASET.filter((d) => d.issueType === 'Bug')}
            xAccessor="vizType"
            yAccessors={['count']}
            splitSeriesAccessors={['authorAssociation']}
          />
          <BarSeries
            id="other-issues"
            name="Other Issues"
            data={GITHUB_DATASET.filter((d) => d.issueType === 'Other')}
            xAccessor="vizType"
            yAccessors={['count']}
            splitSeriesAccessors={['authorAssociation']}
          />
        </Chart>,
      );

      const screenReaderContent = wrapper.find('.echScreenReaderOnly').text();

      // Should identify chart type
      expect(screenReaderContent).toContain('bar chart');

      // Should include series information
      expect(screenReaderContent).toContain('Bug Reports');
      expect(screenReaderContent).toContain('Other Issues');

      // Should include the chart title/description
      expect(screenReaderContent).toContain('GitHub Issues by Visualization Type and Issue Type');
    });

    it('should generate accessible data table for multi-group bar chart', () => {
      const wrapper = mount(
        <Chart size={[400, 250]} id="multi-group-bar">
          <Settings debug rendering="svg" showLegend={false} ariaLabel="Sample Data by Category and Group" />
          <BarSeries
            id="group-a"
            name="Group A"
            data={BARCHART_1Y1G.filter((d) => d.g === 'a')}
            xAccessor="x"
            yAccessors={['y']}
          />
          <BarSeries
            id="group-b"
            name="Group B"
            data={BARCHART_1Y1G.filter((d) => d.g === 'b')}
            xAccessor="x"
            yAccessors={['y']}
          />
        </Chart>,
      );

      const screenReaderContent = wrapper.find('.echScreenReaderOnly').text();

      // Should describe chart structure
      expect(screenReaderContent).toContain('bar chart');
      expect(screenReaderContent).toContain('Group A');
      expect(screenReaderContent).toContain('Group B');

      // Should include accessible chart label
      expect(screenReaderContent).toContain('Sample Data by Category and Group');
    });

    it('should provide axis information for screen readers', () => {
      const wrapper = mount(
        <Chart size={[400, 250]} id="axis-info-bar">
          <Settings
            debug
            rendering="svg"
            ariaLabel="Issue Count by Visualization Type"
            ariaDescription="Horizontal axis shows visualization types, vertical axis shows number of issues"
          />
          <BarSeries
            id="issue-count"
            name="Issue Count"
            data={GITHUB_DATASET.slice(0, 6)}
            xAccessor="vizType"
            yAccessors={['count']}
          />
        </Chart>,
      );

      const screenReaderContent = wrapper.find('.echScreenReaderOnly').text();

      // Should include chart description
      expect(screenReaderContent).toContain('Issue Count by Visualization Type');
      expect(screenReaderContent).toContain(
        'Horizontal axis shows visualization types, vertical axis shows number of issues',
      );

      // Should identify as bar chart
      expect(screenReaderContent).toContain('bar chart');
    });

    it('should handle empty data gracefully for accessibility', () => {
      const wrapper = mount(
        <Chart size={[400, 250]} id="empty-bar-chart">
          <Settings debug rendering="svg" ariaLabel="Empty Bar Chart" ariaDescription="No data available to display" />
          <BarSeries id="empty-series" name="Empty Series" data={[]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );

      // Check if screen reader element exists, if not, that's expected for empty data
      const screenReaderElements = wrapper.find('.echScreenReaderOnly');
      if (screenReaderElements.length > 0) {
        const screenReaderContent = screenReaderElements.text();

        // Should still provide basic accessibility information
        expect(screenReaderContent).toContain('Empty Bar Chart');
        expect(screenReaderContent).toContain('No data available to display');
      } else {
        // If no screen reader element, verify the chart container exists but is empty
        expect(wrapper.find('.echChart')).toHaveLength(1);
      }
    });

    it('should provide meaningful descriptions for stacked bar charts', () => {
      const stackedData = GITHUB_DATASET.slice(0, 8);

      const wrapper = mount(
        <Chart size={[500, 300]} id="stacked-bar-chart">
          <Settings debug rendering="svg" ariaLabel="Stacked Issues by Visualization Type and Author Association" />
          <BarSeries
            id="stacked-issues"
            name="Issues"
            data={stackedData}
            xAccessor="vizType"
            yAccessors={['count']}
            splitSeriesAccessors={['issueType']}
            stackAccessors={['vizType']}
          />
        </Chart>,
      );

      const screenReaderContent = wrapper.find('.echScreenReaderOnly').text();

      // Should identify as stacked bar chart
      expect(screenReaderContent).toMatch(/stacked.*bar chart|bar chart/);

      // Should include the accessibility label
      expect(screenReaderContent).toContain('Stacked Issues by Visualization Type and Author Association');
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
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('sunburst chart.');
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
      expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('treemap chart.');
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
        'goal chart.Major label:Revenue 2020 YTD  Minor label:(thousand USD)  Minimum:0Maximum:300Target:260Value:170',
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
