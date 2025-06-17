/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TextParts } from './text_processing';
import { getTextParts } from './text_processing';
import { DEFAULT_FONT_FAMILY } from '../../../../common/default_theme_attributes';
import type { Font } from '../../../../common/text_utils';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isNil, LayoutDirection } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import { wrapText } from '../../../../utils/text/wrap';
import type { MetricStyle } from '../../../../utils/themes/theme';
import type { MetricDatum, MetricWNumber } from '../../specs';
import { isMetricWProgress } from '../../specs';

/** @internal */
export interface HeightBasedSizes {
  iconSize: number;
  titleFontSize: number;
  subtitleFontSize: number;
  extraFontSize: number;
  valueFontSize: number;
  valuePartFontSize: number;
}

type BreakPoint = 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

type ElementVisibility = {
  titleMaxLines: number;
  subtitleMaxLines: number;
  title: boolean;
  subtitle: boolean;
  extra: boolean;
};

/** @internal */
export const PADDING = 8;

const PROGRESS_BAR_WIDTH = 10; // synced with scss variables
const PROGRESS_BAR_TARGET_WIDTH = 4;
const LINE_HEIGHT = 1.2; // aligned with our CSS
const HEIGHT_BP: [number, number, BreakPoint][] = [
  [100, 200, 'xs'],
  [200, 300, 's'],
  [300, 400, 'm'],
  [400, 500, 'l'],
  [500, 600, 'xl'],
  [600, Infinity, 'xxl'],
];
const ICON_SIZE: Record<BreakPoint, number> = { xxxs: 16, xxs: 16, xs: 16, s: 16, m: 24, l: 24, xl: 32, xxl: 42 };
const TITLE_FONT_SIZE: Record<BreakPoint, number> = { xxxs: 16, xxs: 16, xs: 16, s: 16, m: 24, l: 24, xl: 32, xxl: 42 };
const SUBTITLE_FONT_SIZE: Record<BreakPoint, number> = {
  xxxs: 14,
  xxs: 14,
  xs: 14,
  s: 14,
  m: 16,
  l: 20,
  xl: 26,
  xxl: 36,
};
const EXTRA_FONT_SIZE: Record<BreakPoint, number> = { xxxs: 14, xxs: 14, xs: 14, s: 14, m: 16, l: 20, xl: 26, xxl: 36 };
const VALUE_FONT_SIZE: Record<BreakPoint, number> = {
  xxxs: 16,
  xxs: 26,
  xs: 36,
  s: 42,
  m: 56,
  l: 72,
  xl: 104,
  xxl: 170,
};
const VALUE_FONT_SIZE_VALUES = [
  VALUE_FONT_SIZE.xl,
  VALUE_FONT_SIZE.l,
  VALUE_FONT_SIZE.m,
  VALUE_FONT_SIZE.s,
  VALUE_FONT_SIZE.xs,
  VALUE_FONT_SIZE.xxs,
  VALUE_FONT_SIZE.xxxs,
];
const VALUE_PART_FONT_RATIO = 1.3;
const TITLE_FONT: Font = {
  fontStyle: 'normal',
  fontFamily: DEFAULT_FONT_FAMILY,
  fontVariant: 'normal',
  fontWeight: 'bold',
  textColor: 'black',
};
const VALUE_FONT = TITLE_FONT;
const SUBTITLE_FONT: Font = {
  ...TITLE_FONT,
  fontWeight: 'normal',
};

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
      const fontSize = emphasis === 'small' ? Math.floor(valueFontSize / VALUE_PART_FONT_RATIO) : valueFontSize;
      return sum + textMeasure(text, VALUE_FONT, fontSize).width;
    }, 0);
    const ratio = textWidth / valueFontSize;
    return (maxWidth - iconMultiplier * PADDING) / (ratio + iconMultiplier / VALUE_PART_FONT_RATIO);
  });
  const heightConstrainedSize = valueFontSize + gapHeight;

  return Math.floor(Math.max(Math.min(heightConstrainedSize, widthConstrainedSize), minValueFontSize));
}

/** @internal */
export interface Visibility extends ElementVisibility {
  titleLines: string[];
  subtitleLines: string[];
  gapHeight: number;
}

