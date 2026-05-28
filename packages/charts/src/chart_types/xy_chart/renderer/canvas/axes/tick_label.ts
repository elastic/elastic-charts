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
import { degToRad, Position } from '../../../../../utils/common';
import type { Point } from '../../../../../utils/point';
import type { AxisTick } from '../../../utils/axis_utils';
import { getTickLabelPosition } from '../../../utils/axis_utils';

const TICK_TO_LABEL_GAP = 2;

function rotateOffset({ x, y }: Point, rotation: number): Point {
  if (rotation === 0) {
    return { x, y };
  }

  const radians = degToRad(rotation);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

function getTickLabelBoxCenter(
  origin: Point,
  { width, height }: { width: number; height: number },
  textAlign: TextFont['align'],
  textOffsetX: number,
  textOffsetY: number,
  rotation: number,
): Point {
  const center = {
    x: textAlign === 'left' ? textOffsetX + width / 2 : textAlign === 'right' ? textOffsetX - width / 2 : textOffsetX,
    y: textOffsetY + height / 2,
  };

  const rotated = rotateOffset(center, rotation);

  return {
    x: origin.x + rotated.x,
    y: origin.y + rotated.y,
  };
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
    tick.layout,
  );

  const origin = { x: tickLabelProps.x, y: tickLabelProps.y };
  const textOffsetX =
    tickLabelProps.textOffsetX + (tick.multilayerTimeAxis && Number.isFinite(tick.layer) ? TICK_TO_LABEL_GAP : 0);
  const lineHeight = labelStyle.lineHeight * labelStyle.fontSize;
  const layerOffsetY = (tick.layer || 0) * layerGirth * (position === Position.Top ? -1 : 1);
  const textOffsetY = tickLabelProps.textOffsetY + layerOffsetY;

  if (debug) {
    const { width, height, bboxWidth, bboxHeight } = tick.layout;
    const textBlockCenter = getTickLabelBoxCenter(
      origin,
      { width, height },
      tickLabelProps.textAlign,
      textOffsetX,
      textOffsetY,
      labelStyle.rotation,
    );

    renderDebugRectCenterRotated(
      ctx,
      textBlockCenter,
      { ...textBlockCenter, width, height },
      undefined,
      undefined,
      labelStyle.rotation,
    );
    if (labelStyle.rotation % 90 !== 0) {
      renderDebugRectCenterRotated(ctx, textBlockCenter, { ...textBlockCenter, width: bboxWidth, height: bboxHeight });
    }
  }

  const font: TextFont = {
    fontFamily: labelStyle.fontFamily,
    fontStyle: labelStyle.fontStyle ?? 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    textColor: labelStyle.fill,
    fontSize: labelStyle.fontSize,
    align: tickLabelProps.textAlign,
    baseline: 'top',
  };

  tick.layout.lines.forEach((line, i) => {
    renderText(
      ctx,
      origin,
      line,
      font,
      labelStyle.rotation,
      textOffsetX,
      textOffsetY + i * lineHeight,
      1,
      tick.direction,
    );
  });
}
