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
import { isBandScale, isContinuousScale } from '../../../../scales/types';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { degToRad, getPercentageValue } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import { wrapText, type WrapTextLines } from '../../../../utils/text/wrap';
import type { AxisStyle } from '../../../../utils/themes/theme';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import type { AxisSpec } from '../../utils/specs';
import type { AxisBand } from '../dimensions';

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

/**
 * Max length (in characters) of a single-word label that is kept whole on one line when it
 * overflows its slot, instead of being wrapped mid-word or truncated. Tuned to cover short
 * labels such as weekday/month names (e.g. `"Wednesday"`), while genuinely long single tokens
 * (urls, hashes, identifiers) still fall through to the wrap/truncate paths.
 */
const MAX_FULL_LABEL_CHARS = 10;

const isCompactSingleWord = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_FULL_LABEL_CHARS && !/\s/.test(trimmed);
};

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

/**
 * Resolve `tickLabel.limit`, `tickLabel.wrapLines` and `maxExtent` into the
 * effective maximum line width and number of wrap lines that should be passed to the wrap
 * pipeline. `axis.maxExtent` wins over `limit` and over `wrapLines`.
 *
 * - Horizontal axes (top/bottom): line width is capped by category slot width for ordinal
 *   and grouped-bar scales. Histogram continuous axes use the label budget instead.
 * @internal
 */
export const resolveTickLabelConstraints = ({
  axisSpec,
  style,
  band,
  scale,
  containerWidth,
  multilayerTimeAxis = false,
}: {
  axisSpec: AxisSpec;
  style: AxisStyle;
  band: AxisBand;
  scale: ScaleBand | ScaleContinuous;
  containerWidth: number;
  multilayerTimeAxis?: boolean;
}) => {
  const vertical = isVerticalAxis(axisSpec.position);

  const maxTickLabelLength = axisSpec.tickLabelMaxLength
    ? getPercentageValue(axisSpec.tickLabelMaxLength, containerWidth, 0)
    : undefined;

  let maxLineLength = style.tickLabel.limit ?? maxTickLabelLength;

  if (vertical || multilayerTimeAxis) {
    maxLineLength = Math.min(maxLineLength ?? band.labelBudget, band.labelBudget);
  } else if (isContinuousScale(scale) && scale.bandwidth > 0) {
    maxLineLength = Math.max(MIN_LABEL_LENGTH, Math.min(maxLineLength ?? band.maxExtent));
  } else {
    const categorySlotWidth = isBandScale(scale)
      ? scale.step
      : scale.bandwidth * Math.max(scale.totalBarsInCluster ?? 1, 1);
    const bandwidthCap = categorySlotWidth > 0 ? categorySlotWidth + scale.barsPadding / 2 : band.maxExtent;
    const limit = maxLineLength ?? bandwidthCap;
    maxLineLength = Math.max(MIN_LABEL_LENGTH, Math.min(limit, bandwidthCap));
  }

  const lineHeightPx = style.tickLabel.lineHeight * style.tickLabel.fontSize;
  let maxWrapLines = style.tickLabel.wrapLines;
  if (!vertical && lineHeightPx > 0 && band.labelBudget > 0) {
    const maxWrapFromBudget = Math.max(1, Math.floor(band.labelBudget / lineHeightPx));
    maxWrapLines = Math.min(style.tickLabel.wrapLines, maxWrapFromBudget);
  }

  return { maxLineLength, maxWrapLines };
};

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

  const horizontal = isHorizontalAxis(axisSpec.position);

  return (value: string) => {
    const truncate = axisStyle.tickLabel.truncate ?? axisSpec.tickLabelTruncate;

    let lines: WrapTextLines = Object.assign([], { meta: { truncated: false } });

    const measureSingleLine = measure(value, font, fontSize);

    if (measureSingleLine.width <= maxLineLength) {
      lines = Object.assign([value], { meta: { truncated: false } });
    } else if (allowWordWrap && horizontal && isCompactSingleWord(value)) {
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
