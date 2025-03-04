/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisSpec } from './specs';
import type { SettingsSpec, SmallMultiplesSpec } from '../../../specs';
import type { ChartDimensions, Dimensions } from '../../../utils/dimensions';
import type { AxisId } from '../../../utils/ids';
import type { Theme, AxisStyle } from '../../../utils/themes/theme';
import { getAxesDimensions } from '../axes/axes_sizes';
import type { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';
import type { ScaleConfigs } from '../state/selectors/get_api_scale_configs';

/**
 * Compute the chart dimensions. It's computed removing from the parent dimensions
 * the axis spaces, the legend and any other specified style margin and padding.
 * @internal
 */
export function computeChartDimensions(
  parentDimensions: Dimensions,
  theme: Theme,
  axisTickDimensions: AxesTicksDimensions,
  axesStyles: Map<AxisId, AxisStyle | null>,
  axisSpecs: AxisSpec[],
  smSpec: SmallMultiplesSpec | null,
  scaleConfigs: ScaleConfigs,
  settingsSpec: SettingsSpec,
): ChartDimensions {
  const axesDimensions = getAxesDimensions(
    theme,
    axisTickDimensions,
    axesStyles,
    axisSpecs,
    smSpec,
    scaleConfigs.x.type,
    settingsSpec.rotation,
  );
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
