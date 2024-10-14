/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { VALUE_FONT, elementVisibility } from './text';
import { getTextParts, TextParts } from './text_processing';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { isNil, LayoutDirection } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { MetricStyle } from '../../../../utils/themes/theme';
import { MetricDatum, isMetricWProgress, MetricWNumber } from '../../specs';

/** @internal */
export interface Sizes {
  iconSize: number;
  titleFontSize: number;
  subtitleFontSize: number;
  extraFontSize: number;
  valueFontSize: number;
  valuePartFontSize: number;
}

type BreakPoint = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
/**
 * synced with scss variables
 *
 */
const PROGRESS_BAR_WIDTH = 10;

const PROGRESS_BAR_TARGET_WIDTH = 4;

const HEIGHT_BP: [number, number, BreakPoint][] = [
  [0, 200, 'xs'],
  [200, 300, 's'],
  [300, 400, 'm'],
  [400, 500, 'l'],
  [500, 600, 'xl'],
  [600, Infinity, 'xxl'],
];
/** @internal */
export const PADDING = 8;
/** @internal */
export const LINE_HEIGHT = 1.2; // aligned with our CSS

const ICON_SIZE: Record<BreakPoint, number> = { xs: 16, s: 16, m: 24, l: 24, xl: 32, xxl: 42 };
const TITLE_FONT_SIZE: Record<BreakPoint, number> = { xs: 16, s: 16, m: 24, l: 24, xl: 32, xxl: 42 };
const SUBTITLE_FONT_SIZE: Record<BreakPoint, number> = { xs: 14, s: 14, m: 16, l: 20, xl: 26, xxl: 36 };
const EXTRA_FONT_SIZE: Record<BreakPoint, number> = { xs: 14, s: 14, m: 16, l: 20, xl: 26, xxl: 36 };
const VALUE_FONT_SIZE: Record<BreakPoint, number> = { xs: 36, s: 36, m: 56, l: 72, xl: 104, xxl: 170 };
const VALUE_PART_FONT_SIZE: Record<BreakPoint, number> = { xs: 24, s: 24, m: 42, l: 56, xl: 80, xxl: 130 };
/** @internal */
export const VALUE_PART_FONT_RATIO = 1.3;

/**
 * Approximate font size to fit given available space
 * @internal
 */
export function getFitValueFontSize(
  valueFontSize: number,
  width: number,
  gapHeight: number,
  textParts: TextParts[],
  minValueFontSize: number,
  hasIcon: boolean,
): number {
  const maxWidth = (width - 2 * PADDING) * 0.98; // small buffer to prevent clipping
  const widthConstrainedSize = withTextMeasure((textMeasure) => {
    const iconMultiplier = hasIcon ? 1 : 0;
    const textWidth = textParts.reduce((sum, { text, emphasis }) => {
      const fontSize = emphasis === 'small' ? valueFontSize / VALUE_PART_FONT_RATIO : valueFontSize;
      return sum + textMeasure(text, VALUE_FONT, fontSize).width;
    }, 0);
    const ratio = textWidth / valueFontSize;
    return (maxWidth - iconMultiplier * PADDING) / (ratio + iconMultiplier / VALUE_PART_FONT_RATIO);
  });
  const heightConstrainedSize = valueFontSize + gapHeight;

  return Math.max(Math.min(heightConstrainedSize, widthConstrainedSize), minValueFontSize);
}

/** @internal */
export function getMetricTextPartDimensions(datum: MetricDatum, panel: Size, style: MetricStyle, locale: string) {
  const sizes = getFontSizes(HEIGHT_BP, panel.height, style);
  const hasProgressBar = isMetricWProgress(datum);
  const hasTarget = !isNil((datum as MetricWNumber)?.target);
  const progressBarDirection = isMetricWProgress(datum) ? datum.progressBarDirection : undefined;

  return {
    sizes,
    hasProgressBar,
    progressBarDirection,
    progressBarWidth:
      hasProgressBar && progressBarDirection === LayoutDirection.Vertical
        ? PROGRESS_BAR_WIDTH + (hasTarget ? PROGRESS_BAR_TARGET_WIDTH : 0)
        : 0,
    visibility: elementVisibility(datum, panel, sizes, locale, style.valueFontSize === 'fit'),
    textParts: getTextParts(datum, style),
  };
}

/** @internal */
function getFontSizes(ranges: [number, number, BreakPoint][], value: number, style: MetricStyle): Sizes {
  const range = ranges.find(([min, max]) => min <= value && value < max);
  const size = range ? range[2] : ranges[0]?.[2] ?? 's';
  const valueFontSize = typeof style.valueFontSize === 'number' ? style.valueFontSize : VALUE_FONT_SIZE[size];
  const valuePartFontSize =
    typeof style.valueFontSize === 'number'
      ? Math.ceil(valueFontSize / VALUE_PART_FONT_RATIO)
      : VALUE_PART_FONT_SIZE[size];

  return {
    iconSize: ICON_SIZE[size],
    titleFontSize: TITLE_FONT_SIZE[size],
    subtitleFontSize: SUBTITLE_FONT_SIZE[size],
    extraFontSize: EXTRA_FONT_SIZE[size],
    valueFontSize,
    valuePartFontSize,
  };
}
