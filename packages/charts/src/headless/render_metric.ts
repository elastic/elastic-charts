/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { HeadlessRenderer } from './types';
import { BADGE_BORDER, BADGE_PADDING_BLOCK } from '../chart_types/metric/renderer/dom/badge';
import { getMetricProgressBarSize, getMetricProgressBarThickness } from '../chart_types/metric/renderer/dom/progress';
import { getSortedData, getSparkLineColor } from '../chart_types/metric/renderer/dom/sparkline';
import type { MetricTextDimensions } from '../chart_types/metric/renderer/dom/text_measurements';
import {
  getFittedFontSizes,
  getFitValueFontSize,
  getFixedFontSizes,
  getMetricTextPartDimensions,
  getSnappedFontSizes,
} from '../chart_types/metric/renderer/dom/text_measurements';
import type { MetricDatum, MetricWTrend, SecondaryMetricProps } from '../chart_types/metric/specs';
import {
  isBulletMetric,
  isMetricWNumber,
  isMetricWProgress,
  isMetricWTrend,
  isSecondaryMetricProps,
  MetricTrendShape,
} from '../chart_types/metric/specs';
import { chartSize } from '../chart_types/metric/state/selectors/chart_size';
import { getMetricSpecs } from '../chart_types/metric/state/selectors/data';
import { hasChartTitles } from '../chart_types/metric/state/selectors/has_chart_titles';
import type { ColorContrastOptions } from '../common/color_calcs';
import { combineColors, highContrastColor } from '../common/color_calcs';
import { colorToRgba, RGBATupleToString } from '../common/color_library_wrappers';
import type { Color } from '../common/colors';
import { fillTextColor } from '../common/fill_text_color';
import { extent } from '../common/math';
import type { MeterColorStop, MeterFill } from '../components/meter';
import { MeterFillStyle } from '../components/meter';
import { getMeterGeometry, getMeterScalePosition, getMeterSolidFillColor } from '../components/meter/utils';
import { areaGenerator } from '../geoms/path';
import { createPath2D } from '../renderers/canvas/path2d';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getResolvedBackgroundColorSelector } from '../state/selectors/get_resolved_background_color';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import { clamp, isFiniteNumber, isNil, LayoutDirection, renderWithProps, sortNumbers } from '../utils/common';
import { CurveType } from '../utils/curves';
import type { ContinuousDomain } from '../utils/domain';
import type { MetricStyle } from '../utils/themes/theme';

// The sizes below mirror the Metric DOM components and their SCSS (`renderer/dom/*.scss`).
const LINE_HEIGHT = 1.2;
const METER_CORNER_RADIUS = 8;
const FILL_BORDER_WIDTH = 2;
const BADGE_MIN_HEIGHT = 18;
const BADGE_PADDING_INLINE = 10;
const BADGE_ICON_MARGIN = 4;
const SECONDARY_GAP = 4;
const EMPTY_MARK = { right: 11, bottom: 9, width: 20 };
// Where the browser puts the alphabetic baseline below the middle of a line box, in em: half of
// ascender minus descender, which is (2728 - 680) / 2 / 2816 for Inter.
const BASELINE_BELOW_MIDDLE = 0.364;
const ELLIPSIS = '…';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextContrastOptions {
  text: ColorContrastOptions;
  subtitle: ColorContrastOptions;
  extra: ColorContrastOptions;
}

interface TextColors {
  highContrast: Color;
  subtitle: Color;
  extra: Color;
}

interface PanelContext {
  style: MetricStyle;
  chartBackground: Color;
  contrastOptions: TextContrastOptions;
  totalRows: number;
  totalColumns: number;
  hasTitles: boolean;
}

type Align = 'left' | 'center' | 'right';

const font = (weight: string | number, size: number, family: string) => `${weight} ${size}px ${family}`;

const getTextContrastOptions = (style: MetricStyle): TextContrastOptions => ({
  text: { lightColor: colorToRgba(style.textLightColor), darkColor: colorToRgba(style.textDarkColor) },
  subtitle: {
    lightColor: colorToRgba(style.textSubtitleLightColor),
    darkColor: colorToRgba(style.textSubtitleDarkColor),
  },
  extra: { lightColor: colorToRgba(style.textExtraLightColor), darkColor: colorToRgba(style.textExtraDarkColor) },
});

// Same as `getTextColor` in `metric.tsx`.
const getTextColor = (
  backgroundColor: Color,
  blendedColor: Color,
  hasProgressBar: boolean,
  hasTrend: boolean,
  contrastOptions: ColorContrastOptions,
): Color => {
  const highContrast = fillTextColor(
    backgroundColor,
    hasProgressBar ? backgroundColor : blendedColor,
    undefined,
    contrastOptions,
  );
  if (hasTrend) {
    const { ratio, color, shade } = fillTextColor(
      backgroundColor,
      getSparkLineColor(blendedColor),
      undefined,
      contrastOptions,
    );
    if (shade !== highContrast.shade && ratio > highContrast.ratio) return color.keyword;
  }
  return highContrast.color.keyword;
};

