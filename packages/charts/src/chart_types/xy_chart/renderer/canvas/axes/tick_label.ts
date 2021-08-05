/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AxisProps } from '.';
import { Font, FontStyle } from '../../../../../common/text_utils';
import { withContext } from '../../../../../renderers/canvas';
import { AxisTick, getTickLabelProps } from '../../../utils/axis_utils';
import { renderText } from '../primitives/text';
import { renderDebugRectCenterRotated } from '../utils/debug';

/** @internal */
export function renderTickLabel(
  ctx: CanvasRenderingContext2D,
  tick: AxisTick,
  showTicks: boolean,
  { axisSpec: { position, labelFormat }, dimension, size, debug, axisStyle }: AxisProps,
) {
  const labelStyle = axisStyle.tickLabel;
  const { rotation: tickLabelRotation, alignment, offset } = labelStyle;
  const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth: width, maxLabelTextHeight: height } = dimension;
  const tickLabelProps = getTickLabelProps(
    axisStyle,
    tick.position,
    position,
    tickLabelRotation,
    size,
    dimension,
    showTicks,
    offset,
    alignment,
  );
  const { textOffsetX, textOffsetY, horizontalAlign, verticalAlign } = tickLabelProps;

  const center = { x: tickLabelProps.x + tickLabelProps.offsetX, y: tickLabelProps.y + tickLabelProps.offsetY };

  if (debug) {
    // full text container
    renderDebugRectCenterRotated(ctx, center, { ...center, width, height }, undefined, undefined, tickLabelRotation);
    // rotated text container
    if (tickLabelRotation % 90 !== 0) {
      renderDebugRectCenterRotated(ctx, center, { ...center, width: maxLabelBboxWidth, height: maxLabelBboxHeight });
    }
  }

  const font: Font = {
    fontFamily: labelStyle.fontFamily,
    fontStyle: labelStyle.fontStyle ? (labelStyle.fontStyle as FontStyle) : 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    textColor: labelStyle.fill,
    textOpacity: 1,
  };
  withContext(ctx, (ctx) => {
    renderText(
      ctx,
      center,
      labelFormat ? labelFormat(tick.value) : tick.label,
      {
        ...font,
        fontSize: labelStyle.fontSize,
        fill: labelStyle.fill,
        align: horizontalAlign as CanvasTextAlign,
        baseline: verticalAlign as CanvasTextBaseline,
      },
      tickLabelRotation,
      { x: textOffsetX, y: textOffsetY },
    );
  });
}
