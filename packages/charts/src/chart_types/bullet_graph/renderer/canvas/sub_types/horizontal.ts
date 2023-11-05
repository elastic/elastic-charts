/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { cssFontShorthand } from '../../../../../common/text_utils';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isFiniteNumber, sortNumbers } from '../../../../../utils/common';
import { ContinuousDomain } from '../../../../../utils/domain';
import { ActiveValue } from '../../../selectors/get_active_values';
import { BulletPanelDimensions } from '../../../selectors/get_panel_dimensions';
import { BulletGraphStyle, GRAPH_PADDING, TICK_FONT, TICK_FONT_SIZE } from '../../../theme';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE, TARGET_STROKE_WIDTH } from '../constants';

/** @internal */
export function horizontalBullet(
  ctx: CanvasRenderingContext2D,
  dimensions: BulletPanelDimensions,
  style: BulletGraphStyle,
  activeValue?: ActiveValue | null,
) {
  ctx.translate(GRAPH_PADDING.left, 0);

  const { datum, colorBands, ticks, scale } = dimensions;
  const [min, max] = sortNumbers(datum.domain) as ContinuousDomain;

  // Color bands
  const verticalAlignment = TARGET_SIZE / 2;
  colorBands.forEach((band) => {
    ctx.fillStyle = band.color;
    ctx.fillRect(band.start, verticalAlignment - BULLET_SIZE / 2, band.size, BULLET_SIZE);
  });

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = style.background;
  ctx.lineWidth = TICK_WIDTH;
  ticks
    .filter((tick) => tick > min && tick < max)
    .forEach((tick) => {
      ctx.moveTo(scale(tick), verticalAlignment - BULLET_SIZE / 2);
      ctx.lineTo(scale(tick), verticalAlignment + BULLET_SIZE / 2);
    });
  ctx.stroke();

  // Bar
  const confinedValue = clamp(datum.value, min, max);
  const adjustedZero = clamp(0, min, max);
  ctx.fillStyle = style.barBackground;
  ctx.fillRect(
    datum.value > 0 ? scale(adjustedZero) : scale(confinedValue),
    verticalAlignment - BAR_SIZE / 2,
    confinedValue > 0 ? scale(confinedValue) - scale(adjustedZero) : scale(adjustedZero) - scale(confinedValue),
    BAR_SIZE,
  );

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= max && datum.target >= min) {
    ctx.fillRect(
      scale(datum.target) - TARGET_STROKE_WIDTH / 2,
      verticalAlignment - TARGET_SIZE / 2,
      TARGET_STROKE_WIDTH,
      TARGET_SIZE,
    );
  }

  // Active Value
  if (activeValue && (datum.syncCursor || !activeValue.external)) {
    ctx.fillRect(
      activeValue.value - TARGET_STROKE_WIDTH / 2,
      verticalAlignment - TARGET_SIZE / 2,
      TARGET_STROKE_WIDTH,
      TARGET_SIZE,
    );
  }

  // Tick labels
  ctx.fillStyle = style.textColor;
  ctx.textBaseline = 'top';
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  ticks
    .filter((tick) => tick >= min && tick <= max)
    .forEach((tick, i) => {
      const labelText = datum.tickFormatter(tick);
      if (i === ticks.length - 1) {
        const availableWidth = max - (ticks.at(-1) ?? 0);
        const { width: labelWidth } = measureText(ctx)(labelText, TICK_FONT, TICK_FONT_SIZE);
        ctx.textAlign = labelWidth >= scale(availableWidth) ? 'end' : 'start';
      } else {
        ctx.textAlign = 'start';
      }

      ctx.fillText(labelText, scale(tick), verticalAlignment + TARGET_SIZE / 2);
    });
}
