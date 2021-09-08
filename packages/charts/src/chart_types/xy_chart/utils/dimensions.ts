/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SmallMultiplesSpec } from '../../../specs';
import { Dimensions } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { Theme, AxisStyle } from '../../../utils/themes/theme';
import { computeAxesSizes } from '../axes/axes_sizes';
import { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';
import { AxisSpec } from './specs';

/**
 * @internal
 */
export interface ChartDimensions {
  /**
   * Dimensions relative to canvas element
   */
  chartDimensions: Dimensions;
  /**
   * Margin to account for ending text overflow
   */
  leftMargin: number;
}

/**
 * Compute the chart dimensions. It's computed removing from the parent dimensions
 * the axis spaces, the legend and any other specified style margin and padding.
 * @internal
 */
export function computeChartDimensions(
  parentDimensions: Dimensions,
  theme: Theme,
  axisDimensions: AxesTicksDimensions,
  axesStyles: Map<AxisId, AxisStyle | null>,
  axisSpecs: AxisSpec[],
  smSpec?: SmallMultiplesSpec,
): ChartDimensions {
  if (parentDimensions.width <= 0 || parentDimensions.height <= 0) {
    return {
      chartDimensions: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      },
      leftMargin: 0,
    };
  }

  const axisSizes = computeAxesSizes(theme, axisDimensions, axesStyles, axisSpecs, smSpec);
  const chartWidth = parentDimensions.width - axisSizes.left - axisSizes.right;
  const chartHeight = parentDimensions.height - axisSizes.top - axisSizes.bottom;
  const { chartPaddings } = theme;
  const top = axisSizes.top + chartPaddings.top;
  const left = axisSizes.left + chartPaddings.left;

  return {
    leftMargin: axisSizes.margin.left,
    chartDimensions: {
      top,
      left,
      width: chartWidth - chartPaddings.left - chartPaddings.right,
      height: chartHeight - chartPaddings.top - chartPaddings.bottom,
    },
  };
}
