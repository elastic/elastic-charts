/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AxisProps } from '.';
import { AxisTick, tickLabelPosition } from '../../../utils/axis_utils';
import { renderText } from '../primitives/text';
import { renderDebugRectCenterRotated } from '../utils/debug';

/** @internal */
export function renderTickLabel(
  ctx: CanvasRenderingContext2D,
  tick: AxisTick,
  showTicks: boolean,
  { axisSpec: { position }, dimension, size, debug, axisStyle }: AxisProps,
) {
  const labelStyle = axisStyle.tickLabel;
  const tickLabelProps = tickLabelPosition(
    axisStyle,
    tick.position,
    position,
    labelStyle.rotation,
    size,
    dimension,
    showTicks,
    labelStyle.offset,
    labelStyle.alignment,
  );

  const center = { x: tickLabelProps.x + tickLabelProps.offsetX, y: tickLabelProps.y + tickLabelProps.offsetY };

  if (debug) {
    const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth: width, maxLabelTextHeight: height } = dimension;
    // full text container
    renderDebugRectCenterRotated(ctx, center, { ...center, width, height }, undefined, undefined, labelStyle.rotation);
    // rotated text container
    if (labelStyle.rotation % 90 !== 0) {
      renderDebugRectCenterRotated(ctx, center, { ...center, width: maxLabelBboxWidth, height: maxLabelBboxHeight });
    }
  }

  renderText(
    ctx,
    center,
    tick.axisTickLabel,
    {
      fontFamily: labelStyle.fontFamily,
      fontStyle: labelStyle.fontStyle ?? 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      textColor: labelStyle.fill,
      fontSize: labelStyle.fontSize,
      align: tickLabelProps.horizontalAlign,
      baseline: tickLabelProps.verticalAlign,
    },
    labelStyle.rotation,
    tickLabelProps.textOffsetX,
    tickLabelProps.textOffsetY,
  );
}
