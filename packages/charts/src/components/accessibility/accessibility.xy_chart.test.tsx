/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import React from 'react';

import { BarSeries, LineSeries, Settings } from '../../specs';
import { Chart } from '../chart';

describe('XY Chart Accessibility', () => {
  describe('Screen reader summary xy charts', () => {
    it('should include the series types if one type of series', () => {
      const wrapper = mount(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );
      expect(wrapper.find('.echScreenReaderOnly').text()).toContain('bar chart');
    });

    it('should include the series types if multiple types of series', () => {
      const wrapper = mount(
        <Chart size={[100, 100]} id="chart1">
          <Settings debug rendering="svg" showLegend />
          <BarSeries id="test" data={[{ x: 0, y: 2 }]} xAccessor="x" yAccessors={['y']} />
          <LineSeries id="test2" data={[{ x: 3, y: 5 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );
      expect(wrapper.find('.echScreenReaderOnly').text()).toContain('Mixed chart: bar and line chart');
    });
  });
});
