/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render } from '@testing-library/react';
import React from 'react';

import type { DebugState } from './types';
import { BarSeries } from '../chart_types/xy_chart/specs/bar_series';
import { Chart } from '../components/chart';
import { MockSeriesSpec } from '../mocks/specs/specs';
import { Settings } from '../specs/settings';

function getDebugState(container: HTMLElement): DebugState {
  const statusEl = container.querySelector('.echChartStatus');
  const raw = statusEl?.getAttribute('data-ech-debug-state') ?? 'null';
  const parsedDebugState = JSON.parse(raw);
  return parsedDebugState as DebugState;
}

describe('Spec factory', () => {
  const spec1 = MockSeriesSpec.bar({ id: 'spec1', data: [{ x: 0, y: 1 }] });
  const spec2 = MockSeriesSpec.bar({ id: 'spec2', data: [{ x: 0, y: 2 }] });

  it('We can switch specs props between react component', () => {
    const { container, rerender } = render(
      <Chart size={[100, 100]} id="chart1">
        <Settings debugState />
        <BarSeries {...spec1} />;
        <BarSeries {...spec2} />;
      </Chart>,
    );

    expect(getDebugState(container).bars).toHaveLength(2);

    rerender(
      <Chart size={[100, 100]} id="chart1">
        <Settings debugState />
        <BarSeries {...spec2} />;
        <BarSeries {...spec1} />;
      </Chart>,
    );
    expect(getDebugState(container).bars).toHaveLength(2);
  });

  it('We can switch specs ids between react component', () => {
    const { container, rerender } = render(
      <Chart size={[100, 100]} id="chart1">
        <Settings debugState />
        <BarSeries {...spec1} />;
        <BarSeries {...spec2} />;
      </Chart>,
    );
    expect(getDebugState(container).bars).toHaveLength(2);
    rerender(
      <Chart size={[100, 100]} id="chart1">
        <Settings debugState />
        <BarSeries {...spec1} id={spec2.id} />;
        <BarSeries {...spec2} id={spec1.id} />;
      </Chart>,
    );
    expect(getDebugState(container).bars).toHaveLength(2);

    // different id same y
    const debugState = getDebugState(container);
    expect(debugState.bars?.[0]?.name).toBe('spec2');
    expect(debugState.bars?.[0]?.bars[0]?.y).toBe(1);

    // different id same y
    expect(debugState.bars?.[1]?.name).toBe('spec1');
    expect(debugState.bars?.[1]?.bars[0]?.y).toBe(2);
  });
});
