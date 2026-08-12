/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba } from '../../../../../common/color_library_wrappers';
import type { Color } from '../../../../../common/colors';
import { cssFontShorthand } from '../../../../../common/text_utils';
import { renderRectStroke } from '../../../../../renderers/canvas/primitives/rect';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isBetween, isFiniteNumber, sortNumbers } from '../../../../../utils/common';
import type { ContinuousDomain, GenericDomain } from '../../../../../utils/domain';
import type { ActiveValue } from '../../../selectors/get_active_values';
import type { BulletPanelDimensions } from '../../../selectors/get_panel_dimensions';
import type { BulletStyle } from '../../../theme';
import { GRAPH_PADDING, TICK_FONT_SIZE, getTickFont } from '../../../theme';
import {
  TARGET_SIZE,
  BULLET_SIZE,
  TICK_WIDTH,
  BAR_SIZE,
  TARGET_STROKE_WIDTH,
  TICK_LABEL_PADDING,
  BAR_STROKE_WIDTH,
} from '../constants';

/** @internal */
export function horizontalBullet(
  ctx: CanvasRenderingContext2D,
  dimensions: BulletPanelDimensions,
  style: BulletStyle,
  backgroundColor: Color,
  hasStroke: boolean,
  activeValue?: ActiveValue | null,
) {
  const tickFont = getTickFont(style.fontFamily);
  ctx.translate(GRAPH_PADDING.left, 0);

  const { datum, colorBands, ticks, scale } = dimensions;
  const [start, end] = scale.domain() as GenericDomain;
  const [min, max] = sortNumbers([start, end]) as ContinuousDomain;

  // Color bands
  const verticalAlignment = TARGET_SIZE / 2;
  colorBands.forEach((band) => {
    ctx.fillStyle = band.color;
    ctx.fillRect(band.start, verticalAlignment - BULLET_SIZE / 2, band.size, BULLET_SIZE);
  });

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = backgroundColor;
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
  const x0 = scale(adjustedZero);
  const x1 = scale(confinedValue);
  const y = verticalAlignment - BAR_SIZE / 2;

  ctx.fillStyle = style.barBackground;
  ctx.fillRect(
    datum.value > 0 ? x0 : x1,
    verticalAlignment - BAR_SIZE / 2,
    confinedValue > 0 ? x1 - x0 : x0 - x1,
    BAR_SIZE,
  );

  if (hasStroke) {
    const strokedSides = {
      top: true,
      bottom: true,
      right: x1 > x0 ? true : false,
      left: x1 > x0 ? false : true,
    };
    renderRectStroke(
      ctx,
      { x: x0, y, width: x1 - x0, height: BAR_SIZE },
      { color: colorToRgba(backgroundColor), width: BAR_STROKE_WIDTH },
      strokedSides,
    );
  }

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= max && datum.target >= min) {
    ctx.fillRect(
      scale(datum.target) - TARGET_STROKE_WIDTH / 2,
      verticalAlignment - TARGET_SIZE / 2,
      TARGET_STROKE_WIDTH,
      TARGET_SIZE,
    );
  }

  // Zero baseline
  if (isBetween(min, max, true)(0)) {
    ctx.fillRect(scale(0) - TICK_WIDTH / 2, verticalAlignment - BULLET_SIZE / 2, TICK_WIDTH, BULLET_SIZE);
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
  ctx.font = cssFontShorthand(tickFont, TICK_FONT_SIZE);
  ticks
    .filter((tick) => tick >= min && tick <= max)
    .forEach((tick, i) => {
      const labelText = datum.tickFormatter(tick);
      if (i === ticks.length - 1) {
        const availableWidth = Math.abs((start > end ? min : max) - (ticks.at(i) ?? NaN));
        const { width: labelWidth } = measureText(ctx)(labelText, tickFont, TICK_FONT_SIZE);
        ctx.textAlign = labelWidth >= Math.abs(scale(availableWidth) - scale(0)) ? 'end' : 'start';
      } else {
        ctx.textAlign = 'start';
      }
      ctx.fillText(labelText, scale(tick), verticalAlignment + TARGET_SIZE / 2 + TICK_LABEL_PADDING);
    });
}