const roundedRect = (ctx: CanvasRenderingContext2D, { x, y, width, height }: Rect, maxRadius: number) => {
  // CSS scales radii down so that they fit the box.
  const radius = Math.max(0, Math.min(maxRadius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
};

const fillRect = (ctx: CanvasRenderingContext2D, { x, y, width, height }: Rect, color: Color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
};

const clipTo = (ctx: CanvasRenderingContext2D, { x, y, width, height }: Rect) => {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
};

const alignedX = (align: Align, { x, width }: Pick<Rect, 'x' | 'width'>, contentWidth: number) =>
  align === 'left' ? x : align === 'right' ? x + width - contentWidth : x + (width - contentWidth) / 2;

const baselineY = (top: number, lineHeight: number, fontSize: number) =>
  top + lineHeight / 2 + BASELINE_BELOW_MIDDLE * fontSize;

// Writes one line of text from `x`, in a line box of `lineHeight` whose top is at `top`.
const fillLine = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  top: number,
  lineHeight: number,
  fontSize: number,
) => {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, baselineY(top, lineHeight, fontSize));
};

// Writes one line of text aligned in `box`, like a block with `text-align`.
const fillAlignedLine = (
  ctx: CanvasRenderingContext2D,
  text: string,
  align: Align,
  box: Pick<Rect, 'x' | 'width'>,
  top: number,
  lineHeight: number,
  fontSize: number,
) => fillLine(ctx, text, alignedX(align, box, ctx.measureText(text).width), top, lineHeight, fontSize);

// Like `text-overflow: ellipsis` on one line: the longest start of `text` that fits `maxWidth` with
// an ellipsis, in the current font.
const ellipsize = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 0 && ctx.measureText(`${text.slice(0, end)}${ELLIPSIS}`).width > maxWidth) end--;
  return `${text.slice(0, end)}${ELLIPSIS}`;
};

const drawBorders = (
  ctx: CanvasRenderingContext2D,
  cell: Rect,
  borders: { right: boolean; bottom: boolean; top: boolean },
  color: Color,
) => {
  const { x, y, width, height } = cell;
  if (borders.right) fillRect(ctx, { x: x + width - 1, y, width: 1, height }, color);
  if (borders.bottom) fillRect(ctx, { x, y: y + height - 1, width, height: 1 }, color);
  if (borders.top) fillRect(ctx, { x, y, width, height: 1 }, color);
};

// The padding box of a cell: inside the borders, which take room in a border-box layout.
const insideBorders = (cell: Rect, borders: { right: boolean; bottom: boolean; top: boolean }): Rect => {
  const top = borders.top ? 1 : 0;
  return {
    x: cell.x,
    y: cell.y + top,
    width: cell.width - (borders.right ? 1 : 0),
    height: cell.height - top - (borders.bottom ? 1 : 0),
  };
};

/** Draws the area of a `MetricWTrend` over the whole panel, like `SparkLine`. */
const drawSparkline = (ctx: CanvasRenderingContext2D, box: Rect, { color, trend, trendShape }: MetricWTrend) => {
  fillRect(ctx, box, color);
  const sortedTrendData = getSortedData(trend);
  const xMin = sortedTrendData.at(0)?.x ?? NaN;
  const xMax = sortedTrendData.at(-1)?.x ?? NaN;
  const [, yMax] = extent(sortedTrendData.map((d) => d.y));
  if (!(xMax - xMin) || !yMax) return;
  // The DOM draws the area in a unit square scaled into the lower half of the panel.
  const path = areaGenerator<{ x: number; y: number }>(
    (d) => box.x + ((d.x - xMin) / (xMax - xMin)) * box.width,
    () => box.y + box.height,
    (d) => box.y + box.height * (0.5 + 0.5 * (1 - d.y / yMax)),
    (d) => isFiniteNumber(d.x) && isFiniteNumber(d.y),
    trendShape === MetricTrendShape.Bars ? CurveType.CURVE_STEP_AFTER : CurveType.LINEAR,
  ).area(sortedTrendData);
  if (!path) return;
  ctx.fillStyle = getSparkLineColor(color);
  ctx.fill(createPath2D(path));
};

const blend = (color: Color, background: Color) =>
  RGBATupleToString(combineColors(colorToRgba(color), colorToRgba(background)));

