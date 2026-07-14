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

const SAFE_LABEL_MAX_LENGTH = 1_000;

/**
 * Default number of lines for wrapped tick labels. `1` disables wrapping.
 * @internal
 */
export const DEFAULT_TICK_LABEL_WRAP_LINES = 1;

/**
 * Default line height multiplier applied to `fontSize` for wrapped tick labels.
 * @internal
 */
export const DEFAULT_TICK_LABEL_LINE_HEIGHT = 1.2;

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

const MIN_LABEL_LENGTH = 12;

// Max length (in characters) of a single-word label that is shouldn't be wrapped.
const SHORT_WORD_MAX_LENGTH = 10;

// Configuration for readable truncation of tick labels, defaults to 4 visible characters and 3 hidden characters.
// This is to avoid over truncating the label that would be too short to be readable. In those cases, it's best
// to let the label overflow instead, and visible ticks later will be able to cull the overflowed labels.
const readableTickLabelOptions = {
  min: {
    visible: 4,
    hidden: 3,
  },
  overflow: true,
};

const isCompactSingleWord = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= SHORT_WORD_MAX_LENGTH && !/\s/.test(trimmed);
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
 * At 0 this is equal to along. As the label rotates, a longer line fits along the axis until, at 90, the axis cross size becomes the limit.
 */
const resolveRotatedBandCap = (along: number, cross: number, rotationDeg: number, lineHeightPx: number): number => {
  const rad = degToRad(Math.abs(rotationDeg));
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const alongLimit = cos > 0 ? (along - lineHeightPx * sin) / cos : Infinity;
  const crossLimit = sin > 0 ? (cross - lineHeightPx * cos) / sin : Infinity;
  const width = Math.min(alongLimit, crossLimit);
  return Number.isFinite(width) ? width : along;
};

/**
 * Resolves the tick label constraints (wrap lines and max line length) for the given axis.
 * In band scales, scale.step caps the max line length on horizontal axes, adjusted for label
 * rotation. Otherwise, the max line length is capped by the axis label budget.
 *  @internal */
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

  // A `%` tick label length resolves against the axis' own reference size:
  // - vertical axes use the cross-axis container size (`band.container`), matching `maxExtent`.
  // - horizontal axes use the along-axis size (`containerWidth`, i.e. the chart/plot width).
  // Using `band.container` for vertical axes keeps the percentage stable across layout passes, where
  // `containerWidth` is the shrinking plot width rather than the full container width.
  const percentReference = vertical ? band.container : containerWidth;
  const maxTickLabelLength = axisSpec.tickLabelMaxLength
    ? getPercentageValue(axisSpec.tickLabelMaxLength, percentReference, 0)
    : undefined;

  const minLineLength = style.tickLabel.minLength ?? MIN_LABEL_LENGTH;
  const wrapLines = style.tickLabel.wrapLines ?? DEFAULT_TICK_LABEL_WRAP_LINES;
  const lineHeight = style.tickLabel.lineHeight ?? DEFAULT_TICK_LABEL_LINE_HEIGHT;
  const lineHeightPx = lineHeight * style.tickLabel.fontSize;

  let maxLineLength = style.tickLabel.maxLength ?? maxTickLabelLength;

  if (vertical || multilayerTimeAxis) {
    maxLineLength = Math.max(minLineLength, Math.min(maxLineLength ?? band.labelBudget, band.labelBudget));
  } else if (isContinuousScale(scale) && scale.bandwidth > 0) {
    maxLineLength = Math.max(minLineLength, maxLineLength ?? band.maxExtent);
  } else {
    const categorySlotWidth = isBandScale(scale) ? scale.step * (1 - scale.barsPadding / 2) : 0;
    // Band scales rotate the step slot so angled labels aren't over-wrapped, non-band horizontal
    // scales keep the axis-extent fallback.
    const bandwidthCap =
      categorySlotWidth > 0
        ? resolveRotatedBandCap(categorySlotWidth, band.labelBudget, style.tickLabel.rotation, lineHeightPx)
        : band.maxExtent;
    maxLineLength = Math.max(minLineLength, maxLineLength ?? bandwidthCap);
  }

  let maxWrapLines = wrapLines;

  if (!vertical && lineHeightPx > 0 && band.labelBudget > 0) {
    const maxWrapFromBudget = Math.max(1, Math.floor(band.labelBudget / lineHeightPx));
    maxWrapLines = Math.min(wrapLines, maxWrapFromBudget);
  }
  // in vertical axis with band Y scale, we could also cap the wrap lines by scale.step, but less obvious if helpful.

  return { maxLineLength, maxWrapLines: Math.max(1, maxWrapLines) };
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
  const { fontSize, fontStyle, fontFamily, rotation } = axisStyle.tickLabel;
  const lineHeight = axisStyle.tickLabel.lineHeight ?? DEFAULT_TICK_LABEL_LINE_HEIGHT;

  const font: Font = {
    fontStyle: fontStyle ?? 'normal',
    fontFamily,
    fontWeight: 'normal',
    fontVariant: 'normal',
    textColor: 'black',
  };

  const horizontal = isHorizontalAxis(axisSpec.position);

  return (raw: string) => {
    const value = raw.slice(0, SAFE_LABEL_MAX_LENGTH);
    // Truncation is opt-in; when unset the label overflows instead of being cut.
    const truncate = axisStyle.tickLabel.truncate ?? axisSpec.tickLabelTruncate ?? false;

    let lines: WrapTextLines = Object.assign([], { meta: { truncated: false } });

    const measureSingleLine = measure(value, font, fontSize);

    if (measureSingleLine.width <= maxLineLength) {
      lines = Object.assign([value], { meta: { truncated: false } });
    } else if (allowWordWrap && horizontal && isCompactSingleWord(value)) {
      lines = Object.assign([value], { meta: { truncated: false } });
    } else if (!allowWordWrap) {
      if (truncate) {
        const { text } = fitText(measure, value, maxLineLength, fontSize, font, truncate, readableTickLabelOptions);
        lines = Object.assign([text], { meta: { truncated: text !== value } });
      } else {
        lines = Object.assign([value], { meta: { truncated: false } });
      }
    } else {
      lines = wrapText(
        value,
        font,
        fontSize,
        maxLineLength,
        maxLines,
        measure,
        locale,
        'word',
        truncate,
        readableTickLabelOptions,
      );
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
