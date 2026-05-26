/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisSpec } from './specs';
import type { SettingsSpec, SmallMultiplesSpec } from '../../../specs';
import type { ChartDimensions, Dimensions, PerSideDistance } from '../../../utils/dimensions';
import type { AxisId } from '../../../utils/ids';
import type { Theme, AxisStyle } from '../../../utils/themes/theme';
import { getAxesDimensions } from '../axes/layout/dimensions';
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
  const axes = axisSpecs.map((spec) => ({
    spec,
    style: axesStyles.get(spec.id) ?? theme.axes,
    tickDimensions: axisTickDimensions.get(spec.id) ?? [],
    isHidden: spec.hide,
  }));
  const axesDimensions = getAxesDimensions(theme, axes, smSpec, scaleConfigs.x.type, settingsSpec.rotation);

  return computeChartArea(parentDimensions, axesDimensions, theme);
}

/** @internal */
export type AxesPerSide = PerSideDistance & { margin: { left: number } };

/** @internal */
export function computeChartArea(container: Dimensions, axes: AxesPerSide, theme: Theme) {
  const padding = theme.chartPaddings;
  const width = container.width - axes.left - axes.right;
  const height = container.height - axes.top - axes.bottom;

  return {
    leftMargin: axes.margin.left,
    chartDimensions: {
      top: axes.top + padding.top,
      left: axes.left + padding.left,
      width: Math.max(0, width - padding.left - padding.right),
      height: Math.max(0, height - padding.top - padding.bottom),
    },
  };
}