// The color stops of a gradient fill at their track positions (0 to 100), extended to both ends of
// the track, like `getMeterGradientFill`.
const getGradientStops = (domain: ContinuousDomain, colorStops: MeterColorStop[]) => {
  const stops = colorStops
    .map(({ color, stop }) => ({ color, position: clamp(getMeterScalePosition(domain, stop), 0, 100) }))
    .sort((a, b) => a.position - b.position);
  const first = stops[0];
  const last = stops.at(-1);
  if (!first || !last) return [];
  return [
    ...(first.position > 0 ? [{ color: first.color, position: 0 }] : []),
    ...stops,
    ...(last.position < 100 ? [{ color: last.color, position: 100 }] : []),
  ];
};

/**
 * The paint of the progress bar fill, like `ProgressBar` and `Meter`: the bar color, a single color,
 * the palette color at the value, or a gradient across the whole track that the fill reveals.
 */
const getProgressFillStyle = (
  ctx: CanvasRenderingContext2D,
  fill: MeterFill | undefined,
  {
    blendedBarColor,
    fillBackground,
    barBackground,
  }: { blendedBarColor: Color; fillBackground: Color; barBackground: Color },
  domain: ContinuousDomain,
  value: number,
  track: Rect,
  isVertical: boolean,
): string | CanvasGradient => {
  if (!fill) return blendedBarColor;
  if (fill.type === MeterFillStyle.Single) return blend(fill.color, fillBackground);
  // `ProgressBar` blends every stop with the background before the meter interpolates them.
  const colorStops = fill.colorStops.map((stop) => ({ ...stop, color: blend(stop.color, fillBackground) }));
  const fallback = fill.fallbackColor ? blend(fill.fallbackColor, fillBackground) : undefined;
  const solidColor = getMeterSolidFillColor(
    domain,
    colorStops,
    value,
    fallback ?? colorStops[0]?.color ?? barBackground,
  );
  const gradientStops = fill.style === MeterFillStyle.Gradient ? getGradientStops(domain, colorStops) : [];
  if (gradientStops.length === 0) return solidColor;
  // `to right` for horizontal bars, `to top` for vertical ones.
  const gradient = isVertical
    ? ctx.createLinearGradient(track.x, track.y + track.height, track.x, track.y)
    : ctx.createLinearGradient(track.x, track.y, track.x + track.width, track.y);
  gradientStops.forEach(({ color, position }) => gradient.addColorStop(position / 100, color));
  return gradient;
};

/** Draws the progress bar of a `MetricWProgress` like `ProgressBar` and `Meter` do. */
const drawProgressBar = (
  ctx: CanvasRenderingContext2D,
  box: Rect,
  datum: MetricDatum,
  {
    padding,
    thickness,
    barBackground,
    panelBackground,
    fillBackground,
    blendedBarColor,
  }: {
    padding: number;
    thickness: number;
    barBackground: Color;
    panelBackground: Color;
    fillBackground: Color;
    blendedBarColor: Color;
  },
) => {
  if (!isMetricWProgress(datum) && !isBulletMetric(datum)) return;
  const isVertical = datum.progressBarDirection === LayoutDirection.Vertical;
  const unsortedDomain: ContinuousDomain = isBulletMetric(datum)
    ? datum.domain
    : [datum.domainMin ?? 0, datum.domainMax];
  const domain = sortNumbers(unsortedDomain);
  const track: Rect = isVertical
    ? { x: box.x + padding, y: box.y + padding, width: thickness, height: box.height - 2 * padding }
    : {
        x: box.x + padding,
        y: box.y + box.height - padding - thickness,
        width: box.width - 2 * padding,
        height: thickness,
      };
  ctx.fillStyle = barBackground;
  roundedRect(ctx, track, METER_CORNER_RADIUS);
  ctx.fill();

  const { fillStart, fillEnd, fillSize, isBaselineInDomain } = getMeterGeometry(domain, datum.value, 0);
  if (!(fillSize > 0)) return;
  const fill: Rect = isVertical
    ? {
        x: track.x,
        y: track.y + track.height * (1 - fillEnd / 100),
        width: track.width,
        height: (track.height * fillSize) / 100,
      }
    : {
        x: track.x + (track.width * fillStart) / 100,
        y: track.y,
        width: (track.width * fillSize) / 100,
        height: track.height,
      };
  // The fill has a ring in the panel color (a box shadow in the DOM) that separates it from the track.
  const ringRadius = METER_CORNER_RADIUS + FILL_BORDER_WIDTH;
  ctx.fillStyle = panelBackground;
  roundedRect(
    ctx,
    {
      x: fill.x - FILL_BORDER_WIDTH,
      y: fill.y - FILL_BORDER_WIDTH,
      width: fill.width + 2 * FILL_BORDER_WIDTH,
      height: fill.height + 2 * FILL_BORDER_WIDTH,
    },
    ringRadius,
  );
  ctx.fill();
  const hasZeroBaselineMarker = isBaselineInDomain && domain[0] < 0 && domain[1] > 0;
  ctx.fillStyle = getProgressFillStyle(
    ctx,
    datum.progressBarFill,
    { blendedBarColor, fillBackground, barBackground },
    domain,
    datum.value,
    track,
    isVertical,
  );
  roundedRect(ctx, fill, hasZeroBaselineMarker ? Math.min(fill.width, fill.height) / 2 : METER_CORNER_RADIUS);
  ctx.fill();
};

