/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { maxTicksByLength } from './common';
import { Color } from '../../../../../common/colors';
import { cssFontShorthand } from '../../../../../common/text_utils';
import { isFiniteNumber } from '../../../../../utils/common';
import { BulletPanelDimensions } from '../../../selectors/get_dimensions';
import { BulletGraphStyle, GRAPH_PADDING, TICK_FONT, TICK_FONT_SIZE } from '../../../theme';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE } from '../constants';

const TICK_INTERVAL = 100;

/** @internal */
export function verticalBullet(
  ctx: CanvasRenderingContext2D,
  dimensions: BulletPanelDimensions,
  style: BulletGraphStyle,
) {
  ctx.translate(0, GRAPH_PADDING.top);

  const { datum, graphArea, scale, colorScale } = dimensions;

  const graphPaddedHeight = graphArea.size.height - GRAPH_PADDING.bottom - GRAPH_PADDING.top;
  const maxTicks = maxTicksByLength(graphArea.size.height, TICK_INTERVAL);
  const colorTicks = scale.ticks(maxTicks - 1);
  const colorBandSize = graphPaddedHeight / colorTicks.length;
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
  colors.forEach((band) => {
    ctx.fillStyle = band.color;
    ctx.fillRect(
      graphArea.size.width / 2 - BULLET_SIZE / 2,
      graphPaddedHeight - band.position - band.size,
      BULLET_SIZE,
      band.size,
    );
  });

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = style.background;
  ctx.lineWidth = TICK_WIDTH;

  colorTicks
    .filter((tick) => tick > datum.domain.min && tick < datum.domain.max)
    .forEach((tick) => {
      ctx.moveTo(graphArea.size.width / 2 - BULLET_SIZE / 2, graphPaddedHeight - scale(tick));
      ctx.lineTo(graphArea.size.width / 2 + BULLET_SIZE / 2, graphPaddedHeight - scale(tick));
    });
  ctx.stroke();

  // Bar
  ctx.fillStyle = style.barBackground;
  ctx.fillRect(
    graphArea.size.width / 2 - BAR_SIZE / 2,
    graphPaddedHeight - scale(datum.value),
    BAR_SIZE,
    scale(datum.value),
  );

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= datum.domain.max && datum.target >= datum.domain.min) {
    ctx.fillRect(
      graphArea.size.width / 2 - TARGET_SIZE / 2,
      graphPaddedHeight - scale(datum.target) - 1.5,
      TARGET_SIZE,
      3,
    );
  }

  // Tick labels
  ctx.textBaseline = 'top';
  ctx.fillStyle = style.textColor;
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  colorTicks
    .filter((tick) => tick >= datum.domain.min && tick <= datum.domain.max)
    .forEach((tick, i) => {
      ctx.textAlign = 'end';

      const labelText = datum.tickFormatter(tick);
      if (i === colorTicks.length - 1) {
        const availableHeight = datum.domain.max - (colorTicks.at(-1) ?? 0);
        const labelHeight = TICK_FONT_SIZE;
        ctx.textBaseline = labelHeight >= scale(availableHeight) ? 'hanging' : 'bottom';
      } else {
        ctx.textBaseline = 'bottom';
      }

      ctx.fillText(labelText, graphArea.size.width / 2 - TARGET_SIZE / 2 - 6, graphPaddedHeight - scale(tick));
    });
}
