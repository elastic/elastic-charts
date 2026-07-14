/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Theme } from '../../utils/themes/theme';
import type { TraceStyle } from './render/types';

/**
 * Derives trace-chart style values from the chart's resolved global `Theme`. All colors and fonts
 * come from the theme — no hardcoded hex or magic numbers.
 * @internal
 */
export function buildTraceStyle(theme: Theme): TraceStyle {
  const { axes } = theme;

  // `axes.tickLabel` carries fontFamily, fontSize, and fill (subdued text) from the theme.
  const { fontFamily, fontSize, fill: labelColor } = axes.tickLabel;

  // The total-line uses the axis gridline vertical color (muted), and the active segment uses
  // the axis tick line color (stronger). This avoids introducing chart-specific color tokens
  // before the design phase decides them; the seam (TraceStyle) is already in place to swap.
  const totalLineColor = axes.gridLine.vertical.stroke;
  const activeSegmentColor = axes.tickLine.stroke;

  // Gridlines through the plot match the vertical grid line style.
  const gridLineColor = axes.gridLine.vertical.stroke;

  return {
    gutterWidth: 200,
    timeBarHeight: 32,
    laneHeight: 24,
    totalLineThickness: 2,
    totalLineColor,
    activeSegmentColor,
    gutterLabel: { fontFamily, fontSize, color: labelColor },
    timeBarLabel: { fontFamily, fontSize, color: labelColor },
    gridLineColor,
  };
}