/**
 * Draws an icon component that renders a plain SVG of paths (like EUI icon assets) by rendering it
 * to markup and filling its paths. Other icons are skipped.
 */
const drawIcon = (
  ctx: CanvasRenderingContext2D,
  icon: MetricDatum['icon'],
  { x, y }: { x: number; y: number },
  size: number,
  color: Color,
) => {
  if (!icon) return;
  let markup: string;
  try {
    markup = renderToStaticMarkup(renderWithProps(icon, { width: size, height: size, color }) as ReactElement);
  } catch {
    return;
  }
  const [, minX = 0, minY = 0, viewWidth = size, viewHeight = size] = (
    /viewBox="([\d.-]+)[\s,]+([\d.-]+)[\s,]+([\d.]+)[\s,]+([\d.]+)"/.exec(markup) ?? []
  ).map(Number);
  const paths = [...markup.matchAll(/<path([^>]*)>/g)];
  if (paths.length === 0 || !viewWidth || !viewHeight) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / viewWidth, size / viewHeight);
  ctx.translate(-minX, -minY);
  ctx.fillStyle = color;
  paths.forEach(([, attributes = '']) => {
    const d = / d="([^"]+)"/.exec(attributes)?.[1];
    if (d) ctx.fill(createPath2D(d), /fill-rule="evenodd"/.test(attributes) ? 'evenodd' : 'nonzero');
  });
  ctx.restore();
};

/**
 * Height and drawing of the secondary metric (`SecondaryMetric` and `Badge`): the label and the value
 * side by side with a 4px gap, shrunk to the block like the flex layout, where the label gives way
 * first and both end with an ellipsis when cut.
 */
const layoutSecondaryMetric = (
  ctx: CanvasRenderingContext2D,
  extra: SecondaryMetricProps,
  fontSize: number,
  fontFamily: string,
  badgeBorderColor: Color | undefined,
) => {
  const { value, label, badgeColor, badgeTextColor, labelPosition = 'before', icon, iconPosition = 'after' } = extra;
  const textFont = font(500, fontSize, fontFamily);
  ctx.font = textFont;
  const lineHeight = fontSize * LINE_HEIGHT;
  const inlineLabel = label && labelPosition !== 'tooltip' ? label : undefined;
  const labelWidth = inlineLabel ? ctx.measureText(inlineLabel).width : 0;
  const valueTextWidth = ctx.measureText(value).width;
  const iconWidth = icon ? ctx.measureText(icon).width + (value === '' ? 0 : BADGE_ICON_MARGIN) : 0;
  const hasBadge = !!badgeColor;
  const badgeInset = BADGE_PADDING_INLINE + BADGE_BORDER;
  const valueWidth = hasBadge ? valueTextWidth + iconWidth + 2 * badgeInset : valueTextWidth;
  const badgeHeight = Math.max(BADGE_MIN_HEIGHT, lineHeight + 2 * (BADGE_PADDING_BLOCK + BADGE_BORDER));
  const height = hasBadge ? Math.max(lineHeight, badgeHeight) : lineHeight;

  const drawBadge = (badge: Rect) => {
    if (badgeBorderColor) {
      ctx.fillStyle = badgeBorderColor;
      roundedRect(ctx, badge, badgeHeight / 2);
      ctx.fill();
    }
    ctx.fillStyle = badgeColor ?? '';
    const inner = badgeBorderColor
      ? {
          x: badge.x + BADGE_BORDER,
          y: badge.y + BADGE_BORDER,
          width: badge.width - 2 * BADGE_BORDER,
          height: badge.height - 2 * BADGE_BORDER,
        }
      : badge;
    roundedRect(ctx, inner, badgeHeight / 2);
    ctx.fill();
    // The text shrinks so that the icon keeps its room.
    const textBoxWidth = Math.max(0, badge.width - 2 * badgeInset - iconWidth);
    const textTop = badge.y + (badgeHeight - lineHeight) / 2;
    ctx.save();
    clipTo(ctx, { x: badge.x + badgeInset, y: badge.y, width: badge.width - 2 * badgeInset, height: badge.height });
    ctx.fillStyle = badgeTextColor ?? highContrastColor(colorToRgba(badgeColor ?? '')).color.keyword;
    const textX = badge.x + badgeInset + (icon && iconPosition === 'before' ? iconWidth : 0);
    fillLine(ctx, ellipsize(ctx, value, textBoxWidth), textX, textTop, lineHeight, fontSize);
    if (icon) {
      const iconX =
        iconPosition === 'before'
          ? badge.x + badgeInset
          : badge.x + badgeInset + textBoxWidth + iconWidth - ctx.measureText(icon).width;
      fillLine(ctx, icon, iconX, textTop, lineHeight, fontSize);
    }
    ctx.restore();
  };

  const draw = (span: Pick<Rect, 'x' | 'width'>, align: Align, top: number, color: Color) => {
    ctx.font = textFont;
    // The flex container is as wide as its content, at most the block. The value does not shrink
    // but is at most the container minus the gap; the label takes what is left.
    const naturalWidth = valueWidth + (inlineLabel ? labelWidth + SECONDARY_GAP : 0);
    const width = Math.min(naturalWidth, span.width);
    const valueBoxWidth = Math.max(0, Math.min(valueWidth, inlineLabel ? width - SECONDARY_GAP : width));
    const labelBoxWidth = inlineLabel ? Math.max(0, width - valueBoxWidth - SECONDARY_GAP) : 0;
    const x = alignedX(align, span, width);
    const labelFirst = labelPosition === 'before';
    const valueX = inlineLabel && labelFirst ? x + labelBoxWidth + SECONDARY_GAP : x;
    const lineTop = top + (height - lineHeight) / 2;

    ctx.save();
    clipTo(ctx, { x, y: top, width, height });
    ctx.fillStyle = color;
    if (inlineLabel) {
      // The label box clips what does not fit, even its ellipsis.
      const labelX = labelFirst ? x : valueX + valueBoxWidth + SECONDARY_GAP;
      ctx.save();
      clipTo(ctx, { x: labelX, y: top, width: labelBoxWidth, height });
      fillLine(ctx, ellipsize(ctx, inlineLabel, labelBoxWidth), labelX, lineTop, lineHeight, fontSize);
      ctx.restore();
    }
    if (hasBadge) {
      drawBadge({ x: valueX, y: top + (height - badgeHeight) / 2, width: valueBoxWidth, height: badgeHeight });
    } else {
      fillLine(ctx, ellipsize(ctx, value, valueBoxWidth), valueX, lineTop, lineHeight, fontSize);
    }
    ctx.restore();
  };

  return { height, draw };
};

