/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TickLabelBounds } from './axis_utils';
import { computeChartDimensions } from './dimensions';
import { AxisSpec } from './specs';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { Position } from '../../../utils/common';
import { Margins } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { LegendStyle } from '../../../utils/themes/theme';
import { ChartType } from '../../chart_type';
import { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';

describe('Computed chart dimensions', () => {
  const parentDim = {
    width: 100,
    height: 100,
    top: 0,
    left: 0,
  };
  const chartMargins: Margins = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  };
  const chartPaddings: Margins = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  };

  const axis1Dims: TickLabelBounds = {
    maxLabelBboxWidth: 10,
    maxLabelBboxHeight: 10,
    maxLabelTextWidth: 10,
    maxLabelTextHeight: 10,
    isHidden: false,
  };
  const axisLeftSpec: AxisSpec = {
    chartType: ChartType.XYAxis,
    specType: SpecType.Axis,
    id: 'axis_1',
    groupId: 'group_1',
    hide: false,
    showOverlappingTicks: false,
    showOverlappingLabels: false,
    position: Position.Left,
    tickFormat: (value: any) => `${value}`,
    timeAxisLayerCount: 0,
  };
  const legend: LegendStyle = {
    verticalWidth: 10,
    horizontalHeight: 10,
    spacingBuffer: 10,
    margin: 0,
    labelOptions: {
      maxLines: 1,
    },
  };
  const defaultTheme = LIGHT_THEME;
  const chartTheme = {
    ...defaultTheme,
    chartMargins,
    chartPaddings,
    axes: {
      ...defaultTheme.axes,
    },
    ...legend,
  };
  chartTheme.axes.axisTitle.fontSize = 10;
  chartTheme.axes.axisTitle.padding = 10;
  test('should be equal to parent dimension with no axis minus margins', () => {
    const axisDims: AxesTicksDimensions = new Map();
    const axisStyles = new Map();
    const axisSpecs: AxisSpec[] = [];
    const { chartDimensions } = computeChartDimensions(parentDim, chartTheme, axisDims, axisStyles, axisSpecs, null);
    expect(chartDimensions.left + chartDimensions.width).toBeLessThanOrEqual(parentDim.width);
    expect(chartDimensions.top + chartDimensions.height).toBeLessThanOrEqual(parentDim.height);
    expect(chartDimensions).toMatchSnapshot();
  });
  test('should be padded by a left axis', () => {
    // |margin|titleFontSize|titlePadding|maxLabelBboxWidth|tickPadding|tickSize|padding|
    // \10|10|10|10|10|10|10| = 70px from left
    const axisDims: AxesTicksDimensions = new Map();
    const axisStyles = new Map();
    const axisSpecs = [axisLeftSpec];
    axisDims.set('axis_1', axis1Dims);
    const { chartDimensions } = computeChartDimensions(parentDim, chartTheme, axisDims, axisStyles, axisSpecs, null);
    expect(chartDimensions.left + chartDimensions.width).toBeLessThanOrEqual(parentDim.width);
    expect(chartDimensions.top + chartDimensions.height).toBeLessThanOrEqual(parentDim.height);
    expect(chartDimensions).toMatchSnapshot();
  });
  test('should be padded by a right axis', () => {
    // |padding|tickSize|tickPadding|maxLabelBBoxWidth|titlePadding|titleFontSize\margin|
    // \10|10|10|10|10|10|10| = 70px from right
    const axisDims: AxesTicksDimensions = new Map();
    const axisStyles = new Map();
    const axisSpecs = [{ ...axisLeftSpec, position: Position.Right }];
    axisDims.set('axis_1', axis1Dims);
    const { chartDimensions } = computeChartDimensions(parentDim, chartTheme, axisDims, axisStyles, axisSpecs, null);
    expect(chartDimensions.left + chartDimensions.width).toBeLessThanOrEqual(parentDim.width);
    expect(chartDimensions.top + chartDimensions.height).toBeLessThanOrEqual(parentDim.height);
    expect(chartDimensions).toMatchSnapshot();
  });
  test('should be padded by a top axis', () => {
    // |margin|titleFontSize|titlePadding|maxLabelBboxHeight|tickPadding|tickSize|padding|
    // \10|10|10|10|10|10|10| = 70px from top
    const axisDims: AxesTicksDimensions = new Map();
    const axisStyles = new Map();
    const axisSpecs = [
      {
        ...axisLeftSpec,
        position: Position.Top,
      },
    ];
    axisDims.set('axis_1', axis1Dims);
    const { chartDimensions } = computeChartDimensions(parentDim, chartTheme, axisDims, axisStyles, axisSpecs, null);
    expect(chartDimensions.left + chartDimensions.width).toBeLessThanOrEqual(parentDim.width);
    expect(chartDimensions.top + chartDimensions.height).toBeLessThanOrEqual(parentDim.height);
    expect(chartDimensions).toMatchSnapshot();
  });
  test('should be padded by a bottom axis', () => {
    // |margin|titleFontSize|titlePadding|maxLabelBboxHeight|tickPadding|tickSize|padding|
    // \10|10|10|10|10|10|10| = 70px from bottom
    const axisDims: AxesTicksDimensions = new Map();
    const axisStyles = new Map();
    const axisSpecs = [
      {
        ...axisLeftSpec,
        position: Position.Bottom,
      },
    ];
    axisDims.set('axis_1', axis1Dims);
    const { chartDimensions } = computeChartDimensions(parentDim, chartTheme, axisDims, axisStyles, axisSpecs, null);
    expect(chartDimensions.left + chartDimensions.width).toBeLessThanOrEqual(parentDim.width);
    expect(chartDimensions.top + chartDimensions.height).toBeLessThanOrEqual(parentDim.height);
    expect(chartDimensions).toMatchSnapshot();
  });
  test('should not add space for axis when no spec for axis dimensions or axis is hidden', () => {
    const axisDims: AxesTicksDimensions = new Map();
    const axisStyles = new Map();
    const axisSpecs = [
      {
        ...axisLeftSpec,
        position: Position.Bottom,
      },
    ];
    axisDims.set('foo', axis1Dims);
    const chartDimensions = computeChartDimensions(parentDim, chartTheme, axisDims, axisStyles, axisSpecs, null);

    const expectedDims = {
      chartDimensions: {
        height: 60,
        width: 60,
        left: 20,
        top: 20,
      },
      leftMargin: 10,
    };

    expect(chartDimensions).toEqual(expectedDims);

    const hiddenAxisDims: AxesTicksDimensions = new Map();
    const hiddenAxisSpecs = new Map<AxisId, AxisSpec>();
    hiddenAxisDims.set('axis_1', axis1Dims);
    hiddenAxisSpecs.set('axis_1', {
      ...axisLeftSpec,
      hide: true,
      position: Position.Bottom,
    });
    const hiddenAxisChartDimensions = computeChartDimensions(
      parentDim,
      chartTheme,
      axisDims,
      axisStyles,
      axisSpecs,
      null,
    );

    expect(hiddenAxisChartDimensions).toEqual(expectedDims);
  });
});
