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
import { withTextMeasure } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { Position } from '../../../../../utils/common';
import { wrapText } from '../../../../../utils/text/wrap';
import type { AxisTick } from '../../../utils/axis_utils';
import { getTickLabelPosition } from '../../../utils/axis_utils';

const TICK_TO_LABEL_GAP = 2;

/** @internal */
export function renderTickLabel(
  ctx: CanvasRenderingContext2D,
  tick: AxisTick,
  showTicks: boolean,
  { axisSpec, dimension, size, debug, axisStyle }: AxisProps,
  layerGirth: number,
  locale: string,
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
    tick.bounds,
  );

  const center = { x: tickLabelProps.x + tickLabelProps.offsetX, y: tickLabelProps.y + tickLabelProps.offsetY };

  if (debug) {
    const { width, height, bboxWidth, bboxHeight } = tick.bounds;
    const textBlockCenter = {
      x: center.x,
      y: center.y + tickLabelProps.boxTopY + height / 2,
    };
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

  const tickOnTheSide = tick.multilayerTimeAxis && Number.isFinite(tick.layer);
  const textOffsetX = tickLabelProps.textOffsetX + (tickOnTheSide ? TICK_TO_LABEL_GAP : 0);
  const lineHeight = (labelStyle.lineHeight ?? 1.2) * labelStyle.fontSize;
  const layerOffsetY = (tick.layer || 0) * layerGirth * (position === Position.Top ? -1 : 1);

  const font: TextFont = {
    fontFamily: labelStyle.fontFamily,
    fontStyle: labelStyle.fontStyle ?? 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    textColor: labelStyle.fill,
    fontSize: labelStyle.fontSize,
    align: tickLabelProps.horizontalAlign,
    baseline: 'top',
  };

  const lines =
    tick.bounds.lines ??
    withTextMeasure((measureText) => {
      return wrapText(
        tick.label,
        font,
        labelStyle.fontSize,
        tick.bounds.width,
        labelStyle.wrapLines ?? 1,
        measureText,
        locale,
      );
    });

  lines.forEach((line, i) => {
    renderText(
      ctx,
      center,
      line,
      font,
      labelStyle.rotation,
      textOffsetX,
      tickLabelProps.boxTopY + layerOffsetY + i * lineHeight,
      1,
      tick.direction,
    );
  });
}