// The grid placement of `MetricText`, from `text.tsx`.
const GRID_ROWS = {
  top: { value: 1, titles: 2, body: 3, extra: 4 },
  middle: { value: 3, titles: 1, body: 2, extra: 5 },
  bottom: { value: 4, titles: 1, body: 2, extra: 3 },
} as const;
// Rows that share the space left by the content-sized ones (`auto` and `1fr` tracks).
const FLEXIBLE_ROWS = { top: [3], middle: [2, 4], bottom: [2] } as const;

type Span = readonly [first: number, last: number];
const FULL: Span = [1, 3];
const getColumnSpans = (style: MetricStyle, hasIcon: boolean): { value: Span; titles: Span; extra: Span } => {
  if (!hasIcon) return { value: FULL, titles: FULL, extra: FULL };
  const { valuePosition, iconAlign } = style;
  const besideIcon: Span = iconAlign === 'left' ? [2, 3] : [1, 2];
  if (valuePosition === 'top') {
    return { value: style.valueTextAlign === 'center' ? [2, 2] : besideIcon, titles: FULL, extra: FULL };
  }
  return {
    value: FULL,
    titles: valuePosition === 'bottom' && style.titlesTextAlign === 'center' ? [2, 2] : besideIcon,
    extra: FULL,
  };
};

