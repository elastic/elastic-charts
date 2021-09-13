/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AxisProps } from '.';
import { colorToRgba } from '../../../../../common/color_library_wrappers';
import { Position } from '../../../../../utils/common';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { AxisTick } from '../../../utils/axis_utils';
import { renderMultiLine } from '../primitives/line';

/** @internal */
export function renderTick(
  ctx: CanvasRenderingContext2D,
  { position: tickPosition }: AxisTick,
  { axisSpec: { position: axisPosition }, size: { width, height }, axisStyle: { tickLine } }: AxisProps,
) {
  const xy = isHorizontalAxis(axisPosition)
    ? {
        x1: tickPosition,
        x2: tickPosition,
        ...(axisPosition === Position.Top ? { y1: height - tickLine.size, y2: height } : { y1: 0, y2: tickLine.size }),
      }
    : {
        y1: tickPosition,
        y2: tickPosition,
        ...(axisPosition === Position.Left ? { x1: width, x2: width - tickLine.size } : { x1: 0, x2: tickLine.size }),
      };
  renderMultiLine(ctx, [xy], { color: colorToRgba(tickLine.stroke), width: tickLine.strokeWidth });
}
