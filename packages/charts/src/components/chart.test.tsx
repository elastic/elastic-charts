/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { Chart } from './chart';
import { Settings, BarSeries } from '../specs';
import { selectorMemos } from '../state/create_selector';

interface Datum {
  x: number;
  y: number;
}

describe('Chart', () => {
  it("should render 'No data to display' without series", () => {
    render(<Chart />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it("should render 'No data to display' with settings but without series", () => {
    render(
      <Chart>
        <Settings debug rendering="svg" />
      </Chart>,
    );
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it("should render 'No data to display' with an empty dataset", () => {
    render(
      <Chart size={[100, 100]}>
        <Settings debug rendering="svg" />
        <BarSeries<Datum> id="test" data={[]} xAccessor="x" yAccessors={['y']} />
      </Chart>,
    );
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('should render the legend name test', () => {
    render(
      <Chart size={[100, 100]} id="chart1">
        <Settings debug rendering="svg" showLegend />
        <BarSeries id="tests the series name in legend" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
      </Chart>,
    );
    expect(screen.getByText('tests the series name in legend')).toBeInTheDocument();
  });

  it('lets go of the memos of its selectors when it unmounts', () => {
    const chartMemos = jest.spyOn(selectorMemos, 'chartMemos');
    const release = jest.spyOn(selectorMemos, 'release');
    const { unmount } = render(
      <Chart size={[100, 100]}>
        <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
      </Chart>,
    );
    expect(release).not.toHaveBeenCalled();
    unmount();
    expect(release).toHaveBeenCalledTimes(1);
    // the key of the states that the selectors of this chart were asked about
    expect(release.mock.calls[0]?.[0]).toBe(chartMemos.mock.calls[0]?.[0].uniqueChartKey);
    jest.restoreAllMocks();
  });
});