/** Draws one metric tile like the `Metric` DOM component. */
const drawMetricPanel = (
  ctx: CanvasRenderingContext2D,
  cell: Rect,
  datum: MetricDatum,
  textDimensions: MetricTextDimensions,
  { rowIndex, columnIndex }: { rowIndex: number; columnIndex: number },
  { style, chartBackground, contrastOptions, totalRows, totalColumns, hasTitles }: PanelContext,
) => {
  const progressDatum = isMetricWProgress(datum) || isBulletMetric(datum) ? datum : undefined;
  const hasProgressBar = progressDatum !== undefined;
  const hasTrend = isMetricWTrend(datum);
  const { heightBasedSizes: sizes, metricSpacing, visibility, textParts } = textDimensions;
  const padding = metricSpacing.panelPadding;

  const backgroundColor = datum.background ? blend(datum.background, chartBackground) : chartBackground;
  const blendingBackground = style.blendingBackground
    ? blend(style.blendingBackground, backgroundColor)
    : backgroundColor;
  const blendedColor = blend(datum.color, blendingBackground);
  const colors: TextColors = {
    highContrast: getTextColor(backgroundColor, blendedColor, hasProgressBar, hasTrend, contrastOptions.text),
    subtitle: getTextColor(backgroundColor, blendedColor, hasProgressBar, hasTrend, contrastOptions.subtitle),
    extra: getTextColor(backgroundColor, blendedColor, hasProgressBar, hasTrend, contrastOptions.extra),
  };
  const borders = {
    right: columnIndex < totalColumns - 1,
    bottom: rowIndex < totalRows - 1,
    top: hasTitles && rowIndex === 0,
  };
  const box = insideBorders(cell, borders);

  ctx.save();
  clipTo(ctx, cell);
  fillRect(ctx, cell, hasTrend || hasProgressBar ? backgroundColor : blendedColor);
  drawBorders(ctx, cell, borders, style.border);
  if (isMetricWTrend(datum)) drawSparkline(ctx, box, { ...datum, color: blendedColor });

  // The container makes room for the progress bar with its padding.
  const progressBarSize = progressDatum
    ? progressDatum.progressBarSize ?? getMetricProgressBarSize(sizes.progressBarThickness)
    : undefined;
  const thickness = getMetricProgressBarThickness(progressBarSize) ?? sizes.progressBarThickness;
  const progressBarRoom = progressDatum
    ? thickness + (isNil(progressDatum.target) ? 0 : 8) + metricSpacing.progressTextGap
    : 0;
  const isVerticalBar = progressDatum?.progressBarDirection === LayoutDirection.Vertical;
  const textBox: Rect = {
    x: box.x + (isVerticalBar ? progressBarRoom : 0),
    y: box.y,
    width: box.width - (isVerticalBar ? progressBarRoom : 0),
    height: box.height - (progressDatum && !isVerticalBar ? progressBarRoom : 0),
  };
  if (progressDatum) {
    drawProgressBar(ctx, box, progressDatum, {
      padding,
      thickness,
      barBackground: style.barBackground,
      panelBackground: backgroundColor,
      fillBackground: blendingBackground,
      blendedBarColor: blendedColor,
    });
  }

  // `MetricText`: a grid inside the panel padding.
  const inner: Rect = {
    x: textBox.x + padding,
    y: textBox.y + padding,
    width: textBox.width - 2 * padding,
    height: textBox.height - 2 * padding,
  };
  const hasIcon = !!datum.icon;
  const iconColumnWidth = sizes.iconSize + padding;
  const columnEdges = hasIcon
    ? [inner.x, inner.x + iconColumnWidth, inner.x + inner.width - iconColumnWidth, inner.x + inner.width]
    : [inner.x, inner.x, inner.x + inner.width, inner.x + inner.width];
  const spanRect = ([first, last]: Span) => ({
    x: columnEdges[first - 1] ?? inner.x,
    width: (columnEdges[last] ?? inner.x) - (columnEdges[first - 1] ?? inner.x),
  });
  const spans = getColumnSpans(style, hasIcon);

  // Titles block.
  const titleLineHeight = sizes.titleFontSize * LINE_HEIGHT;
  const subtitleLineHeight = sizes.subtitleFontSize * LINE_HEIGHT;
  const titleLines = visibility.title ? visibility.titleLines : [];
  const subtitleLines = visibility.subtitle ? visibility.subtitleLines : [];
  const titlesHeight =
    titleLines.length * titleLineHeight +
    (subtitleLines.length > 0 ? metricSpacing.titleSubtitleGap + subtitleLines.length * subtitleLineHeight : 0);

  // Extra block.
  const extra = visibility.extra && isSecondaryMetricProps(datum.extra) ? datum.extra : undefined;
  const badgeBorder = extra?.badgeBorderColor;
  const secondary = extra
    ? layoutSecondaryMetric(
        ctx,
        extra,
        sizes.extraFontSize,
        style.fontFamily,
        badgeBorder?.mode === 'custom' ? badgeBorder.color : undefined,
      )
    : undefined;
  const extraPaddingTop = style.valuePosition === 'middle' ? 0 : metricSpacing.extraPaddingTop;
  const extraHeight = extraPaddingTop + (secondary?.height ?? 0);

  // Value block.
  const valueLineHeight = sizes.valueFontSize * LINE_HEIGHT;
  const valueMarginTop = style.valuePosition === 'bottom' && visibility.extra ? metricSpacing.primaryAdjacentGap : 0;
  const valueMarginBottom = style.valuePosition === 'top' && visibility.title ? metricSpacing.primaryAdjacentGap : 0;
  const valueHeight = valueMarginTop + valueLineHeight + valueMarginBottom;

  const rows = GRID_ROWS[style.valuePosition];
  const rowHeights = new Map<number, number>([
    [rows.titles, titlesHeight],
    [rows.extra, extraHeight],
    [rows.value, valueHeight],
  ]);
  // The icon sits in the first row.
  if (hasIcon) rowHeights.set(1, Math.max(rowHeights.get(1) ?? 0, sizes.iconSize));
  const rowCount = style.valuePosition === 'middle' ? 5 : 4;
  const flexibleRows: readonly number[] = FLEXIBLE_ROWS[style.valuePosition];
  const fixedHeight = [...rowHeights.entries()].reduce(
    (sum, [row, height]) => sum + (flexibleRows.includes(row) ? 0 : height),
    0,
  );
  const flexibleHeight = Math.max(0, inner.height - fixedHeight) / flexibleRows.length;
  const rowTops: number[] = [];
  let rowTop = inner.y;
  for (let row = 1; row <= rowCount; row++) {
    rowTops[row] = rowTop;
    rowTop += flexibleRows.includes(row) ? flexibleHeight : rowHeights.get(row) ?? 0;
  }

  ctx.save();
  clipTo(ctx, inner);

  if (hasIcon) {
    const iconX = style.iconAlign === 'left' ? inner.x : inner.x + inner.width - sizes.iconSize;
    drawIcon(ctx, datum.icon, { x: iconX, y: inner.y }, sizes.iconSize, colors.highContrast);
  }

  // Titles: the title (bold by theme) and the subtitle, each aligned in its block.
  const titlesSpan = spanRect(spans.titles);
  let lineTop = rowTops[rows.titles] ?? inner.y;
  ctx.font = font(style.titleWeight, sizes.titleFontSize, style.fontFamily);
  ctx.fillStyle = colors.highContrast;
  titleLines.forEach((line) => {
    fillAlignedLine(ctx, line, style.titlesTextAlign, titlesSpan, lineTop, titleLineHeight, sizes.titleFontSize);
    lineTop += titleLineHeight;
  });
  if (subtitleLines.length > 0) {
    lineTop += metricSpacing.titleSubtitleGap;
    ctx.font = font('normal', sizes.subtitleFontSize, style.fontFamily);
    ctx.fillStyle = colors.subtitle;
    subtitleLines.forEach((line) => {
      fillAlignedLine(
        ctx,
        line,
        style.titlesTextAlign,
        titlesSpan,
        lineTop,
        subtitleLineHeight,
        sizes.subtitleFontSize,
      );
      lineTop += subtitleLineHeight;
    });
  }

  // Secondary metric.
  if (secondary) {
    const extraSpan = spanRect(spans.extra);
    const extraTop = (rowTops[rows.extra] ?? inner.y) + extraPaddingTop;
    secondary.draw(extraSpan, style.extraTextAlign, extraTop, colors.extra);
  }

  // Value: digits at the value font size, other characters (units, suffixes) smaller, on one baseline.
  const valueSpan = spanRect(spans.value);
  const partFont = (emphasis: string) =>
    font(500, emphasis === 'small' ? sizes.valuePartFontSize : sizes.valueFontSize, style.fontFamily);
  const partWidths = textParts.map(({ text, emphasis }) => {
    ctx.font = partFont(emphasis);
    return ctx.measureText(text).width;
  });
  const valueWidth = partWidths.reduce((sum, width) => sum + width, 0);
  // A value wider than its block starts at the left and is cut on the right, like the
  // `overflow: hidden` paragraph; text values end with an ellipsis there.
  const isOverflowing = valueWidth > valueSpan.width;
  const valueAlign: Align = isOverflowing ? 'left' : style.valueTextAlign;
  const valueTop = (rowTops[rows.value] ?? inner.y) + valueMarginTop;
  ctx.save();
  clipTo(ctx, { x: valueSpan.x, y: valueTop, width: valueSpan.width, height: valueLineHeight });
  ctx.fillStyle = datum.valueColor ?? colors.highContrast;
  if (isOverflowing && !isMetricWNumber(datum)) {
    ctx.font = partFont('normal');
    const text = ellipsize(ctx, textParts.map(({ text: part }) => part).join(''), valueSpan.width);
    fillLine(ctx, text, valueSpan.x, valueTop, valueLineHeight, sizes.valueFontSize);
  } else {
    let valueX = alignedX(valueAlign, valueSpan, valueWidth);
    textParts.forEach(({ text, emphasis }, index) => {
      ctx.font = partFont(emphasis);
      fillLine(ctx, text, valueX, valueTop, valueLineHeight, sizes.valueFontSize);
      valueX += partWidths[index] ?? 0;
    });
  }
  ctx.restore();

  ctx.restore();
  ctx.restore();
};

