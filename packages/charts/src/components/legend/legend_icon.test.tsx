/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import React from 'react';

import { ScaleType } from '../../scales/constants';
import { Settings, LineSeries, AreaSeries } from '../../specs';
import { Chart } from '../chart';
import { LegendIcon } from './legend_icon';

describe('Legend icons', () => {
  it('should test default dot icons', () => {
    const wrapper = mount(
      <Chart>
        <Settings showLegend showLegendExtra />
        <LineSeries
          id="areas"
          name="area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          splitSeriesAccessors={[2]}
          data={[[0, 123, 'group0']]}
        />
      </Chart>,
    );
    const legendIconWrapper = wrapper.find(LegendIcon);
    expect(legendIconWrapper.exists).toBeTruthy();
    expect(legendIconWrapper.first().getElement().props.color).toEqual('#54B399');
  });

  it('should align styles - stroke', () => {
    const wrapperColorChange = mount(
      <Chart>
        <Settings showLegend showLegendExtra />
        <AreaSeries
          id="areas"
          name="area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          splitSeriesAccessors={[2]}
          areaSeriesStyle={{
            point: {
              stroke: '#ff1a1a',
            },
          }}
          data={[[0, 123, 'group0']]}
        />
      </Chart>,
    );
    const legendIconWrapper = wrapperColorChange.find(LegendIcon);
    expect(legendIconWrapper.getElement().props.pointStyle.stroke).toEqual('#ff1a1a');
  });
});
