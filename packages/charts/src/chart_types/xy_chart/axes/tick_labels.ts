/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Font } from '../../../common/text_utils';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import type { TextMeasure } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { Position } from '../../../utils/common';
import { wrapText, type WrapTextLines } from '../../../utils/text/wrap';
import type { AxisStyle, Theme } from '../../../utils/themes/theme';
import { computeRotatedLabelDimensions } from '../utils/axis_utils';

/** @internal */
export const createTickLayout = (axisStyle: AxisStyle, measure: TextMeasure, locale: string) => {
  const font: Font = {
    fontStyle: axisStyle.tickLabel.fontStyle ?? 'normal',
    fontFamily: axisStyle.tickLabel.fontFamily,
    fontWeight: 'normal',
    fontVariant: 'normal',
    textColor: 'black',
  };

  const { wrapLines: maxLines, lineHeight } = axisStyle.tickLabel;

  return (value: string, maxLineLength: number) => {
    const wrapped = wrapText(value, font, axisStyle.tickLabel.fontSize, maxLineLength, maxLines, measure, locale);
    const { width, height } = wrapped.reduce(
      (acc, line, index) => {
        const measured = measure(line, font, axisStyle.tickLabel.fontSize);
        acc.width = Math.max(acc.width, measured.width);
        acc.height += index < wrapped.length - 1 ? lineHeight * axisStyle.tickLabel.fontSize : measured.height;
        return acc;
      },
      { width: 0, height: 0 },
    );
    const { width: bboxWidth, height: bboxHeight } = computeRotatedLabelDimensions(
      { width, height },
      axisStyle.tickLabel.rotation,
    );
    return { width, height, bboxWidth, bboxHeight, lines: wrapped };
  };
};

/** @internal */
export type TickLabelLayout = ReturnType<typeof createTickLayout>;
/** @internal */
export type TickLabelBox = ReturnType<TickLabelLayout>;

/** @internal */
export const getMaxLineLength = (position: Position, theme: Theme, scale: ScaleBand | ScaleContinuous) => {
  if (position === Position.Top || position === Position.Bottom) {
    return scale.bandwidth > 0 ? scale.step : Infinity;
  }

  if (position === Position.Left) {
    return theme.axes.maxSize?.left ?? Infinity;
  }

  return theme.axes.maxSize?.right ?? Infinity;
};

const emptyWrapLines: WrapTextLines = Object.assign([], { meta: { truncated: false } });

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
    { bboxWidth: 0, bboxHeight: 0, width: 0, height: 0, lines: emptyWrapLines },
  );
};