/** Draws a cell without a metric: a blank panel, with a short line when it pads a row (`echMetricEmpty`). */
const drawEmptyPanel = (
  ctx: CanvasRenderingContext2D,
  cell: Rect,
  { rowIndex, columnIndex, isPadding }: { rowIndex: number; columnIndex: number; isPadding: boolean },
  { style, chartBackground, contrastOptions, totalRows, totalColumns, hasTitles }: PanelContext,
) => {
  const backgroundRGBA = combineColors(colorToRgba(style.emptyBackground), colorToRgba(chartBackground));
  const borders = {
    right: isPadding && columnIndex < totalColumns - 1,
    bottom: rowIndex < totalRows - 1,
    top: hasTitles && rowIndex === 0,
  };
  fillRect(ctx, cell, RGBATupleToString(backgroundRGBA));
  drawBorders(ctx, cell, borders, style.border);
  if (!isPadding) return;
  const box = insideBorders(cell, borders);
  const markColor = highContrastColor(backgroundRGBA, undefined, contrastOptions.text).color.keyword;
  fillRect(
    ctx,
    {
      x: box.x + box.width - EMPTY_MARK.right - EMPTY_MARK.width,
      y: box.y + box.height - EMPTY_MARK.bottom - 1,
      width: EMPTY_MARK.width,
      height: 1,
    },
    markColor,
  );
};

