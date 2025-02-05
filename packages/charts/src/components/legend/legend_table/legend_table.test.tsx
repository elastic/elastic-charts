/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import React from 'react';

import { LegendTable } from './legend_table';
import { BarSeries } from '../../../chart_types/specs';
import { ScaleType } from '../../../scales/constants';
import { Settings } from '../../../specs';
import { Chart } from '../../chart';
import { LegendTableRow } from '../legend_table/legend_table_row';

describe('Legend', () => {
  const renderChartWithLegendTable = (legendValues = ['min' as const, 'max' as const]) => {
    const wrapper = mount(
      <Chart>
        <Settings showLegend legendValues={legendValues} />
        <BarSeries
          id="areas"
          name="area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          splitSeriesAccessors={[2]}
          data={[
            [0, 10, 'first'],
            [0, 3, 'second'],
            [0, 8, 'third'],
            [0, 10, 'fourth'],
          ]}
        />
      </Chart>,
    );
    return wrapper;
  };
  it('shall render the all the series names', () => {
    const wrapper = renderChartWithLegendTable();
    const legendWrapper = wrapper.find(LegendTable);
    expect(legendWrapper.exists).toBeTruthy();
    const legendRows = legendWrapper.find(LegendTableRow);
    expect(legendRows.exists).toBeTruthy();
    expect(legendRows).toHaveLength(5);
    const expectedTable = ['MinMax', 'first1010', 'second33', 'third88', 'fourth1010'];
    expect(legendRows.map((row) => row.text())).toEqual(expectedTable);
  });
});
