/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BADGE_BORDER } from './badge';
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

type BreakPoint = 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

type ResponsiveBreakpoints = {
  /** Maximum number of lines allowed for the title text before truncation */
  titleMaxLines: number;
  /** Maximum number of lines allowed for the subtitle text before truncation */
  subtitleMaxLines: number;
  /** Whether the title element should be visible at this breakpoint (if it exists) */
  title: boolean;
  /** Whether the subtitle element should be visible at this breakpoint (if it exists) */
  subtitle: boolean;
  /** Whether the extra element (e.g., description, badge) should be visible at this breakpoint (if it exists) */
  extra: boolean;
};

/** @internal */
export interface HeightBasedSizes {
  iconSize: number;
  titleFontSize: number;
  subtitleFontSize: number;
  extraFontSize: number;
  valueFontSize: number;
  valuePartFontSize: number;
  progressBarThickness: number;
}

/** @internal */
export interface LayoutResult extends ResponsiveBreakpoints {
  /** The actual wrapped lines of title text that will be rendered */
  titleLines: string[];
  /** The actual wrapped lines of subtitle text that will be rendered */
  subtitleLines: string[];
  gapHeight: number;
  availableHeightWithoutValue: number;
}

/** @internal */
export interface MetricTextDimensions {
  heightBasedSizes: HeightBasedSizes;
  hasProgressBar: boolean;
  progressBarDirection: LayoutDirection | undefined;
  /**
   * This only applies when there is a progress bar and is vertical.
   * We have added the padding into the calculation
   */
  progressBarWidth: number;
  visibility: LayoutResult;
  textParts: TextParts[];
  /**
   * This only applies when there is an icon and the value postition is top.
   * We have added the padding into the calculation
   */
  iconGridColumnWidth: number;
}

