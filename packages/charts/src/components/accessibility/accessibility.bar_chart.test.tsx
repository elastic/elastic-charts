/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render, screen } from '@testing-library/react';
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

    render(
      <Chart size={[500, 300]} id="basic-bar-chart">
        <Settings debug rendering="svg" />
        <BarSeries id="bars" data={testData} xAccessor="category" yAccessors={['amount']} />
      </Chart>,
    );

    // Single series bar chart shows chart type with data context
    expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe(
      'Bar chart with 5 categories, values ranging from 28 to 91.',
    );
  });

  it('should generate dynamic a11y summary for grouped bar chart', () => {
    render(
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

    // Assert the full a11y summary
    expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('Bar chart with 2 bars: Group A, Group B.');
  });

  it('should generate dynamic a11y summary for single series bar chart', () => {
    render(
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

    // Assert the full a11y summary
    // Single series bar chart shows chart type with data context
    expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe(
      'Bar chart with 6 categories, values ranging from 6 to 22.',
    );
  });

  it('should generate dynamic a11y summary for stacked bar chart', () => {
    const stackedData = GITHUB_DATASET.slice(0, 8);

    render(
      <Chart size={[500, 300]} id="stacked-bar-chart">
        <Settings debug rendering="svg" />
        <BarSeries
          id="stacked-issues"
          data={stackedData}
          xAccessor="vizType"
          yAccessors={['count']}
          splitSeriesAccessors={['issueType']}
          stackAccessors={['vizType']}
        />
      </Chart>,
    );

    // Assert the full a11y summary for stacked charts
    expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe('Stacked bar chart with 2 bars: Bug, Other.');
  });

  it('should include axis descriptions in a11y summary when Axis specs are provided', () => {
    render(
      <Chart size={[500, 300]} id="bar-chart-with-axes">
        <Settings debug rendering="svg" />
        <Axis id="bottom" position={Position.Bottom} title="Visualization Type" />
        <Axis id="left" position={Position.Left} title="Issue Count" />
        <BarSeries id="issues" data={GITHUB_DATASET.slice(0, 6)} xAccessor="vizType" yAccessors={['count']} />
      </Chart>,
    );

    // Assert the full a11y summary including axis information
    expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe(
      'Bar chart with 6 categories, values ranging from 6 to 22. X axis displays Visualization Type with 3 categories. Y axis displays Issue Count, ranging from 0 to 22.',
    );
  });
});