/** @internal */
export interface MetricTextDimensions {
  heightBasedSizes: HeightBasedSizes;
  hasProgressBar: boolean;
  progressBarDirection: LayoutDirection | undefined;
  progressBarWidth: number;
  visibility: Visibility;
  textParts: TextParts[];
}

/** @internal */
export function getMetricTextPartDimensions(
  datum: MetricDatum,
  panel: Size,
  style: MetricStyle,
  locale: string,
): MetricTextDimensions {
  const heightBasedSizes = getHeightBasedFontSizes(HEIGHT_BP, panel.height, style);
  const hasProgressBar = isMetricWProgress(datum);
  const hasTarget = !isNil((datum as MetricWNumber)?.target);
  const progressBarDirection = isMetricWProgress(datum) ? datum.progressBarDirection : undefined;

  const hasHorizontalProgressBar = hasProgressBar && progressBarDirection === LayoutDirection.Horizontal;

  return {
    heightBasedSizes,
    hasProgressBar,
    progressBarDirection,
    progressBarWidth:
      hasProgressBar && progressBarDirection === LayoutDirection.Vertical
        ? PROGRESS_BAR_WIDTH + (hasTarget ? PROGRESS_BAR_TARGET_WIDTH : 0)
        : 0,
    visibility: elementVisibility(
      datum,
      panel,
      heightBasedSizes,
      locale,
      style.valueFontSize === 'fit',
      hasHorizontalProgressBar,
    ),
    textParts: getTextParts(datum, style),
  };
}

/** @internal */
function getHeightBasedFontSizes(
  ranges: [number, number, BreakPoint][],
  value: number,
  style: MetricStyle,
): HeightBasedSizes {
  const range = ranges.find(([min, max]) => min <= value && value < max);
  const size = range ? range[2] : ranges[0]?.[2] ?? 's';
  const valueFontSize = typeof style.valueFontSize === 'number' ? style.valueFontSize : VALUE_FONT_SIZE[size];
  const valuePartFontSize = Math.floor(valueFontSize / VALUE_PART_FONT_RATIO);

  return {
    iconSize: ICON_SIZE[size],
    titleFontSize: TITLE_FONT_SIZE[size],
    subtitleFontSize: SUBTITLE_FONT_SIZE[size],
    extraFontSize: EXTRA_FONT_SIZE[size],
    valueFontSize,
    valuePartFontSize,
  };
}

/** @internal */
export function getFittedFontSizes(
  fittedValueFontSize: number,
): Pick<HeightBasedSizes, 'valueFontSize' | 'valuePartFontSize'> {
  return {
    valueFontSize: fittedValueFontSize,
    valuePartFontSize: Math.floor(fittedValueFontSize / VALUE_PART_FONT_RATIO),
  };
}
/** @internal */
export function getFixedFontSizes(
  fixedFontSize: number,
): Pick<HeightBasedSizes, 'valueFontSize' | 'valuePartFontSize'> {
  return {
    valueFontSize: fixedFontSize,
    valuePartFontSize: Math.floor(fixedFontSize / VALUE_PART_FONT_RATIO),
  };
}

/** @internal */
export function getSnappedFontSizes(
  fittedValueFontSize: number,
  panelHeight: number,
  style: MetricStyle,
): Pick<HeightBasedSizes, 'valueFontSize' | 'valuePartFontSize'> {
  const sizes = getHeightBasedFontSizes(HEIGHT_BP, panelHeight, style);
  const minFontSize = Math.min(fittedValueFontSize, sizes.valueFontSize);
  const fontSize = clamp(
    VALUE_FONT_SIZE_VALUES.find((value) => value <= minFontSize) ?? minFontSize,
    VALUE_FONT_SIZE.xxxs,
    VALUE_FONT_SIZE.xxl,
  );
  return {
    valueFontSize: fontSize,
    valuePartFontSize: Math.floor(fontSize / VALUE_PART_FONT_RATIO),
  };
}

