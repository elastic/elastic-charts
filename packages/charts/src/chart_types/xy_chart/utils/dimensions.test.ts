/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartArea, type AxesPerSide } from './dimensions';
import type { Dimensions, Margins } from '../../../utils/dimensions';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';

describe('Computed chart dimensions', () => {
  const container: Dimensions = {
    width: 100,
    height: 100,
    top: 0,
    left: 0,
  };
  const chartPaddings: Margins = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  };
  const theme = {
    ...LIGHT_THEME,
    chartPaddings,
  };

  const baseAxes: AxesPerSide = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
    margin: { left: 10 },
  };

  test('applies axis margins and chart paddings with no axis space', () => {
    expect(computeChartArea(container, baseAxes, theme)).toEqual({
      leftMargin: 10,
      chartDimensions: {
        left: 20,
        top: 20,
        width: 60,
        height: 60,
      },
    });
  });

  test('reserves space for a left axis', () => {
    const axes: AxesPerSide = { ...baseAxes, left: 38 };
    expect(computeChartArea(container, axes, theme)).toEqual({
      leftMargin: 10,
      chartDimensions: {
        left: 48,
        top: 20,
        width: 32,
        height: 60,
      },
    });
  });

  test('should be padded by a right axis', () => {
    const axes: AxesPerSide = { ...baseAxes, right: 38 };
    expect(computeChartArea(container, axes, theme)).toEqual({
      leftMargin: 10,
      chartDimensions: {
        left: 20,
        top: 20,
        width: 32,
        height: 60,
      },
    });
  });

  test('should be padded by a top axis', () => {
    const axes: AxesPerSide = { ...baseAxes, top: 38 };
    expect(computeChartArea(container, axes, theme)).toEqual({
      leftMargin: 10,
      chartDimensions: {
        left: 20,
        top: 48,
        width: 60,
        height: 32,
      },
    });
  });

  test('reserves space for a bottom axis', () => {
    const axes: AxesPerSide = { ...baseAxes, bottom: 38 };
    expect(computeChartArea(container, axes, theme)).toEqual({
      leftMargin: 10,
      chartDimensions: {
        left: 20,
        top: 20,
        width: 60,
        height: 32,
      },
    });
  });

  test('clamps chart dimensions to zero when axes and paddings exceed the container', () => {
    const axes: AxesPerSide = {
      left: 50,
      right: 50,
      top: 50,
      bottom: 50,
      margin: { left: 0 },
    };
    expect(computeChartArea(container, axes, theme)).toEqual({
      leftMargin: 0,
      chartDimensions: {
        left: 60,
        top: 60,
        width: 0,
        height: 0,
      },
    });
  });

  test('chart area stays within the container bounds', () => {
    const axes: AxesPerSide = { ...baseAxes, left: 38, bottom: 38 };
    const { chartDimensions } = computeChartArea(container, axes, theme);

    expect(chartDimensions.left + chartDimensions.width).toBeLessThanOrEqual(container.width);
    expect(chartDimensions.top + chartDimensions.height).toBeLessThanOrEqual(container.height);
  });
});
