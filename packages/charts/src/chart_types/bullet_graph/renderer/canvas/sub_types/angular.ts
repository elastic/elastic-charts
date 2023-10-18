/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getColorBandSizes } from './common';
import { Color } from '../../../../../common/colors';
import { cssFontShorthand } from '../../../../../common/text_utils';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isFiniteNumber } from '../../../../../utils/common';
import { drawPolarLine } from '../../../../xy_chart/renderer/canvas/lines';
import { renderDebugPoint } from '../../../../xy_chart/renderer/canvas/utils/debug';
import { ActiveValue } from '../../../selectors/get_active_values';
import { BulletPanelDimensions } from '../../../selectors/get_panel_dimensions';
import { BulletGraphSpec } from '../../../spec';
import { BulletGraphStyle, GRAPH_PADDING, TICK_FONT, TICK_FONT_SIZE } from '../../../theme';
import { getAngledChartSizing } from '../../../utils/angular';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE, TARGET_WIDTH, ANGULAR_TICK_INTERVAL } from '../constants';

/** @internal */
export function angularBullet(
  ctx: CanvasRenderingContext2D,
  dimensions: BulletPanelDimensions,
  style: BulletGraphStyle,
  spec: BulletGraphSpec,
  debug: boolean,
  activeValue?: ActiveValue | null,
) {
  const { datum, graphArea, scale, colorScale } = dimensions;
  const { radius } = getAngledChartSizing(graphArea.size, spec.subtype);
  const [startAngle, endAngle] = scale.range() as [number, number];
  const counterClockwise = startAngle > endAngle;
  const center = {
    x: graphArea.center.x,
    y: radius + TARGET_SIZE / 2,
  };

  ctx.translate(GRAPH_PADDING.left, GRAPH_PADDING.top);

  const totalDomainArc = Math.abs(datum.domain.min - datum.domain.max);
  const { colorTicks, colorBandSize } = getColorBandSizes(
    Math.abs(startAngle - endAngle) * radius,
    ANGULAR_TICK_INTERVAL,
    scale,
    totalDomainArc,
  );

  const formatterColorTicks = colorTicks.map((v) => ({ value: v, formattedValue: datum.tickFormatter(v) }));
  const { colors } = formatterColorTicks.reduce<{
    last: number;
    colors: Array<{ color: Color; start: number; end: number }>;
  }>(
    (acc, tick) => {
      return {
        last: acc.last + colorBandSize,
        colors: [
          ...acc.colors,
          {
            color: colorScale(tick.value, true),
            start: scale(acc.last),
            end: scale(acc.last + colorBandSize),
          },
        ],
      };
    },
    { last: datum.domain.min, colors: [] },
  );

  // Color bands
  colors.forEach((band) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, band.start, band.end, counterClockwise);
    ctx.lineWidth = BULLET_SIZE;
    ctx.strokeStyle = band.color;
    ctx.stroke();
  });

  // Bar
  const confinedValue = clamp(datum.value, datum.domain.min, datum.domain.max);
  ctx.beginPath();
  ctx.arc(
    center.x,
    center.y,
    radius,
    confinedValue > 0 ? scale(0) : scale(confinedValue),
    confinedValue > 0 ? scale(confinedValue) : scale(0),
    counterClockwise,
  );
  ctx.lineWidth = BAR_SIZE;
  ctx.strokeStyle = style.barBackground;
  ctx.stroke();

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = style.background;
  ctx.lineWidth = TICK_WIDTH;

  formatterColorTicks
    .filter((tick) => tick.value > datum.domain.min && tick.value < datum.domain.max)
    .forEach((tick) => {
      const bulletWidth = BULLET_SIZE + 4; // TODO fix arbitrary extension
      drawPolarLine(ctx, scale(tick.value), radius, bulletWidth, center);
    });

  ctx.stroke();

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= datum.domain.max && datum.target >= datum.domain.min) {
    ctx.beginPath();
    ctx.strokeStyle = style.barBackground;
    ctx.lineWidth = TARGET_WIDTH;

    drawPolarLine(ctx, scale(datum.target), radius, TARGET_SIZE, center);

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
    .filter((tick) => tick.value >= datum.domain.min && tick.value <= datum.domain.max)
    .forEach((tick) => {
      ctx.textAlign = 'center';
      const textPadding = style.angularTickLabelPadding + maxTickWidth / 2;
      const start = scale(tick.value);
      const y1 = Math.sin(start) * (radius - BULLET_SIZE / 2 - textPadding);
      const x1 = Math.cos(start) * (radius - BULLET_SIZE / 2 - textPadding);

      ctx.fillText(tick.formattedValue, center.x + x1, center.y + y1);
    });

  ctx.beginPath();

  if (activeValue) {
    drawPolarLine(ctx, activeValue.value, radius, TARGET_SIZE, center);

    ctx.stroke();
  }

  ctx.beginPath();

  if (debug) {
    renderDebugPoint(ctx, center.x, center.y); // arch center
  }
}