const getResponsiveBreakpoints = (title: boolean, subtitle: boolean, extra: boolean): Array<ElementVisibility> => [
  { titleMaxLines: 3, subtitleMaxLines: 2, title, subtitle, extra },
  { titleMaxLines: 3, subtitleMaxLines: 1, title, subtitle, extra },
  { titleMaxLines: 2, subtitleMaxLines: 1, title, subtitle, extra },
  { titleMaxLines: 1, subtitleMaxLines: 1, title, subtitle, extra },
  { titleMaxLines: 1, subtitleMaxLines: 0, title, subtitle: false, extra },
  { titleMaxLines: 1, subtitleMaxLines: 0, title, subtitle: false, extra: false },
  { titleMaxLines: 1, subtitleMaxLines: 0, title, subtitle: false, extra: false },
];

/** @internal */
export function elementVisibility(
  datum: MetricDatum,
  panel: Size,
  sizes: HeightBasedSizes,
  locale: string,
  fit: boolean,
  hasHorizontalProgressBar: boolean,
): ElementVisibility & {
  titleLines: string[];
  subtitleLines: string[];
  gapHeight: number;
} {
  const maxTitlesWidth = 0.95 * panel.width - (datum.icon ? 24 : 0) - 2 * PADDING;
  const titleHeight = (maxLines: number, textMeasure: TextMeasure) => {
    return datum.title
      ? PADDING +
          wrapText(datum.title, TITLE_FONT, sizes.titleFontSize, maxTitlesWidth, maxLines, textMeasure, locale).length *
            sizes.titleFontSize *
            LINE_HEIGHT
      : 0;
  };

  const subtitleHeight = (maxLines: number, textMeasure: TextMeasure) => {
    return datum.subtitle
      ? PADDING +
          wrapText(datum.subtitle, SUBTITLE_FONT, sizes.subtitleFontSize, maxTitlesWidth, maxLines, textMeasure, locale)
            .length *
            sizes.subtitleFontSize *
            LINE_HEIGHT
      : 0;
  };

  const extraHeight = sizes.extraFontSize * LINE_HEIGHT;
  const valueHeight = sizes.valueFontSize * LINE_HEIGHT;

  const responsiveBreakPoints = getResponsiveBreakpoints(!!datum.title, !!datum.subtitle, !!datum.extra);

  const getCombinedHeight = (
    { titleMaxLines, subtitleMaxLines, title, subtitle, extra }: ElementVisibility,
    measure: TextMeasure,
  ) =>
    (title && titleMaxLines > 0 ? titleHeight(titleMaxLines, measure) : 0) +
    (subtitle && subtitleMaxLines > 0 ? subtitleHeight(subtitleMaxLines, measure) : 0) +
    (extra ? extraHeight : 0) +
    valueHeight +
    PADDING +
    // Take into account when there is an horizontal progress bar
    (hasHorizontalProgressBar ? PROGRESS_BAR_WIDTH + PADDING : 0);

  /**
   * Determines if the given breakpoint should be considered "visible"
   * for the provided text measurement.
   */
  const isVisible = (ev: ElementVisibility, measure: TextMeasure) => getCombinedHeight(ev, measure) < panel.height;

  return withTextMeasure((textMeasure) => {
    let visibilityBreakpoint: ElementVisibility;

    if (fit) {
      visibilityBreakpoint = responsiveBreakPoints.at(0)!;
    } else {
      const found = responsiveBreakPoints.find((breakpoint) => isVisible(breakpoint, textMeasure));
      visibilityBreakpoint = found ?? responsiveBreakPoints.at(-1)!;
    }

    return {
      ...visibilityBreakpoint,
      gapHeight: Math.max(0, panel.height - getCombinedHeight(visibilityBreakpoint, textMeasure)),
      titleLines: wrapText(
        datum.title ?? '',
        TITLE_FONT,
        sizes.titleFontSize,
        maxTitlesWidth,
        visibilityBreakpoint.titleMaxLines,
        textMeasure,
        locale,
      ),
      subtitleLines: wrapText(
        datum.subtitle ?? '',
        SUBTITLE_FONT,
        sizes.subtitleFontSize,
        maxTitlesWidth,
        visibilityBreakpoint.subtitleMaxLines,
        textMeasure,
        locale,
      ),
    };
  });
}
