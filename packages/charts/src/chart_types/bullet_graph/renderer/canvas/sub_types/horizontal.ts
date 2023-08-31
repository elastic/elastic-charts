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
import { cssFontShorthand } from '../../../../../common/text_utils';
import { measureText } from '../../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isFiniteNumber } from '../../../../../utils/common';
import { Size } from '../../../../../utils/dimensions';
import { BulletDatum } from '../../../spec';
import { BulletGraphStyle, GRAPH_PADDING, TICK_FONT, TICK_FONT_SIZE } from '../../../theme';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE } from '../constants';

const TICK_INTERVAL = 100;

/** @internal */
export function horizontalBullet(
  ctx: CanvasRenderingContext2D,
  datum: BulletDatum,
  graphSize: Size,
  style: BulletGraphStyle,
  bandColors: [string, string],
) {
  ctx.translate(GRAPH_PADDING.left, 0);
  // TODO: add BASE
  // const base = datum.domain.min < 0 && datum.domain.max > 0 ? 0 : NaN;
  const paddedWidth = graphSize.width - GRAPH_PADDING.left - GRAPH_PADDING.right;
  const scale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range([0, paddedWidth]);
  // @ts-ignore - range derived from strings
  const colorScale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range(bandColors);
  const maxTicks = maxTicksByLength(graphSize.width, TICK_INTERVAL);
  const colorTicks = scale.ticks(maxTicks - 1);
  const colorBandSize = paddedWidth / colorTicks.length;
  const { colors } = colorTicks.reduce<{
    last: number;
    colors: Array<{ color: Color; size: number; position: number }>;
  }>(
    (acc, tick) => {
      return {
        last: acc.last + colorBandSize,
        colors: [
          ...acc.colors,
          {
            color: `${colorScale(tick)}`,
            size: colorBandSize,
            position: acc.last,
          },
        ],
      };
    },
    { last: 0, colors: [] },
  );

  // color bands
  const verticalAlignment = TARGET_SIZE / 2;
  colors.forEach((band) => {
    ctx.fillStyle = band.color;
    ctx.fillRect(band.position, verticalAlignment - BULLET_SIZE / 2, band.size, BULLET_SIZE);
  });

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = style.background;
  ctx.lineWidth = TICK_WIDTH;
  colorTicks
    .filter((tick) => tick > datum.domain.min && tick < datum.domain.max)
    .forEach((tick) => {
      ctx.moveTo(scale(tick), verticalAlignment - BULLET_SIZE / 2);
      ctx.lineTo(scale(tick), verticalAlignment + BULLET_SIZE / 2);
    });
  ctx.stroke();

  // Bar
  ctx.fillStyle = style.barBackground;
  ctx.fillRect(
    0,
    verticalAlignment - BAR_SIZE / 2,
    scale(clamp(datum.value, datum.domain.min, datum.domain.max)),
    BAR_SIZE,
  );

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= datum.domain.max && datum.target >= datum.domain.min) {
    ctx.fillRect(scale(datum.target) - 1.5, verticalAlignment - TARGET_SIZE / 2, 3, TARGET_SIZE);
  }

  // Tick labels
  ctx.fillStyle = style.textColor;
  ctx.textBaseline = 'top';
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  colorTicks
    .filter((tick) => tick >= datum.domain.min && tick <= datum.domain.max)
    .forEach((tick, i) => {
      const labelText = datum.tickFormatter(tick);
      if (i === colorTicks.length - 1) {
        const availableWidth = datum.domain.max - (colorTicks.at(-1) ?? 0);
        const { width: labelWidth } = measureText(ctx)(labelText, TICK_FONT, TICK_FONT_SIZE);
        ctx.textAlign = labelWidth >= scale(availableWidth) ? 'end' : 'start';
      } else {
        ctx.textAlign = 'start';
      }

      ctx.fillText(labelText, scale(tick), verticalAlignment + TARGET_SIZE / 2);
    });
}
