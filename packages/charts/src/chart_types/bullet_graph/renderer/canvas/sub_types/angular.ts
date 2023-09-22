/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { maxTicksByLength } from './common';
import { Color } from '../../../../../common/colors';
import { TAU } from '../../../../../common/constants';
import { Radian } from '../../../../../common/geometry';
import { cssFontShorthand } from '../../../../../common/text_utils';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isFiniteNumber, roundToNearest } from '../../../../../utils/common';
import { Point } from '../../../../../utils/point';
import { drawPolarLine } from '../../../../xy_chart/renderer/canvas/lines';
import { renderDebugPoint } from '../../../../xy_chart/renderer/canvas/utils/debug';
import { BulletPanelDimensions } from '../../../selectors/get_dimensions';
import { BulletGraphSpec } from '../../../spec';
import { BulletGraphStyle, GRAPH_PADDING, TICK_FONT, TICK_FONT_SIZE } from '../../../theme';
import { getAngledChartSizing } from '../../../utils/angular';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE, TARGET_WIDTH, HOVER_SLOP } from '../constants';

const TICK_INTERVAL = 120;

/** @internal */
export function angularBullet(
  ctx: CanvasRenderingContext2D,
  dimensions: BulletPanelDimensions,
  style: BulletGraphStyle,
  spec: BulletGraphSpec,
  debug: boolean,
  pointerPosition?: Point,
) {
  const { datum, graphArea, scale, colorScale } = dimensions;
  const [maxWidth, maxHeight] = getAngledChartSizing(graphArea.size, spec.size);
  const radius = Math.min(maxWidth, maxHeight) / 2 - TARGET_SIZE / 2;
  const [startAngle, endAngle] = scale.range() as [number, number];

  const center = {
    x: graphArea.center.x,
    y: radius + TARGET_SIZE / 2,
  };

  ctx.translate(GRAPH_PADDING.left, GRAPH_PADDING.top);
  const totalDomainArc = Math.abs(datum.domain.min - datum.domain.max);
  const maxTicks = maxTicksByLength(Math.abs(startAngle - endAngle) * radius, TICK_INTERVAL);
  const colorTicks = scale.ticks(maxTicks - 1).map((v) => ({ value: v, formattedValue: datum.tickFormatter(v) }));
  const colorBandSize = totalDomainArc / colorTicks.length;
  const counterClockwise = startAngle > endAngle;
  const { colors } = colorTicks.reduce<{
    last: number;
    colors: Array<{ color: Color; start: number; end: number }>;
  }>(
    (acc, tick) => {
      return {
        last: acc.last + colorBandSize,
        colors: [
          ...acc.colors,
          {
            color: `${colorScale(tick.value)}`,
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

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = style.background;
  ctx.lineWidth = TICK_WIDTH;

  colorTicks
    .filter((tick) => tick.value > datum.domain.min && tick.value < datum.domain.max)
    .forEach((tick) => {
      const bulletWidth = BULLET_SIZE + 4; // TODO fix arbitrary extension
      drawPolarLine(ctx, scale(tick.value), radius, bulletWidth, center);
    });

  ctx.stroke();

  // Bar
  ctx.beginPath();
  ctx.arc(
    center.x,
    center.y,
    radius,
    startAngle,
    scale(clamp(datum.value, datum.domain.min, datum.domain.max)),
    counterClockwise,
  );
  ctx.lineWidth = BAR_SIZE;
  ctx.strokeStyle = style.barBackground;
  ctx.stroke();

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= datum.domain.max && datum.target >= datum.domain.min) {
    ctx.beginPath();
    ctx.lineWidth = TARGET_WIDTH;

    drawPolarLine(ctx, scale(datum.target), radius, TARGET_SIZE, center);

    ctx.stroke();
  }

  const measure = measureText(ctx);
  // Assumes mostly homogenous formatting
  const maxTickWidth = colorTicks.reduce((acc, t) => {
    const { width } = measure(t.formattedValue, TICK_FONT, TICK_FONT_SIZE);
    return Math.max(acc, width);
  }, 0);

  // Tick labels
  ctx.fillStyle = style.textColor;
  ctx.textBaseline = 'middle';
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  colorTicks
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

  if (pointerPosition) {
    const { x, y } = pointerPosition;
    const normalizedPointer = {
      x: x - center.x - graphArea.origin.x - GRAPH_PADDING.left,
      y: y - center.y - graphArea.origin.y - GRAPH_PADDING.top,
    };

    const distance = Math.sqrt(Math.pow(normalizedPointer.x, 2) + Math.pow(normalizedPointer.y, 2));
    const outerLimit = radius + BULLET_SIZE / 2 + HOVER_SLOP;
    const innerLimit = radius - BULLET_SIZE / 2 - HOVER_SLOP;

    if (Number.isFinite(distance) && distance <= outerLimit && distance >= innerLimit) {
      // TODO find why to determine angle between origin and point
      // The angle goes from -π in Quadrant 2 to +π in Quadrant 3
      // This angle offset is a temporary fix
      const angleOffset = normalizedPointer.x < 0 && normalizedPointer.y > 0 ? -TAU : 0;
      const angle: Radian = Math.atan2(normalizedPointer.y, normalizedPointer.x) + angleOffset;
      const rawValue = scale.invert(angle);

      if (isFiniteNumber(rawValue) && rawValue <= datum.domain.max && rawValue >= datum.domain.min) {
        const value = spec.tickSnapStep ? roundToNearest(rawValue, spec.tickSnapStep, datum.domain) : rawValue;
        ctx.lineWidth = TARGET_WIDTH;
        ctx.strokeStyle = 'red';
        const snapAngle = spec.tickSnapStep ? scale(value) : angle;
        drawPolarLine(ctx, snapAngle, radius, TARGET_SIZE, center);

        ctx.stroke();

        // TODO: return value on callback
      }
    }
  }

  ctx.beginPath();

  if (debug) {
    renderDebugPoint(ctx, 0, 0);
    renderDebugPoint(ctx, center.x, center.y);
    renderDebugPoint(ctx, graphArea.size.width / 2 - GRAPH_PADDING.left, graphArea.size.height / 2 - GRAPH_PADDING.top);
  }
}
