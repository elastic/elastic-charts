/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  PADDING,
  VALUE_PART_FONT_RATIO,
  VALUE_FONT,
  HEIGHT_BP,
  PROGRESS_BAR_WIDTH,
  PROGRESS_BAR_TARGET_WIDTH,
  elementVisibility,
  BreakPoint,
  EXTRA_FONT_SIZE,
  ICON_SIZE,
  SUBTITLE_FONT_SIZE,
  TITLE_FONT_SIZE,
  VALUE_FONT_SIZE,
  VALUE_PART_FONT_SIZE,
} from './text';
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
