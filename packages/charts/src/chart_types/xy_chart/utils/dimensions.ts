/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AxisSpec } from './specs';
import { SmallMultiplesSpec } from '../../../specs';
import { ChartDimensions, Dimensions } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { Theme, AxisStyle } from '../../../utils/themes/theme';
import { getAxesDimensions } from '../axes/axes_sizes';
import { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';

/**
 * Compute the chart dimensions. It's computed removing from the parent dimensions
 * the axis spaces, the legend and any other specified style margin and padding.
 * @internal
 */ export function computeChartDimensions(
  parentDimensions: Dimensions,
  theme: Theme,
  axisTickDimensions: AxesTicksDimensions,
  axesStyles: Map<AxisId, AxisStyle | null>,
  axisSpecs: AxisSpec[],
  smSpec: SmallMultiplesSpec | null,
): ChartDimensions {
  const axesDimensions = getAxesDimensions(parentDimensions, theme, axisTickDimensions, axesStyles, axisSpecs, smSpec);
  const chartWidth = parentDimensions.width - axesDimensions.left - axesDimensions.right;
  const chartHeight = parentDimensions.height - axesDimensions.top - axesDimensions.bottom;
  const pad = theme.chartPaddings;
  return {
    leftMargin: axesDimensions.margin.left,
    chartDimensions: {
      top: axesDimensions.top + pad.top,
      left: axesDimensions.left + pad.left,
      width: Math.max(0, chartWidth - pad.left - pad.right),
      height: Math.max(0, chartHeight - pad.top - pad.bottom),
    },
  };
}
