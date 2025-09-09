/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { ScaleType } from '../../../scales/constants';
import { Settings, BarSeries } from '../../../specs';
import { Chart } from '../../chart';

describe('Legend', () => {
  const renderChartWithLegendTable = (legendValues = ['min' as const, 'max' as const]) => {
    const utils = render(
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
    return utils;
  };
  it('shall render the all the series names', () => {
    renderChartWithLegendTable();
    const table = screen.getByRole('table');
    expect(table).toBeTruthy();
    const rows = screen.getAllByRole('row');
    // 4 split series + header row
    expect(rows.length).toBe(5);
    const rowTexts = Array.from(rows).map((r) => r.textContent?.replace(/\s+/g, '') ?? '');
    const expectedTable = ['MinMax', 'first1010', 'second33', 'third88', 'fourth1010'];
    expect(rowTexts).toEqual(expectedTable);
  });
});
