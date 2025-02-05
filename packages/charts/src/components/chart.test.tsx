/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import React from 'react';

import { Chart } from './chart';
import { BarSeries } from '../chart_types/specs';
import { Settings } from '../specs';

interface Datum {
  x: number;
  y: number;
}

describe('Chart', () => {
  it("should render 'No data to display' without series", () => {
    const wrapper = mount(<Chart />);
    expect(wrapper.text()).toContain('No data to display');
  });

  it("should render 'No data to display' with settings but without series", () => {
    const wrapper = mount(
      <Chart>
        <Settings debug rendering="svg" />
      </Chart>,
    );
    expect(wrapper.text()).toContain('No data to display');
  });

  it("should render 'No data to display' with an empty dataset", () => {
    const wrapper = mount(
      <Chart size={[100, 100]}>
        <Settings debug rendering="svg" />
        <BarSeries<Datum> id="test" data={[]} xAccessor="x" yAccessors={['y']} />
      </Chart>,
    );
    expect(wrapper.text()).toContain('No data to display');
  });

  it('should render the legend name test', () => {
    // This is snapshot has a slight diff between local and ci runs, need to investigate
    // See https://github.com/elastic/elastic-charts/runs/4706561347?check_suite_focus=true
    const wrapper = mount(
      <Chart size={[100, 100]} id="chart1">
        <Settings debug rendering="svg" showLegend />
        <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
      </Chart>,
    );
    expect(wrapper.debug()).toMatchSnapshot();
  });
});
