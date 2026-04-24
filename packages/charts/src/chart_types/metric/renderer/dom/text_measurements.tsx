/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { BADGE_BORDER, BADGE_PADDING_BLOCK } from './badge';
import type { TextParts } from './text_processing';
import { getTextParts } from './text_processing';
import { DEFAULT_FONT_FAMILY } from '../../../../common/default_theme_attributes';
import type { Font } from '../../../../common/text_utils';
import type { TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { clamp, isNil, LayoutDirection } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import { wrapText } from '../../../../utils/text/wrap';
import type { MetricSpacing, MetricStyle } from '../../../../utils/themes/theme';
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
export interface MetricTextLayout extends ResponsiveBreakpoints {
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
  metricSpacing: MetricSpacingLayout;
  hasProgressBar: boolean;
  progressBarDirection: LayoutDirection | undefined;
  /**
   * This only applies when there is a progress bar and is vertical.
   * We have added the padding into the calculation
   */
  progressBarWidth: number;
  visibility: MetricTextLayout;
  textParts: TextParts[];
  /**
   * This only applies when there is an icon and the value postition is top.
   * We have added the padding into the calculation
   */
  iconGridColumnWidth: number;
}

/** @internal */
export const PROGRESS_BAR_TARGET_SIZE = 8; // Aligned with our CSS in _index.scss
const LINE_HEIGHT = 1.2; // Aligned with our CSS
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
const VALUE_PART_FONT_RATIO = 1.3;
const BASE_TEXT_FONT: Font = {
  fontStyle: 'normal',
  fontFamily: DEFAULT_FONT_FAMILY,
  fontVariant: 'normal',
  fontWeight: 'normal',
  textColor: 'black',
};
const PROGRESS_BAR_THICKNESS: Record<BreakPoint, number> = { xxxs: 4, xxs: 4, xs: 4, s: 4, m: 8, l: 8, xl: 8, xxl: 16 };
const DEFAULT_PANEL_PADDING = 8; // Aligned with our CSS in _variables.scss
const DEFAULT_TITLE_SUBTITLE_GAP = 5; // Aligned with our CSS in _text.scss
const DEFAULT_EXTRA_PADDING_TOP = 5; // Aligned with our CSS in _text.scss
const DEFAULT_PRIMARY_ADJACENT_GAP = 0;
const LARGE_TITLE_SUBTITLE_GAP = 8;
const LARGE_PRIMARY_ADJACENT_GAP = 4;
const LARGE_PRIMARY_FONT_MULTIPLIER = 1.5;
const LARGE_SECONDARY_FONT_MULTIPLIER = 1.75;
const LARGE_PANEL_PADDING: Record<BreakPoint, number> = {
  xxxs: 16,
  xxs: 16,
  xs: 16,
  s: 24,
  m: 24,
  l: 32,
  xl: 40,
  xxl: 48,
};

/** @internal */
export interface MetricSpacingLayout {
  panelPadding: number;
  titleSubtitleGap: number;
  extraPaddingTop: number;
  primaryAdjacentGap: number;
  progressTextGap: number;
}

function scaleForLargeMetric(size: number, multiplier: number): number {
  return Math.round(size * multiplier);
}

function getMetricSpacingMode(style: MetricStyle): MetricSpacing {
  return style.spacing ?? 'small';
}

function getHeightBreakpoint(ranges: [number, number, BreakPoint][], value: number): BreakPoint {
  const range = ranges.find(([min, max]) => min <= value && value < max);
  return range ? range[2] : ranges[0]?.[2] ?? 's';
}

function getValueFontSizeMap(spacingMode: MetricSpacing): Record<BreakPoint, number> {
  if (spacingMode === 'small') {
    return VALUE_FONT_SIZE;
  }
  return Object.entries(VALUE_FONT_SIZE).reduce(
    (acc, [breakpoint, size]) => ({
      ...acc,
      [breakpoint]: scaleForLargeMetric(size, LARGE_PRIMARY_FONT_MULTIPLIER),
    }),
    {} as Record<BreakPoint, number>,
  );
}

function getValueFontSizeSteps(spacingMode: MetricSpacing): number[] {
  const valueFontSizeMap = getValueFontSizeMap(spacingMode);
  return [
    valueFontSizeMap.xl,
    valueFontSizeMap.l,
    valueFontSizeMap.m,
    valueFontSizeMap.s,
    valueFontSizeMap.xs,
    valueFontSizeMap.xxs,
    valueFontSizeMap.xxxs,
  ];
}

function getMetricSpacingLayout(breakPoint: BreakPoint, style: MetricStyle): MetricSpacingLayout {
  if (getMetricSpacingMode(style) === 'small') {
    return {
      panelPadding: DEFAULT_PANEL_PADDING,
      titleSubtitleGap: DEFAULT_TITLE_SUBTITLE_GAP,
      extraPaddingTop: style.valuePosition === 'middle' ? 0 : DEFAULT_EXTRA_PADDING_TOP,
      primaryAdjacentGap: DEFAULT_PRIMARY_ADJACENT_GAP,
      progressTextGap: DEFAULT_PANEL_PADDING,
    };
  }

  const panelPadding = LARGE_PANEL_PADDING[breakPoint];
  return {
    panelPadding,
    titleSubtitleGap: LARGE_TITLE_SUBTITLE_GAP,
    extraPaddingTop: 0,
    primaryAdjacentGap: LARGE_PRIMARY_ADJACENT_GAP,
    progressTextGap: panelPadding,
  };
}

function getMetricFont(fontFamily: string, fontWeight: Font['fontWeight']): Font {
  return {
    ...BASE_TEXT_FONT,
    fontFamily,
    fontWeight,
  };
}

/**
 * Approximate font size to fit given available space
 * @internal
 */
export function getFitValueFontSize(
  initialValueFontSize: number, // fixed size based on panel height
  totalWidth: number,
  availableHeight: number,
  textParts: TextParts[],
  minValueFontSize: number,
  hasIcon: boolean,
  isFitMode: boolean,
  panelPadding: number,
  fontFamily = DEFAULT_FONT_FAMILY,
) {
  const maxWidth = (totalWidth - 2 * panelPadding) * 0.98; // Buffer to prevent clipping
  const maxHeight = (availableHeight - 2 * panelPadding) * 0.98;

  const widthConstrainedSize = withTextMeasure((textMeasure) => {
    const iconMultiplier = hasIcon ? 1 : 0;
    const valueFont = getMetricFont(fontFamily, 'bold');
    const textWidth = textParts.reduce((sum, { text, emphasis }) => {
      const fontSize =
        emphasis === 'small' ? Math.floor(initialValueFontSize / VALUE_PART_FONT_RATIO) : initialValueFontSize;
      return sum + textMeasure(text, valueFont, fontSize).width;
    }, 0);
    const ratio = textWidth / initialValueFontSize;
    return (maxWidth - iconMultiplier * panelPadding) / (ratio + iconMultiplier / VALUE_PART_FONT_RATIO);
  });

  let constrainedSize;

  if (isFitMode) {
    // In fit mode: apply both width and height constraints
    const heightConstrainedSize = Math.floor(maxHeight / LINE_HEIGHT);
    constrainedSize = Math.min(widthConstrainedSize, heightConstrainedSize);
  } else {
    // In default mode: only apply width constraint
    constrainedSize = Math.min(initialValueFontSize, widthConstrainedSize);
  }

  return Math.floor(Math.max(constrainedSize, minValueFontSize));
}

/** @internal */
export function getMetricTextPartDimensions(
  datum: MetricDatum,
  panel: Size,
  style: MetricStyle,
  locale: string,
): MetricTextDimensions {
  const breakPoint = getHeightBreakpoint(HEIGHT_BP, panel.height);
  const metricSpacing = getMetricSpacingLayout(breakPoint, style);
  const heightBasedSizes = getHeightBasedFontSizes(HEIGHT_BP, panel.height, style);
  const hasProgressBar = isMetricWProgress(datum);
  const hasTarget = !isNil((datum as MetricWNumber)?.target);
  const progressBarDirection = isMetricWProgress(datum) ? datum.progressBarDirection : undefined;

  const hasVerticalProgressBar = hasProgressBar && progressBarDirection === LayoutDirection.Vertical;
  const hasHorizontalProgressBar = hasProgressBar && progressBarDirection === LayoutDirection.Horizontal;

  const { progressBarThickness, iconSize } = heightBasedSizes;

  const progressBarTotalSpace =
    progressBarThickness + (hasTarget ? PROGRESS_BAR_TARGET_SIZE : 0) + metricSpacing.progressTextGap;
  const progressBarWidth = hasVerticalProgressBar ? progressBarTotalSpace : 0;
  const progressBarHeight = hasHorizontalProgressBar ? progressBarTotalSpace : 0;

  const isIconVisible = !!datum.icon && style.valuePosition === 'top';
  // The width of the icon column, including padding
  const iconColumnWidth = iconSize + metricSpacing.panelPadding;
  // If the value is center-aligned and the icon is visible, add an extra column width for visual centering
  const needsCenterSpacer = isIconVisible && style.valueTextAlign === 'center';
  const iconGridColumnWidth = isIconVisible ? iconColumnWidth * (needsCenterSpacer ? 2 : 1) : 0;

  return {
    heightBasedSizes,
    metricSpacing,
    hasProgressBar,
    progressBarDirection,
    progressBarWidth,
    visibility: computeMetricTextLayout(
      datum,
      panel,
      heightBasedSizes,
      locale,
      style.valueFontSize === 'fit',
      progressBarHeight,
      metricSpacing,
      style.fontFamily,
      style.valuePosition,
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
  const size = getHeightBreakpoint(ranges, value);
  const spacingMode = getMetricSpacingMode(style);
  const valueFontSizeMap = getValueFontSizeMap(spacingMode);
  const valueFontSize = typeof style.valueFontSize === 'number' ? style.valueFontSize : valueFontSizeMap[size];
  const valuePartFontSize = Math.floor(valueFontSize / VALUE_PART_FONT_RATIO);
  const extraFontSize =
    spacingMode === 'small'
      ? EXTRA_FONT_SIZE[size]
      : scaleForLargeMetric(EXTRA_FONT_SIZE[size], LARGE_SECONDARY_FONT_MULTIPLIER);

  return {
    iconSize: ICON_SIZE[size],
    titleFontSize: TITLE_FONT_SIZE[size],
    subtitleFontSize: SUBTITLE_FONT_SIZE[size],
    extraFontSize,
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
  const spacingMode = getMetricSpacingMode(style);
  const valueFontSizes = getValueFontSizeSteps(spacingMode);
  const valueFontSizeMap = getValueFontSizeMap(spacingMode);
  const sizes = getHeightBasedFontSizes(HEIGHT_BP, panelHeight, style);
  const minFontSize = Math.min(fittedValueFontSize, sizes.valueFontSize);
  const fontSize = clamp(
    valueFontSizes.find((value) => value <= minFontSize) ?? minFontSize,
    valueFontSizeMap.xxxs,
    valueFontSizeMap.xxl,
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

function computeMetricTextLayout(
  datum: MetricDatum,
  panel: Size,
  sizes: HeightBasedSizes,
  locale: string,
  fit: boolean,
  progressBarHeight: number, // with padding
  metricSpacing: MetricSpacingLayout,
  fontFamily: string,
  valuePosition: MetricStyle['valuePosition'],
): MetricTextLayout {
  const { panelPadding, titleSubtitleGap, extraPaddingTop, primaryAdjacentGap } = metricSpacing;
  const maxTitlesWidth = 0.95 * panel.width - (datum.icon ? 24 : 0) - 2 * panelPadding;
  const titleFont = getMetricFont(fontFamily, 'bold');
  const subtitleFont = getMetricFont(fontFamily, 'normal');

  const titleLineHeight = sizes.titleFontSize * LINE_HEIGHT;
  const subtitleLineHeight = sizes.subtitleFontSize * LINE_HEIGHT;

  // If there is a badge, we add the padding to the extra height
  const hasBadge = !!(datum?.extra && 'badgeColor' in datum?.extra && datum?.extra?.badgeColor);
  const badgeHeight = hasBadge ? (BADGE_BORDER + BADGE_PADDING_BLOCK) * 2 : 0;
  // We assume that the extra element is taking one line
  const extraHeight = sizes.extraFontSize * LINE_HEIGHT + badgeHeight;
  const valueHeight = sizes.valueFontSize * LINE_HEIGHT;

  const responsiveBreakPoints = getResponsiveBreakpoints(!!datum.title, !!datum.subtitle, !!datum.extra);

  function computeMetricTextSize(breakpoints: ResponsiveBreakpoints, measure: TextMeasure) {
    const titleLines = datum.title
      ? wrapText(
          datum.title,
          titleFont,
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
          subtitleFont,
          sizes.subtitleFontSize,
          maxTitlesWidth,
          breakpoints.subtitleMaxLines,
          measure,
          locale,
        )
      : [];

    const actualTitleHeight = titleLines.length > 0 ? titleLines.length * titleLineHeight : 0;
    const actualSubtitleHeight =
      subtitleLines.length > 0 ? subtitleLines.length * subtitleLineHeight + titleSubtitleGap : 0;
    const actualExtraHeight = breakpoints.extra ? extraHeight + extraPaddingTop : 0;
    const primaryToTitleGap = valuePosition === 'top' && titleLines.length > 0 ? primaryAdjacentGap : 0;
    const primaryToSecondaryGap = valuePosition === 'bottom' && breakpoints.extra ? primaryAdjacentGap : 0;

    const nonValueElementsHeight =
      actualTitleHeight +
      actualSubtitleHeight +
      actualExtraHeight +
      primaryToTitleGap +
      primaryToSecondaryGap +
      progressBarHeight +
      panelPadding * 2;
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
    const { totalHeight } = computeMetricTextSize(breakpoints, measure);
    return totalHeight <= panel.height;
  };

  return withTextMeasure((textMeasure) => {
    let visibilityBreakpoint: ResponsiveBreakpoints;

    if (fit) {
      visibilityBreakpoint = responsiveBreakPoints.at(0)!;
    } else {
      const found = responsiveBreakPoints.find((breakpoint) => isVisible(breakpoint, textMeasure));
      visibilityBreakpoint = found ?? responsiveBreakPoints.at(-1)!;
    }

    const layoutInfo = computeMetricTextSize(visibilityBreakpoint, textMeasure);

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
