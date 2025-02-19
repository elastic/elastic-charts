/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AxisProps } from '.';
import { colorToRgba } from '../../../../../common/color_library_wrappers';
import { Line } from '../../../../../geoms/types';
import { renderMultiLine } from '../../../../../renderers/canvas/primitives/line';
import { Position } from '../../../../../utils/common';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { AxisTick } from '../../../utils/axis_utils';
import { HIDE_MINOR_TIME_GRID, OUTSIDE_RANGE_TOLERANCE } from '../../../utils/grid_lines';

const BASELINE_CORRECTION = 2; // the bottom of the em is a bit higher than the bottom alignment; todo consider measuring

/** @internal */
export function renderTicks(ctx: CanvasRenderingContext2D, ticks: AxisTick[], axisProps: AxisProps) {
  const tickLines = ticks.reduce<Line[]>((acc, tick) => {
    const line = getTickLineCoordinates(tick, axisProps);
    if (line) acc.push(line);
    return acc;
  }, []);
  renderMultiLine(ctx, tickLines, {
    color: colorToRgba(axisProps.axisStyle.tickLine.stroke),
    width: axisProps.axisStyle.tickLine.strokeWidth,
  });
}

function getTickLineCoordinates(
  { position, domainClampedPosition: tickPosition, layer, detailedLayer }: AxisTick,
  {
    axisSpec: { position: axisPosition, timeAxisLayerCount },
    size: { width, height },
    axisStyle: { tickLine },
    layerGirth,
  }: AxisProps,
): Line | undefined {
  if (Math.abs(tickPosition - position) > OUTSIDE_RANGE_TOLERANCE) return;
  const tickOnTheSide = timeAxisLayerCount > 0 && typeof layer === 'number';
  const extensionLayer = tickOnTheSide ? layer + 1 : 0;
  const tickSize =
    tickLine.size +
    (tickOnTheSide && (detailedLayer > 0 || !HIDE_MINOR_TIME_GRID)
      ? extensionLayer * layerGirth + (extensionLayer < 1 ? 0 : tickLine.padding - BASELINE_CORRECTION)
      : 0);
  return isHorizontalAxis(axisPosition)
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
}
