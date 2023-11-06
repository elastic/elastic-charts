/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../../../../common/colors';
import { cssFontShorthand } from '../../../../../common/text_utils';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isBetween, isFiniteNumber, sortNumbers } from '../../../../../utils/common';
import { ContinuousDomain, GenericDomain } from '../../../../../utils/domain';
import { drawPolarLine } from '../../../../xy_chart/renderer/canvas/lines';
import { renderDebugPoint } from '../../../../xy_chart/renderer/canvas/utils/debug';
import { ActiveValue } from '../../../selectors/get_active_values';
import { BulletPanelDimensions } from '../../../selectors/get_panel_dimensions';
import { BulletGraphSpec } from '../../../spec';
import { BulletGraphStyle, GRAPH_PADDING, TICK_FONT, TICK_FONT_SIZE } from '../../../theme';
import { getAngledChartSizing } from '../../../utils/angular';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE, TARGET_STROKE_WIDTH } from '../constants';

/** @internal */
export function angularBullet(
  ctx: CanvasRenderingContext2D,
  dimensions: BulletPanelDimensions,
  style: BulletGraphStyle,
  backgroundColor: Color,
  spec: BulletGraphSpec,
  debug: boolean,
  activeValue?: ActiveValue | null,
) {
  const { datum, graphArea, scale, ticks, colorBands } = dimensions;
  const { radius } = getAngledChartSizing(graphArea.size, spec.subtype);
  const [startAngle, endAngle] = scale.range() as [number, number];
  const center = {
    x: graphArea.center.x,
    y: radius + TARGET_SIZE / 2,
  };

  ctx.translate(GRAPH_PADDING.left, GRAPH_PADDING.top);

  const [start, end] = scale.domain() as GenericDomain;
  // const counterClockwise = true;
  const counterClockwise = startAngle < endAngle && start > end;
  const [min, max] = sortNumbers([start, end]) as ContinuousDomain;
  const formatterColorTicks = ticks.map((v) => ({ value: v, formattedValue: datum.tickFormatter(v) }));

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
  const confinedValue = clamp(datum.value, min, max);
  const adjustedZero = clamp(0, min, max);
  ctx.beginPath();
  ctx.lineWidth = BAR_SIZE;
  ctx.strokeStyle = style.barBackground;
  ctx.arc(
    center.x,
    center.y,
    radius,
    confinedValue > 0 ? scale(adjustedZero) : scale(confinedValue),
    confinedValue > 0 ? scale(confinedValue) : scale(adjustedZero),
    counterClockwise,
  );
  ctx.stroke();

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= max && datum.target >= min) {
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
  // Assumes mostly homogenous formatting
  const maxTickWidth = formatterColorTicks.reduce((acc, t) => {
    const { width } = measure(t.formattedValue, TICK_FONT, TICK_FONT_SIZE);
    return Math.max(acc, width);
  }, 0);

  // Tick labels
  ctx.fillStyle = style.textColor;
  ctx.textBaseline = 'middle';
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  formatterColorTicks
    .filter((tick) => tick.value >= min && tick.value <= max)
    .forEach((tick) => {
      ctx.textAlign = 'center';
      const textPadding = style.angularTickLabelPadding + maxTickWidth / 2;
      const start = scale(tick.value);
      const y1 = Math.sin(start) * (radius - BULLET_SIZE / 2 - textPadding);
      const x1 = Math.cos(start) * (radius - BULLET_SIZE / 2 - textPadding);

      ctx.fillText(tick.formattedValue, center.x + x1, center.y + y1);
    });

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