/**
 * Draws the Metric chart, whose browser version is DOM: a grid of tiles with titles, values,
 * secondary metrics, progress bars and trend areas, laid out like the DOM components.
 * @internal
 */
export const renderMetricChart: HeadlessRenderer = (ctx, state) => {
  const [spec] = getMetricSpecs(state);
  const { width, height } = chartSize(state);
  if (!spec || width === 0 || height === 0) return;
  const { metric: style } = getChartThemeSelector(state);
  const { locale } = getSettingsSpecSelector(state);
  const { data } = spec;
  const totalRows = data.length;
  const totalColumns = data.reduce((acc, row) => Math.max(acc, row.length), 0);
  if (totalRows === 0 || totalColumns === 0) return;

  // Rows are at least `minHeight` tall (`minmax(minHeight, 1fr)`); the browser scrolls the rest.
  const panel = { width: width / totalColumns, height: height / totalRows };
  const rowHeight = Math.max(style.minHeight, panel.height);
  const context: PanelContext = {
    style,
    chartBackground: getResolvedBackgroundColorSelector(state),
    contrastOptions: getTextContrastOptions(style),
    totalRows,
    totalColumns,
    hasTitles: hasChartTitles(state),
  };

  // Like the `Metric` component: fit the value of each tile, then use the smallest size for all.
  let fittedValueFontSize = Number.MAX_SAFE_INTEGER;
  const tiles = data.map((columns) =>
    columns.map((datum) => {
      if (!datum) return undefined;
      const textDimensions = getMetricTextPartDimensions(datum, panel, style, locale);
      const totalWidth = panel.width - textDimensions.progressBarWidth - textDimensions.iconGridColumnWidth;
      const valueFontSize = getFitValueFontSize(
        textDimensions.heightBasedSizes.valueFontSize,
        totalWidth,
        textDimensions.visibility.availableHeightWithoutValue,
        textDimensions.textParts,
        style.minValueFontSize,
        datum.valueIcon !== undefined,
        style.valueFontSize === 'fit',
        textDimensions.metricSpacing.panelPadding,
        style.fontFamily,
      );
      fittedValueFontSize = Math.min(fittedValueFontSize, valueFontSize);
      return { datum, textDimensions };
    }),
  );
  const { valueFontSize, valuePartFontSize } =
    typeof style.valueFontSize === 'number'
      ? getFixedFontSizes(style.valueFontSize)
      : style.valueFontSize === 'default'
        ? getSnappedFontSizes(fittedValueFontSize, panel.height, style)
        : getFittedFontSizes(fittedValueFontSize);

  tiles.forEach((columns, rowIndex) => {
    for (let columnIndex = 0; columnIndex < totalColumns; columnIndex++) {
      const cell: Rect = {
        x: columnIndex * panel.width,
        y: rowIndex * rowHeight,
        width: panel.width,
        height: rowHeight,
      };
      const tile = columns[columnIndex];
      if (!tile) {
        drawEmptyPanel(ctx, cell, { rowIndex, columnIndex, isPadding: columnIndex < columns.length }, context);
        continue;
      }
      const { datum, textDimensions } = tile;
      const sizes = { ...textDimensions.heightBasedSizes, valueFontSize, valuePartFontSize };
      drawMetricPanel(
        ctx,
        cell,
        datum,
        { ...textDimensions, heightBasedSizes: sizes },
        { rowIndex, columnIndex },
        context,
      );
    }
  });
};
