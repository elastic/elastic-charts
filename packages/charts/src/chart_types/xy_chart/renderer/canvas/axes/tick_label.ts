/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisProps } from './axis_props';
import type { TextFont } from '../../../../../renderers/canvas/primitives/text';
import { renderText } from '../../../../../renderers/canvas/primitives/text';
import { renderDebugRectCenterRotated } from '../../../../../renderers/canvas/utils/debug';
import { HorizontalAlignment, Position, VerticalAlignment } from '../../../../../utils/common';
import type { Point } from '../../../../../utils/point';
import { getTickLabelPosition, rotateVector, type ResolvedHorizontalAlign } from '../../../axes/ticks/geometry';
import { DEFAULT_TICK_LABEL_LINE_HEIGHT } from '../../../axes/ticks/labels';
import type { AxisTick } from '../../../axes/ticks/types';

const TICK_TO_LABEL_GAP = 2;

function getTextAnchorX(horizontalAlign: ResolvedHorizontalAlign, textWidth: number): number {
  switch (horizontalAlign) {
    case HorizontalAlignment.Left:
      return -textWidth / 2;
    case HorizontalAlignment.Right:
      return textWidth / 2;
    case HorizontalAlignment.Center:
      return 0;
  }
}

/** @internal */
export function renderTickLabel(
  ctx: CanvasRenderingContext2D,
  tick: AxisTick,
  showTicks: boolean,
  { axisSpec, dimension, size, debug, axisStyle }: AxisProps,
  layerGirth: number,
) {
  const { position } = axisSpec;
  const { tickLabel: labelStyle } = axisStyle;
  const { width, height, bboxWidth, bboxHeight, lines } = tick.layout;
  const { rotation } = labelStyle;

  const { center, textAlign, horizontalAlign } = getTickLabelPosition(
    axisStyle,
    tick.domainClampedPosition,
    position,
    rotation,
    size,
    dimension,
    showTicks,
    labelStyle.offset,
    labelStyle.alignment,
    tick.layout,
  );

  //pushes multilayer time-axis labels away from the tick edge.
  const tickGapX = tick.multilayerTimeAxis && Number.isFinite(tick.layer) ? TICK_TO_LABEL_GAP : 0;
  // stacks multilayer time-axis layers along the cross-axis direction.
  const layerOffsetY = (tick.layer || 0) * layerGirth * (position === Position.Top ? -1 : 1);

  if (debug) {
    const extraInRotated = rotateVector({ x: tickGapX, y: layerOffsetY }, rotation);
    const debugCenter: Point = {
      x: center.x + extraInRotated.x,
      y: center.y + extraInRotated.y,
    };

    renderDebugRectCenterRotated(ctx, debugCenter, { ...debugCenter, width, height }, undefined, undefined, rotation);
    if (rotation % 90 !== 0) {
      renderDebugRectCenterRotated(ctx, debugCenter, { ...debugCenter, width: bboxWidth, height: bboxHeight });
    }
  }

  const isMultiLine = lines.length > 1;
  const lineHeight = (labelStyle.lineHeight ?? DEFAULT_TICK_LABEL_LINE_HEIGHT) * labelStyle.fontSize;

  const baseline = isMultiLine ? VerticalAlignment.Top : VerticalAlignment.Middle;
  const stackBaseY = isMultiLine ? -height / 2 : 0;

  const font: TextFont = {
    fontFamily: labelStyle.fontFamily,
    fontStyle: labelStyle.fontStyle ?? 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    textColor: labelStyle.fill,
    fontSize: labelStyle.fontSize,
    align: textAlign,
    baseline,
  };

  const anchorX = getTextAnchorX(horizontalAlign, width);

  lines.forEach((line, i) => {
    renderText(
      ctx,
      center,
      line,
      font,
      rotation,
      anchorX + tickGapX,
      stackBaseY + layerOffsetY + i * lineHeight,
      1,
      tick.direction,
    );
  });
}
