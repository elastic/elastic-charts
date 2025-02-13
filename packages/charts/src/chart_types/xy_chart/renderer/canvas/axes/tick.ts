/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AxisProps } from '.';
import { colorToRgba, RgbaTuple } from '../../../../../common/color_library_wrappers';
import { renderMultiLine } from '../../../../../renderers/canvas/primitives/line';
import { Position } from '../../../../../utils/common';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { AxisTick } from '../../../utils/axis_utils';
import { HIDE_MINOR_TIME_GRID, HIERARCHICAL_GRID_WIDTH, OUTSIDE_RANGE_TOLERANCE } from '../../../utils/grid_lines';

const BASELINE_CORRECTION = 2; // the bottom of the em is a bit higher than the bottom alignment; todo consider measuring

/** @internal */
export function renderTick(
  ctx: CanvasRenderingContext2D,
  { position, domainClampedPosition: tickPosition, layer, detailedLayer }: AxisTick,
  {
    axisSpec: { position: axisPosition, timeAxisLayerCount },
    size: { width, height },
    axisStyle: { tickLine, gridLine },
    layerGirth,
  }: AxisProps,
) {
  if (Math.abs(tickPosition - position) > OUTSIDE_RANGE_TOLERANCE) return;
  const tickOnTheSide = timeAxisLayerCount > 0 && typeof layer === 'number';
  const extensionLayer = tickOnTheSide ? layer + 1 : 0;
  const tickSize =
    tickLine.size +
    (tickOnTheSide && (detailedLayer > 0 || !HIDE_MINOR_TIME_GRID)
      ? extensionLayer * layerGirth + (extensionLayer < 1 ? 0 : tickLine.padding - BASELINE_CORRECTION)
      : 0);
  const xy = isHorizontalAxis(axisPosition)
    ? {
        x1: tickPosition,
        x2: tickPosition,
        ...(axisPosition === Position.Top ? { y1: height - tickSize, y2: height } : { y1: 0, y2: tickSize }),
      }
    : {
        y1: tickPosition,
        y2: tickPosition,
        ...(axisPosition === Position.Left ? { x1: width, x2: width - tickSize } : { x1: 0, x2: tickSize }),
      };
  const layered = typeof layer === 'number';
  const multilayerLuma = gridLine.lumaSteps[detailedLayer] ?? NaN;
  const strokeWidth = layered ? HIERARCHICAL_GRID_WIDTH : tickLine.strokeWidth;
  const color: RgbaTuple = layered ? [multilayerLuma, multilayerLuma, multilayerLuma, 1] : colorToRgba(tickLine.stroke);
  renderMultiLine(ctx, [xy], { color, width: strokeWidth });
}
