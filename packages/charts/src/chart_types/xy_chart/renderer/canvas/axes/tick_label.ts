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
export function renderTickLabel(ctx: CanvasRenderingContext2D, tick: AxisTick, showTicks: boolean, props: AxisProps) {
  const {
    axisSpec: { position, labelFormat },
    dimension: axisTicksDimensions,
    size,
    debug,
    axisStyle,
  } = props;
  const labelStyle = axisStyle.tickLabel;
  const { rotation: tickLabelRotation, alignment, offset } = labelStyle;

  const { maxLabelBboxWidth, maxLabelBboxHeight, maxLabelTextWidth, maxLabelTextHeight } = axisTicksDimensions;
  const {
    x: x0,
    y: y0,
    offsetX,
    offsetY,
    textOffsetX,
    textOffsetY,
    horizontalAlign,
    verticalAlign,
  } = getTickLabelProps(
    axisStyle,
    tick.position,
    position,
    tickLabelRotation,
    size,
    axisTicksDimensions,
    showTicks,
    offset,
    alignment,
  );

  const x = x0 + offsetX;
  const y = y0 + offsetY;
  const center = { x, y };
  if (debug) {
    // full text container
    renderDebugRectCenterRotated(
      ctx,
      center,
      { ...center, height: maxLabelTextHeight, width: maxLabelTextWidth },
      undefined,
      undefined,
      tickLabelRotation,
    );
    // rotated text container
    if (tickLabelRotation % 90 !== 0) {
      renderDebugRectCenterRotated(
        ctx,
        center,
        { ...center, height: maxLabelBboxHeight, width: maxLabelBboxWidth },
        undefined,
        undefined,
        0,
      );
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
