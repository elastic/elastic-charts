/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Dimensions, PerSideDistance } from '../../../utils/dimensions';
import type { Theme } from '../../../utils/themes/theme';

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
