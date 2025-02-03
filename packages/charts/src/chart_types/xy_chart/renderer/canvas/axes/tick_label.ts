/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AxisProps } from '.';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { Position } from '../../../../../utils/common';
import { wrapText } from '../../../../../utils/text/wrap';
import { AxisTick, getTickLabelPosition } from '../../../utils/axis_utils';
import { renderText } from '../primitives/text';
import { renderDebugRectCenterRotated } from '../utils/debug';

const TICK_TO_LABEL_GAP = 2;

/** @internal */
export function renderTickLabel(
  ctx: CanvasRenderingContext2D,
  tick: AxisTick,
  showTicks: boolean,
  { axisSpec: { position, timeAxisLayerCount }, dimension, size, debug, axisStyle, maxLabelSize }: AxisProps,
  layerGirth: number,
) {
  const labelStyle = axisStyle.tickLabel;
  const tickLabelProps = getTickLabelPosition(
    axisStyle,
    tick.domainClampedPosition,
    position,
    labelStyle.rotation,
    size,
    dimension,
    showTicks,
    labelStyle.offset,
    labelStyle.alignment,
  );

  const center = { x: tickLabelProps.x + tickLabelProps.offsetX, y: tickLabelProps.y + tickLabelProps.offsetY };
  const textMeasure = measureText(ctx);
  const wrappedText = wrapText(
    tick.label,
    {
      fontFamily: labelStyle.fontFamily,
      fontStyle: labelStyle.fontStyle ?? 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      textColor: labelStyle.fill,
    },
    labelStyle.fontSize,
    maxLabelSize,
    1,
    textMeasure,
    'en', // TODO
  );
  if (debug) {
    const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth: width, maxLabelTextHeight: height } = dimension;
    // full text container
    renderDebugRectCenterRotated(ctx, center, { ...center, width, height }, undefined, undefined, labelStyle.rotation);
    // rotated text container
    if (labelStyle.rotation % 90 !== 0) {
      renderDebugRectCenterRotated(ctx, center, { ...center, width: maxLabelBboxWidth, height: maxLabelBboxHeight });
    }
  }

  const tickOnTheSide = timeAxisLayerCount > 0 && Number.isFinite(tick.layer);

  renderText(
    ctx,
    center,
    wrappedText[0] ?? '',
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
    tickLabelProps.textOffsetX + (tickOnTheSide ? TICK_TO_LABEL_GAP : 0),
    tickLabelProps.textOffsetY + (tick.layer || 0) * layerGirth * (position === Position.Top ? -1 : 1),
    1,
    tick.direction,
  );
}
