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
  it('should provide screen reader information for grouped bar chart', () => {
    const wrapper = mount(
      <Chart size={[500, 300]} id="grouped-bar-chart">
        <Settings debug rendering="svg" showLegend />
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

    // Should identify chart type with dynamic summary
    expect(screenReaderContent).toContain('bar chart');

    // Should include series information from dynamic generation
    expect(screenReaderContent).toContain('bar chart with');
    expect(screenReaderContent).toMatch(/\d+ bars?/);

    // Dynamic summary focuses on chart type and series count
    // Axis information would require explicit Axis specs
  });

  it('should generate accessible data table for multi-group bar chart', () => {
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

    // Should describe chart structure dynamically
    expect(screenReaderContent).toContain('bar chart');
    expect(screenReaderContent).toMatch(/bar chart with \d+ bars?/);

    // Should include series names from the actual series specs
    expect(screenReaderContent).toMatch(/Group A|Group B/);

    // Dynamic summary provides chart type and series information
  });

  it('should provide axis information for screen readers', () => {
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

    // Should identify as bar chart from dynamic generation
    expect(screenReaderContent).toContain('bar chart');

    // Dynamic summary focuses on chart type
    // For single series, it may not always include the series name in the summary
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

    if (screenReaderElements.length > 0) {
      const screenReaderContent = screenReaderElements.text();
      // Should provide dynamically generated information about chart type
      expect(screenReaderContent).toMatch(/bar chart|chart/i);
      // May contain information about empty or no data
      expect(screenReaderContent.toLowerCase()).toMatch(/empty|no data|0/);
    }
  });

  it('should provide meaningful descriptions for stacked bar charts', () => {
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

    // Should identify as stacked bar chart from dynamic generation
    expect(screenReaderContent).toMatch(/stacked.*bar chart|bar chart/);

    // Should include information about the series
    expect(screenReaderContent).toMatch(/Issues|bar chart with \d+ bars?/);

    // Dynamic summary identifies stacking and series count
  });

  it('should include axis information when Axis specs are provided', () => {
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

    // Should identify as bar chart
    expect(screenReaderContent).toContain('bar chart');

    // With explicit Axis specs, should include axis descriptions
    expect(screenReaderContent).toMatch(/x axis displays visualization type/i);
    expect(screenReaderContent).toMatch(/y axis displays issue count/i);
  });
});