/** @internal */
export const PADDING = 8;
/** @internal */
export const PROGRESS_BAR_TARGET_SIZE = 8; // Aligned with our CSS in _index.scss
const LINE_HEIGHT = 1.2; // Aligned with our CSS
const HEIGHT_BP: [number, number, BreakPoint][] = [
  [0, 100, 'xxxs'],
  [100, 150, 'xxs'],
  [150, 200, 'xs'],
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
const PROGRESS_BAR_THICKNESS: Record<BreakPoint, number> = { xxxs: 4, xxs: 4, xs: 8, s: 8, m: 8, l: 8, xl: 8, xxl: 16 };

/**
 * Approximate font size to fit given available space
 * @internal
 */
export function getFitValueFontSize(
  initialValueFontSize: number,
  totalWidth: number,
  availableHeight: number,
  textParts: TextParts[],
  minValueFontSize: number,
  hasIcon: boolean,
) {
  const maxWidth = (totalWidth - 2 * PADDING) * 0.98; // Buffer to prevent clipping
  const widthConstrainedSize = withTextMeasure((textMeasure) => {
    const iconMultiplier = hasIcon ? 1 : 0;
    const textWidth = textParts.reduce((sum, { text, emphasis }) => {
      const fontSize =
        emphasis === 'small' ? Math.floor(initialValueFontSize / VALUE_PART_FONT_RATIO) : initialValueFontSize;
      return sum + textMeasure(text, VALUE_FONT, fontSize).width;
    }, 0);
    const ratio = textWidth / initialValueFontSize;
    return (maxWidth - iconMultiplier * PADDING) / (ratio + iconMultiplier / VALUE_PART_FONT_RATIO);
  });

  const maxHeight = (availableHeight - 2 * PADDING) * 0.98; // Buffer to prevent clipping
  const heightConstrainedSize = Math.floor(maxHeight / LINE_HEIGHT);

  return Math.floor(Math.max(Math.min(widthConstrainedSize, heightConstrainedSize), minValueFontSize));
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

  const hasVerticalProgressBar = hasProgressBar && progressBarDirection === LayoutDirection.Vertical;
  const hasHorizontalProgressBar = hasProgressBar && progressBarDirection === LayoutDirection.Horizontal;

  const { progressBarThickness, iconSize } = heightBasedSizes;

  const progressBarTotalSpace = progressBarThickness + (hasTarget ? PROGRESS_BAR_TARGET_SIZE : 0) + PADDING;
  const progressBarWidth = hasVerticalProgressBar ? progressBarTotalSpace : 0;
  const progressBarHeight = hasHorizontalProgressBar ? progressBarTotalSpace : 0;

  const isIconVisible = !!datum.icon && style.valuePosition === 'top';
  // The width of the icon column, including padding
  const iconColumnWidth = iconSize + PADDING;
  // If the value is center-aligned and the icon is visible, add an extra column width for visual centering
  const needsCenterSpacer = isIconVisible && style.valueTextAlign === 'center';
  const iconGridColumnWidth = isIconVisible ? iconColumnWidth * (needsCenterSpacer ? 2 : 1) : 0;

  return {
    heightBasedSizes,
    hasProgressBar,
    progressBarDirection,
    progressBarWidth,
    visibility: getLayoutResult(
      datum,
      panel,
      heightBasedSizes,
      locale,
      style.valueFontSize === 'fit',
      progressBarHeight,
    ),
    textParts: getTextParts(datum, style),
    iconGridColumnWidth,
  };
}

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
    progressBarThickness: PROGRESS_BAR_THICKNESS[size],
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

const getResponsiveBreakpoints = (title: boolean, subtitle: boolean, extra: boolean): Array<ResponsiveBreakpoints> => [
  { titleMaxLines: 3, subtitleMaxLines: 2, title, subtitle, extra },
  { titleMaxLines: 3, subtitleMaxLines: 1, title, subtitle, extra },
  { titleMaxLines: 2, subtitleMaxLines: 1, title, subtitle, extra },
  { titleMaxLines: 1, subtitleMaxLines: 1, title, subtitle, extra },
  { titleMaxLines: 1, subtitleMaxLines: 0, title, subtitle: false, extra },
  { titleMaxLines: 1, subtitleMaxLines: 0, title, subtitle: false, extra: false },
  { titleMaxLines: 1, subtitleMaxLines: 0, title, subtitle: false, extra: false },
];

function getLayoutResult(
  datum: MetricDatum,
  panel: Size,
  sizes: HeightBasedSizes,
  locale: string,
  fit: boolean,
  progressBarHeight: number,
): LayoutResult {
  const maxTitlesWidth = 0.95 * panel.width - (datum.icon ? 24 : 0) - 2 * PADDING;

  const titleLineHeight = sizes.titleFontSize * LINE_HEIGHT;
  const subtitleLineHeight = sizes.subtitleFontSize * LINE_HEIGHT;

  // If there is a badge, we add the padding to the extra height
  const hasBadge = !!(datum?.extra && 'badgeColor' in datum?.extra && datum?.extra?.badgeColor);
  const badgeHeight = hasBadge ? BADGE_BORDER * 2 : 0;
  // We assume that the extra element is taking one line
  const extraHeight = sizes.extraFontSize * LINE_HEIGHT + badgeHeight;
  const valueHeight = sizes.valueFontSize * LINE_HEIGHT;

  const responsiveBreakPoints = getResponsiveBreakpoints(!!datum.title, !!datum.subtitle, !!datum.extra);

  function getTextLayoutInfo(breakpoints: ResponsiveBreakpoints, measure: TextMeasure) {
    const titleLines = datum.title
      ? wrapText(
          datum.title,
          TITLE_FONT,
          sizes.titleFontSize,
          maxTitlesWidth,
          breakpoints.titleMaxLines,
          measure,
          locale,
        )
      : [];

    const subtitleLines = datum.subtitle
      ? wrapText(
          datum.subtitle,
          SUBTITLE_FONT,
          sizes.subtitleFontSize,
          maxTitlesWidth,
          breakpoints.subtitleMaxLines,
          measure,
          locale,
        )
      : [];

    const actualTitleHeight = titleLines.length > 0 ? titleLines.length * titleLineHeight + PADDING : 0;
    const actualSubtitleHeight = subtitleLines.length > 0 ? subtitleLines.length * subtitleLineHeight + PADDING : 0;
    const actualExtraHeight = breakpoints.extra ? extraHeight : 0;

    const progressBarTotalHeight = progressBarHeight > 0 ? progressBarHeight + PADDING : 0;
    const nonValueElementsHeight =
      actualTitleHeight + actualSubtitleHeight + actualExtraHeight + progressBarTotalHeight;
    const totalHeight = nonValueElementsHeight + valueHeight;

    return {
      titleLines,
      subtitleLines,
      actualTitleHeight,
      actualSubtitleHeight,
      actualExtraHeight,
      nonValueElementsHeight,
      totalHeight,
    };
  }

  /** Determines if the given breakpoint should be considered "visible" for the provided text measurement */
  const isVisible = (breakpoints: ResponsiveBreakpoints, measure: TextMeasure) => {
    const { totalHeight } = getTextLayoutInfo(breakpoints, measure);
    return totalHeight < panel.height;
  };

  return withTextMeasure((textMeasure) => {
    let visibilityBreakpoint: ResponsiveBreakpoints;

    if (fit) {
      visibilityBreakpoint = responsiveBreakPoints.at(0)!;
    } else {
      const found = responsiveBreakPoints.find((breakpoint) => isVisible(breakpoint, textMeasure));
      visibilityBreakpoint = found ?? responsiveBreakPoints.at(-1)!;
    }

    const layoutInfo = getTextLayoutInfo(visibilityBreakpoint, textMeasure);

    const availableHeightWithoutValue = Math.max(0, panel.height - layoutInfo.nonValueElementsHeight);
    const gapHeight = Math.max(0, panel.height - layoutInfo.totalHeight);

    return {
      ...visibilityBreakpoint,
      titleLines: layoutInfo.titleLines,
      subtitleLines: layoutInfo.subtitleLines,
      gapHeight,
      availableHeightWithoutValue,
    };
  });
}
