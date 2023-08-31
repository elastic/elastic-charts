/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleLinear } from 'd3-scale';

import { maxTicksByLength } from './common';
import { Color } from '../../../../../common/colors';
import { TAU } from '../../../../../common/constants';
import { Radian } from '../../../../../common/geometry';
import { cssFontShorthand } from '../../../../../common/text_utils';
import { clamp, isFiniteNumber } from '../../../../../utils/common';
import { Size } from '../../../../../utils/dimensions';
import { Point } from '../../../../../utils/point';
import { renderDebugPoint } from '../../../../xy_chart/renderer/canvas/utils/debug';
import { BulletDatum, BulletGraphSize, BulletGraphSpec } from '../../../spec';
import { BulletGraphStyle, GRAPH_PADDING, TICK_FONT, TICK_FONT_SIZE } from '../../../theme';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE, TARGET_WIDTH, TICK_LABEL_PADDING } from '../constants';

const TICK_INTERVAL = 120;

/** @internal */
export function angularBullet(
  ctx: CanvasRenderingContext2D,
  datum: BulletDatum,
  graphSize: Size,
  style: BulletGraphStyle,
  bandColors: [string, string],
  spec: BulletGraphSpec,
  debug: boolean,
) {
  const [maxWidth, maxHeight] = getAngledChartSizing(graphSize, spec.size);
  const radius = Math.min(maxWidth, maxHeight) / 2 - TARGET_SIZE / 2;
  const [startAngle, endAngle] = getAnglesBySize(spec.size, spec.reverse);

  const center = {
    x: graphSize.width / 2 - GRAPH_PADDING.left,
    y: radius + TARGET_SIZE / 2,
  };

  ctx.translate(GRAPH_PADDING.left, GRAPH_PADDING.top);
  const totalDomainArc = Math.abs(datum.domain.min - datum.domain.max);

  const scale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range([startAngle, endAngle]);
  // @ts-ignore - range derived from strings
  const colorScale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range(bandColors);
  const maxTicks = maxTicksByLength(Math.abs(startAngle - endAngle) * radius, TICK_INTERVAL);
  const colorTicks = scale.ticks(maxTicks - 1);
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
            color: `${colorScale(tick)}`,
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
    .filter((tick) => tick > datum.domain.min && tick < datum.domain.max)
    .forEach((tick) => {
      const bulletWidth = BULLET_SIZE + 4; // TODO fix arbitrary extension
      drawPolarLine(ctx)(scale(tick), radius, bulletWidth, center);
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

    drawPolarLine(ctx)(scale(datum.target), radius, TARGET_SIZE, center);

    ctx.stroke();
  }

  // Tick labels
  ctx.fillStyle = style.textColor;
  ctx.textBaseline = 'middle';
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  colorTicks
    .filter((tick) => tick >= datum.domain.min && tick <= datum.domain.max)
    .forEach((tick) => {
      const labelText = datum.tickFormatter(tick);
      ctx.textAlign = 'center';
      const textPadding = TICK_LABEL_PADDING;
      const start = scale(tick);
      const y1 = Math.sin(start) * (radius - BULLET_SIZE / 2 - textPadding);
      const x1 = Math.cos(start) * (radius - BULLET_SIZE / 2 - textPadding);

      ctx.fillText(labelText, center.x + x1, center.y + y1);
    });

  ctx.beginPath();

  if (debug) {
    renderDebugPoint(ctx, 0, 0);
    renderDebugPoint(ctx, center.x, center.y);
    renderDebugPoint(ctx, graphSize.width / 2 - GRAPH_PADDING.left, graphSize.height / 2 - GRAPH_PADDING.top);
  }
}
/**
 * Draws line along a polar axis
 */
function drawPolarLine(ctx: CanvasRenderingContext2D) {
  return function (angle: Radian, radius: number, length: number, center: Point = { x: 0, y: 0 }) {
    const y1 = Math.sin(angle) * (radius - length / 2);
    const x1 = Math.cos(angle) * (radius - length / 2);
    const y2 = Math.sin(angle) * (radius + length / 2);
    const x2 = Math.cos(angle) * (radius + length / 2);

    ctx.moveTo(center.x + x1, center.y + y1);
    ctx.lineTo(center.x + x2, center.y + y2);
  };
}

const sizeAngles: Record<BulletGraphSize, { startAngle: number; endAngle: number }> = {
  [BulletGraphSize.half]: {
    startAngle: 1 * Math.PI,
    endAngle: 0,
  },
  [BulletGraphSize.twoThirds]: {
    startAngle: 1.25 * Math.PI,
    endAngle: -0.25 * Math.PI,
  },
  [BulletGraphSize.full]: {
    startAngle: 1.5 * Math.PI,
    endAngle: -0.5 * Math.PI,
  },
};

/** @internal */
export function getAnglesBySize(size: BulletGraphSize, reverse: boolean): [startAngle: number, endAngle: number] {
  const angles = sizeAngles[size] ?? sizeAngles[BulletGraphSize.twoThirds]!;
  // Negative angles used to match current radian pattern
  const startAngle = -angles.startAngle;
  // limit endAngle to startAngle +/- 2π
  const endAngle = clamp(-angles.endAngle, startAngle - TAU, startAngle + TAU);
  if (reverse) return [endAngle, startAngle];
  return [startAngle, endAngle];
}

const heightModifiers: Record<BulletGraphSize, number> = {
  [BulletGraphSize.half]: 0.5,
  [BulletGraphSize.twoThirds]: 0.86, // approximated to account for flare of arc stroke at the bottom
  [BulletGraphSize.full]: 1,
};

/** @internal */
export function getAngledChartSizing(graphSize: Size, size: BulletGraphSize): [maxWidth: number, maxHeight: number] {
  const heightModifier = heightModifiers[size] ?? 1;
  const maxWidth = graphSize.width - GRAPH_PADDING.left - GRAPH_PADDING.right;
  const maxHeight = graphSize.height - GRAPH_PADDING.top - GRAPH_PADDING.bottom;
  const modifiedHeight = maxHeight / heightModifier;

  return [maxWidth, modifiedHeight];
}
