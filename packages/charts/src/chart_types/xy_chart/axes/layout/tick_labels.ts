/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelBox } from './types';
import type { Font } from '../../../../common/text_utils';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { Position } from '../../../../utils/common';
import { wrapText } from '../../../../utils/text/wrap';
import type { AxisStyle, Theme } from '../../../../utils/themes/theme';
import type { AxisLabelFormatter } from '../../state/selectors/axis_tick_formatter';
import { computeRotatedLabelDimensions } from '../../utils/axis_utils';

/** @internal */
export const createTickMeasurer = (
  axisStyle: AxisStyle,
  measure: TextMeasure,
  format: AxisLabelFormatter,
  locale: string,
) => {
  const font: Font = {
    fontStyle: axisStyle.tickLabel.fontStyle ?? 'normal',
    fontFamily: axisStyle.tickLabel.fontFamily,
    fontWeight: 'normal',
    fontVariant: 'normal',
    textColor: 'black',
  };

  const maxLines = axisStyle.tickLabel.wrapLines ?? 1;
  const lineHeight = axisStyle.tickLabel.lineHeight ?? 1.2;

  return (text: string, maxLineLength: number): TickLabelBox => {
    const formatted = format(text);
    const wrapped = wrapText(formatted, font, axisStyle.tickLabel.fontSize, maxLineLength, maxLines, measure, locale);
    const { width, height } = wrapped.reduce(
      (acc, line) => {
        acc.width = Math.max(acc.width, measure(line, font, axisStyle.tickLabel.fontSize).width);
        return acc;
      },
      { width: 0, height: wrapped.length * lineHeight * axisStyle.tickLabel.fontSize },
    );
    const { width: bboxWidth, height: bboxHeight } = computeRotatedLabelDimensions(
      { width, height },
      axisStyle.tickLabel.rotation,
    );
    return { width, height, bboxWidth, bboxHeight, lines: wrapped };
  };
};

/** @internal */
export const getMaxLineLength = (position: Position, theme: Theme) => {
  switch (position) {
    case Position.Top:
      return theme.axes.maxSize?.top ?? Infinity;
    case Position.Bottom:
      return theme.axes.maxSize?.bottom ?? Infinity;
    case Position.Left:
      return theme.axes.maxSize?.left ?? Infinity;
    case Position.Right:
      return theme.axes.maxSize?.right ?? Infinity;
  }
};

/** @internal */
export const getMaxLabelDimensions = (ticks: TickLabelBox[]): TickLabelBox => {
  return ticks.reduce(
    (max: TickLabelBox, tick) => {
      const { bboxWidth, bboxHeight, width, height, lines } = tick;

      return {
        bboxWidth: Math.max(max.bboxWidth, bboxWidth),
        bboxHeight: Math.max(max.bboxHeight, bboxHeight),
        width: Math.max(max.width, width),
        height: Math.max(max.height, height),
        lines: lines && max.lines ? (lines.length > max.lines.length ? lines : max.lines) : lines,
      };
    },
    { bboxWidth: 0, bboxHeight: 0, width: 0, height: 0 },
  );
};
