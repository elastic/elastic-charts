/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../../../../common/colors';
import type { Radian } from '../../../../../common/geometry';
import { cssFontShorthand } from '../../../../../common/text_utils';
import { renderDebugPoint } from '../../../../../renderers/canvas/utils/debug';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isBetween, isFiniteNumber, sortNumbers } from '../../../../../utils/common';
import type { ContinuousDomain, GenericDomain } from '../../../../../utils/domain';
import { drawPolarLine } from '../../../../xy_chart/renderer/canvas/lines';
import type { ActiveValue } from '../../../selectors/get_active_values';
import type { BulletPanelDimensions } from '../../../selectors/get_panel_dimensions';
import { BulletSubtype } from '../../../spec';
import type { BulletStyle } from '../../../theme';
import { GRAPH_PADDING, TICK_FONT_SIZE, getTickFont } from '../../../theme';
import { getAngledChartSizing } from '../../../utils/angular';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE, BAR_STROKE_WIDTH, TARGET_STROKE_WIDTH } from '../constants';

/**
 * Box a tick label occupies relative to the arc center, the label grows inwards.
 */
function getTickLabelBox(angle: Radian, radius: number, width: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // offsets from the arc center
  // Shifted by (1+cos)/2 and (1+sin)/2 from the original tick position on the circle so text grows inward.
  const x0 = Math.round(cos * radius - (width * (1 + cos)) / 2);
  const y0 = Math.round(sin * radius - (TICK_FONT_SIZE * (1 + sin)) / 2);

  return { x0, y0, x1: x0 + width, y1: y0 + TICK_FONT_SIZE };
}

/** @internal */
export function angularBullet(
  ctx: CanvasRenderingContext2D,
  dimensions: BulletPanelDimensions,
  style: BulletStyle,
  backgroundColor: Color,
  hasStroke: boolean,
  debug: boolean,
  activeValue?: ActiveValue | null,
) {
  const tickFont = getTickFont(style.fontFamily);
  const { datum, graphArea, scale, ticks, colorBands, subtype } = dimensions;
  const { radius } = getAngledChartSizing(graphArea.size, subtype);

  const [start, end] = scale.domain() as GenericDomain;

  const center = {
    x: graphArea.center.x,
    y: radius + TARGET_SIZE / 2,
  };

  ctx.translate(GRAPH_PADDING.left, GRAPH_PADDING.top);

  const [min, max] = sortNumbers([start, end]) as ContinuousDomain;
  const filteredTicks =
    subtype !== BulletSubtype.circle
      ? ticks
      : min === ticks.at(0) && max === ticks.at(-1)
        ? ticks.slice(0, -1)
        : max === ticks.at(0) && min === ticks.at(-1)
          ? ticks.slice(1)
          : ticks;
  const formatterColorTicks = filteredTicks.map((v) => ({ value: v, formattedValue: datum.tickFormatter(v) }));

  // Color bands
  colorBands.forEach((band) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, band.start, band.end, false);
    ctx.lineWidth = BULLET_SIZE;
    ctx.strokeStyle = band.color;
    ctx.stroke();
  });

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = backgroundColor;
  ctx.lineWidth = TICK_WIDTH;
  formatterColorTicks
    .filter((tick) => tick.value > min && tick.value < max)
    .forEach((tick) => {
      const bulletWidth = BULLET_SIZE + 4; // TODO fix arbitrary extension
      drawPolarLine(ctx, scale(tick.value), radius, bulletWidth, center);
    });

  ctx.stroke();

  // Bar
  const value = scale(clamp(datum.value, min, max));
  const zero = scale(clamp(0, min, max));
  const counterClockwise = value < zero;

  ctx.save();
  ctx.lineCap = 'butt';

  if (hasStroke) {
    const arcDirection = counterClockwise ? -1 : 1;
    const innerArcOffset = BAR_STROKE_WIDTH / radius;
    const overflows = datum.value > max || datum.value < min;

    const innerValue = overflows
      ? value
      : clamp(value - innerArcOffset * arcDirection, Math.min(zero, value), Math.max(zero, value));

    ctx.beginPath();
    ctx.lineWidth = BAR_SIZE;
    ctx.strokeStyle = backgroundColor;
    ctx.arc(center.x, center.y, radius, zero, value, counterClockwise);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = BAR_SIZE - BAR_STROKE_WIDTH * 2;
    ctx.strokeStyle = style.barBackground;
    ctx.arc(center.x, center.y, radius, zero, innerValue, counterClockwise);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.lineWidth = BAR_SIZE;
    ctx.strokeStyle = style.barBackground;
    ctx.arc(center.x, center.y, radius, zero, value, counterClockwise);
    ctx.stroke();
  }

  ctx.restore();

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= max && datum.target >= min) {
    if (hasStroke) {
      ctx.beginPath();
      ctx.strokeStyle = backgroundColor;
      ctx.lineWidth = TARGET_STROKE_WIDTH + BAR_STROKE_WIDTH * 2;
      drawPolarLine(ctx, scale(datum.target), radius, TARGET_SIZE, center);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = style.barBackground;
    ctx.lineWidth = TARGET_STROKE_WIDTH;

    drawPolarLine(ctx, scale(datum.target), radius, TARGET_SIZE, center);

    ctx.stroke();
  }

  // Zero baseline
  if (isBetween(min, max, true)(0)) {
    ctx.beginPath();
    ctx.strokeStyle = style.barBackground;
    ctx.lineWidth = TICK_WIDTH;

    drawPolarLine(ctx, scale(0), radius, BULLET_SIZE, center);

    ctx.stroke();
  }

  const measure = measureText(ctx);
  const innerRadius = radius - BULLET_SIZE / 2 - style.angularTickLabelPadding;

  const tickLabels = formatterColorTicks
    .filter((tick) => tick.value >= min && tick.value <= max)
    .map((tick) => {
      const { width } = measure(tick.formattedValue, tickFont, TICK_FONT_SIZE);

      return {
        formattedValue: tick.formattedValue,
        ...getTickLabelBox(scale(tick.value), innerRadius, width),
      };
    });

  // are any labels overlapping the bullet
  const touchesBand = tickLabels.some(({ x0, y0, x1, y1 }) =>
    [Math.hypot(x0, y0), Math.hypot(x0, y1), Math.hypot(x1, y0), Math.hypot(x1, y1)].some(
      (cornerRadius) => cornerRadius > radius - BULLET_SIZE / 2,
    ),
  );

  // it's quadratic but there are only a few labels so should be fine.
  const hasCollision = tickLabels.some((a, i) =>
    tickLabels.some((b, j) => j > i && a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1),
  );

  if (!touchesBand && !hasCollision) {
    ctx.fillStyle = style.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = cssFontShorthand(tickFont, TICK_FONT_SIZE);
    tickLabels.forEach(({ formattedValue, x0, y0 }) => ctx.fillText(formattedValue, center.x + x0, center.y + y0));
  }

  if (activeValue) {
    ctx.beginPath();
    ctx.strokeStyle = style.barBackground;
    ctx.lineWidth = TARGET_STROKE_WIDTH;
    drawPolarLine(ctx, activeValue.value, radius, TARGET_SIZE, center);

    ctx.stroke();
  }

  ctx.beginPath();

  if (debug) {
    renderDebugPoint(ctx, center.x, center.y); // arch center
  }
}
