/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../../../../common/colors';
import type { BulletStyle } from '../../../theme';
import { BAR_SIZE, BAR_STROKE_WIDTH } from '../constants';

type BarGeometry = {
  start: number;
  end: number;
  position: number;
};

/** @internal */
export function renderLinearBar(
  ctx: CanvasRenderingContext2D,
  style: BulletStyle,
  bar: BarGeometry,
  orientation: 'horizontal' | 'vertical',
  barStroke?: Color,
) {
  const length = Math.abs(bar.end - bar.start);
  const x = orientation === 'horizontal' ? Math.min(bar.start, bar.end) : bar.position;
  const y = orientation === 'horizontal' ? bar.position : Math.min(bar.start, bar.end);
  const width = orientation === 'horizontal' ? length : BAR_SIZE;
  const height = orientation === 'horizontal' ? BAR_SIZE : length;

  if (!barStroke) {
    ctx.fillStyle = style.barBackground;
    ctx.fillRect(x, y, width, height);
    return;
  }

  ctx.fillStyle = barStroke;
  ctx.fillRect(x, y, width, height);

  const innerLength = length - BAR_STROKE_WIDTH * 2;

  if (innerLength > 0) {
    ctx.save();
    ctx.translate(BAR_STROKE_WIDTH, BAR_STROKE_WIDTH);
    ctx.fillStyle = style.barBackground;

    if (orientation === 'horizontal') {
      ctx.fillRect(x, y, innerLength, BAR_SIZE - BAR_STROKE_WIDTH * 2);
    } else {
      ctx.fillRect(x, y, BAR_SIZE - BAR_STROKE_WIDTH * 2, innerLength);
    }
    ctx.restore();
  }

  if (length > 0) {
    const baselinePosition =
      bar.start <= bar.end ? Math.min(bar.start, bar.end) : Math.max(bar.start, bar.end) - BAR_STROKE_WIDTH;
    ctx.fillStyle = style.barBackground;

    if (orientation === 'horizontal') {
      ctx.fillRect(baselinePosition, y + BAR_STROKE_WIDTH, BAR_STROKE_WIDTH, BAR_SIZE - BAR_STROKE_WIDTH * 2);
    } else {
      ctx.fillRect(x + BAR_STROKE_WIDTH, baselinePosition, BAR_SIZE - BAR_STROKE_WIDTH * 2, BAR_STROKE_WIDTH);
    }
  }
}
