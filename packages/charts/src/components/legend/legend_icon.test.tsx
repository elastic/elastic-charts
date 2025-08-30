/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render } from '@testing-library/react';
import React from 'react';

import { LegendValue } from '../../common/legend';
import { ScaleType } from '../../scales/constants';
import { Settings, LineSeries, AreaSeries } from '../../specs';
import { Chart } from '../chart';

describe('Legend icons', () => {
  it('should test default dot icons', () => {
    const { container } = render(
      <Chart>
        <Settings showLegend legendValues={[LegendValue.LastValue]} />
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
    // LegendIcon renders an <svg aria-label="..."> with a <path>
    const svg = container.querySelector('svg[aria-label]');
    expect(svg).toBeTruthy();
    const path = svg?.querySelector('path');
    expect(path?.getAttribute('fill')).toEqual('#16C5C0');
  });

  it('should align styles - stroke', () => {
    const { container } = render(
      <Chart>
        <Settings showLegend legendValues={[LegendValue.LastValue]} />
        <AreaSeries
          id="areas"
          name="area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          splitSeriesAccessors={[2]}
          color="#ff1a1a"
          data={[[0, 123, 'group0']]}
        />
      </Chart>,
    );
    const svg = container.querySelector('svg[aria-label]');
    const path = svg?.querySelector('path');
    expect(path?.getAttribute('fill')).toEqual('#ff1a1a');
  });
});
