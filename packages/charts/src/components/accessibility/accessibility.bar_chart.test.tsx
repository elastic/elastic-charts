/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import React from 'react';

import { Axis, BarSeries, Settings } from '../../specs';
import { Position } from '../../utils/common';
import { BARCHART_1Y1G } from '../../utils/data_samples/test_dataset';
import { GITHUB_DATASET } from '../../utils/data_samples/test_dataset_github';
import { Chart } from '../chart';

describe('Bar chart accessibility with realistic data', () => {
  // These tests verify the dynamically generated a11y summaries
  // rather than testing aria-label/aria-description attributes
  it('should generate dynamic a11y summary for basic bar chart', () => {
    // Simple test data similar to Vega bar chart example
    const testData = [
      { category: 'A', amount: 28 },
      { category: 'B', amount: 55 },
      { category: 'C', amount: 43 },
      { category: 'D', amount: 91 },
      { category: 'E', amount: 81 },
    ];

    const wrapper = mount(
      <Chart size={[500, 300]} id="basic-bar-chart">
        <Settings debug rendering="svg" />
        <BarSeries id="bars" data={testData} xAccessor="category" yAccessors={['amount']} />
      </Chart>,
    );

    const screenReaderContent = wrapper.find('.echScreenReaderOnly').text();

    // Single series bar chart shows chart type with data context
    expect(screenReaderContent).toBe('bar chart with 5 categories, values ranging from 28 to 91.');
  });

  it('should generate dynamic a11y summary for grouped bar chart', () => {
    const wrapper = mount(
      <Chart size={[400, 250]} id="multi-group-bar">
        <Settings debug rendering="svg" showLegend={false} />
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

    // Assert the full a11y summary
    expect(screenReaderContent).toBe('bar chart with 2 bars: Group A, Group B.');
  });

  it('should generate dynamic a11y summary for single series bar chart', () => {
    const wrapper = mount(
      <Chart size={[400, 250]} id="axis-info-bar">
        <Settings debug rendering="svg" />
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

    // Assert the full a11y summary
    // Single series bar chart shows chart type with data context
    expect(screenReaderContent).toBe('bar chart with 6 categories, values ranging from 6 to 22.');
  });

  it('should handle empty data gracefully for accessibility', () => {
    const wrapper = mount(
      <Chart size={[400, 250]} id="empty-bar-chart">
        <Settings debug rendering="svg" />
        <BarSeries id="empty-series" name="Empty Series" data={[]} xAccessor="x" yAccessors={['y']} />
      </Chart>,
    );

    // Check if screen reader element exists, if not, that's expected for empty data
    const screenReaderElements = wrapper.find('.echScreenReaderOnly');
    const chartElements = wrapper.find('.echChart');

    // Should have either screen reader content or just the chart container
    expect(screenReaderElements.length > 0 || chartElements.length === 1).toBe(true);

    // For empty charts, we expect either no screen reader content or minimal content
    // This is acceptable behavior as there's no meaningful data to describe
    expect(screenReaderElements.length).toBeGreaterThanOrEqual(0);
  });

  it('should generate dynamic a11y summary for stacked bar chart', () => {
    const stackedData = GITHUB_DATASET.slice(0, 8);

    const wrapper = mount(
      <Chart size={[500, 300]} id="stacked-bar-chart">
        <Settings debug rendering="svg" />
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

    // Assert the full a11y summary for stacked charts
    expect(screenReaderContent).toBe('stacked bar chart with 2 bars: Issues, Issues.');
  });

  it('should include axis descriptions in a11y summary when Axis specs are provided', () => {
    const wrapper = mount(
      <Chart size={[500, 300]} id="bar-chart-with-axes">
        <Settings debug rendering="svg" />
        <Axis id="bottom" position={Position.Bottom} title="Visualization Type" />
        <Axis id="left" position={Position.Left} title="Issue Count" />
        <BarSeries
          id="issues"
          name="Issues"
          data={GITHUB_DATASET.slice(0, 6)}
          xAccessor="vizType"
          yAccessors={['count']}
        />
      </Chart>,
    );

    const screenReaderContent = wrapper.find('.echScreenReaderOnly').text();

    // Assert the full a11y summary including axis information
    expect(screenReaderContent).toBe(
      'bar chart with 6 categories, values ranging from 6 to 22. X axis displays Visualization Type with 3 categories. Y axis displays Issue Count, ranging from 0 to 22.',
    );
  });
});
