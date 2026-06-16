/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxisTick } from './types';
import { fitText, type Font } from '../../../../common/text_utils';
import type { ScaleBand, ScaleContinuous } from '../../../../scales';
import { ScaleType } from '../../../../scales/constants';
import { isContinuousScale } from '../../../../scales/types';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { degToRad } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import { wrapText, type WrapTextLines } from '../../../../utils/text/wrap';
import type { AxisStyle } from '../../../../utils/themes/theme';
import type { AxisSpec } from '../../utils/specs';

/** @internal */
export const shouldAllowWordWrap = (scale: ScaleBand | ScaleContinuous): boolean =>
  !isContinuousScale(scale) || scale.type === ScaleType.Time;

/** @internal */
export function computeRotatedLabelDimensions(unrotatedDims: Size, degreesRotation: number): Size {
  const { width, height } = unrotatedDims;
  const radians = degToRad(degreesRotation);
  const rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
  const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
  return { width: rotatedWidth, height: rotatedHeight };
}

/** @internal */
export const MIN_LABEL_GAP = 4;
/** @internal */
export const MIN_LABEL_LENGTH = 12;

/** @internal */
export const withoutTickLabel = (tick: AxisTick): AxisTick => ({
  ...tick,
  label: '',
  layout: {
    width: 0,
    height: 0,
    bboxWidth: 0,
    bboxHeight: 0,
    lines: Object.assign([], { meta: { truncated: false } }),
  },
});

/** @internal */
export const createTickLabelLayout = (
  axisStyle: AxisStyle,
  axisSpec: AxisSpec,
  measure: TextMeasure,
  locale: string,
  maxLines: number,
  maxLineLength: number,
  allowWordWrap = true,
) => {
  const { lineHeight, fontSize, fontStyle, fontFamily, rotation } = axisStyle.tickLabel;

  const font: Font = {
    fontStyle: fontStyle ?? 'normal',
    fontFamily,
    fontWeight: 'normal',
    fontVariant: 'normal',
    textColor: 'black',
  };

  return (value: string) => {
    const truncate = axisStyle.tickLabel.truncate ?? axisSpec.tickLabelTruncate;

    let lines: WrapTextLines = Object.assign([], { meta: { truncated: false } });

    const measureSingleLine = measure(value, font, fontSize);

    if (measureSingleLine.width <= maxLineLength) {
      lines = Object.assign([value], { meta: { truncated: false } });
    } else if (!allowWordWrap) {
      const { text } = fitText(measure, value, maxLineLength, fontSize, font, truncate ?? 'end');
      lines = Object.assign([text], { meta: { truncated: text !== value } });
    } else {
      lines = wrapText(value, font, fontSize, maxLineLength, maxLines, measure, locale, 'word', truncate);
    }

    const { width, height } = lines.reduce(
      (acc, line, index) => {
        const measured = measure(line, font, fontSize);
        acc.width = Math.max(acc.width, measured.width);
        acc.height += index < lines.length - 1 ? lineHeight * fontSize : measured.height;
        return acc;
      },
      { width: 0, height: 0 },
    );
    const { width: bboxWidth, height: bboxHeight } = computeRotatedLabelDimensions({ width, height }, rotation);
    return {
      width: Math.ceil(width),
      height: Math.ceil(height),
      bboxWidth: Math.ceil(bboxWidth),
      bboxHeight: Math.ceil(bboxHeight),
      lines,
    };
  };
};

/** @internal */
export type TickLabelLayout = ReturnType<typeof createTickLabelLayout>;

/** @internal */
export type TickLabelBox = ReturnType<TickLabelLayout>;

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
