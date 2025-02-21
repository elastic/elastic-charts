/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Color } from '../../../../../common/colors';
import { cssFontShorthand } from '../../../../../common/text_utils';
import { clamp, isBetween, isFiniteNumber, sortNumbers } from '../../../../../utils/common';
import type { ContinuousDomain, GenericDomain } from '../../../../../utils/domain';
import type { ActiveValue } from '../../../selectors/get_active_values';
import type { BulletPanelDimensions } from '../../../selectors/get_panel_dimensions';
import type { BulletStyle } from '../../../theme';
import { GRAPH_PADDING, TICK_FONT, TICK_FONT_SIZE } from '../../../theme';
import { TARGET_SIZE, BULLET_SIZE, TICK_WIDTH, BAR_SIZE, TARGET_STROKE_WIDTH, TICK_LABEL_PADDING } from '../constants';

/** @internal */
export function verticalBullet(
  ctx: CanvasRenderingContext2D,
  dimensions: BulletPanelDimensions,
  style: BulletStyle,
  backgroundColor: Color,
  activeValue?: ActiveValue | null,
) {
  ctx.translate(0, GRAPH_PADDING.top);

  const { datum, graphArea, scale, colorBands, ticks } = dimensions;
  const [start, end] = scale.domain() as GenericDomain;
  const [min, max] = sortNumbers([start, end]) as ContinuousDomain;
  const graphPaddedHeight = graphArea.size.height - GRAPH_PADDING.bottom - GRAPH_PADDING.top;

  // color bands
  colorBands.reverse().forEach((band) => {
    ctx.fillStyle = band.color;
    ctx.fillRect(
      graphArea.size.width / 2 - BULLET_SIZE / 2,
      graphPaddedHeight - band.start - band.size,
      BULLET_SIZE,
      band.size,
    );
  });

  // Ticks
  ctx.beginPath();
  ctx.strokeStyle = backgroundColor;
  ctx.lineWidth = TICK_WIDTH;

  ticks
    .filter((tick) => tick > min && tick < max)
    .forEach((tick) => {
      ctx.moveTo(graphArea.size.width / 2 - BULLET_SIZE / 2, graphPaddedHeight - scale(tick));
      ctx.lineTo(graphArea.size.width / 2 + BULLET_SIZE / 2, graphPaddedHeight - scale(tick));
    });
  ctx.stroke();

  // Bar
  const confinedValue = clamp(datum.value, min, max);
  const adjustedZero = clamp(0, min, max);
  ctx.fillStyle = style.barBackground;
  ctx.fillRect(
    graphArea.size.width / 2 - BAR_SIZE / 2,
    confinedValue > 0 ? graphPaddedHeight - scale(confinedValue) : graphPaddedHeight - scale(adjustedZero),
    BAR_SIZE,
    confinedValue > 0 ? scale(confinedValue) - scale(adjustedZero) : scale(adjustedZero) - scale(confinedValue),
  );

  // Target
  if (isFiniteNumber(datum.target) && datum.target <= max && datum.target >= min) {
    ctx.fillRect(
      graphArea.size.width / 2 - TARGET_SIZE / 2,
      graphPaddedHeight - scale(datum.target) - TARGET_STROKE_WIDTH / 2,
      TARGET_SIZE,
      TARGET_STROKE_WIDTH,
    );
  }

  // Zero baseline
  if (isBetween(min, max, true)(0)) {
    ctx.fillRect(
      graphArea.size.width / 2 - BULLET_SIZE / 2,
      graphPaddedHeight - scale(0) - TICK_WIDTH / 2,
      BULLET_SIZE,
      TICK_WIDTH,
    );
  }

  // Active Value
  if (activeValue && (datum.syncCursor || !activeValue.external)) {
    ctx.fillRect(
      graphArea.size.width / 2 - TARGET_SIZE / 2,
      graphPaddedHeight - activeValue.value - TARGET_STROKE_WIDTH / 2,
      TARGET_SIZE,
      TARGET_STROKE_WIDTH,
    );
  }

  // Tick labels
  ctx.textBaseline = 'top';
  ctx.fillStyle = style.textColor;
  ctx.font = cssFontShorthand(TICK_FONT, TICK_FONT_SIZE);
  ticks
    .filter((tick) => tick >= min && tick <= max)
    .forEach((tick, i) => {
      ctx.textAlign = 'end';

      const labelText = datum.tickFormatter(tick);
      if (i === ticks.length - 1) {
        const availableHeight = Math.abs((start > end ? min : max) - (ticks.at(i) ?? NaN));
        const labelHeight = TICK_FONT_SIZE;
        ctx.textBaseline = labelHeight >= Math.abs(scale(availableHeight) - scale(0)) ? 'hanging' : 'bottom';
      } else {
        ctx.textBaseline = 'bottom';
      }

      ctx.fillText(
        labelText,
        graphArea.size.width / 2 - TARGET_SIZE / 2 - TICK_LABEL_PADDING,
        graphPaddedHeight - scale(tick),
      );
    });
}
