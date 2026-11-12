/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
/* eslint-disable react/no-array-index-key */

import { scaleLinear } from 'd3-scale';
import type { ReactNode } from 'react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ChartType } from '../chart_types';
import { getTextContrastOptions } from '../chart_types/metric/renderer/dom';
import { BADGE_BORDER, BADGE_PADDING_BLOCK } from '../chart_types/metric/renderer/dom/badge';
import { getMetricPanelColors } from '../chart_types/metric/renderer/dom/metric';
import { getMetricProgressBarSize, getMetricProgressBarThickness } from '../chart_types/metric/renderer/dom/progress';
import { getSortedData, getSparkLineColor } from '../chart_types/metric/renderer/dom/sparkline';
import type { MetricTextDimensions } from '../chart_types/metric/renderer/dom/text_measurements';
import {
  getFitValueFontSize,
  getFittedFontSizes,
  getFixedFontSizes,
  getMetricTextPartDimensions,
  getSnappedFontSizes,
  PROGRESS_BAR_TARGET_SIZE,
} from '../chart_types/metric/renderer/dom/text_measurements';
import type { MetricDatum } from '../chart_types/metric/specs';
import { isBulletMetric, isMetricWProgress, isMetricWTrend, isSecondaryMetricProps } from '../chart_types/metric/specs';
import { chartSize } from '../chart_types/metric/state/selectors/chart_size';
import { getMetricSpecs } from '../chart_types/metric/state/selectors/data';
import { hasChartTitles } from '../chart_types/metric/state/selectors/has_chart_titles';
import { combineColors, highContrastColor } from '../common/color_calcs';
import { colorToRgba, RGBATupleToString } from '../common/color_library_wrappers';
import type { Color } from '../common/colors';
import { extent } from '../common/math';
import { cssFontShorthand } from '../common/text_utils';
import type { Font } from '../common/text_utils';
import { MeterFillStyle, MeterSize } from '../components/meter';
import { areaGenerator } from '../geoms/path';
import { getMeasureContext } from '../renderers/svg/measure';
import { fontAttributes } from '../renderers/svg/text';
import type { GlobalChartState } from '../state/chart_state';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getResolvedBackgroundColorSelector } from '../state/selectors/get_resolved_background_color';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import { clamp, isFiniteNumber, isNil, LayoutDirection, renderWithProps } from '../utils/common';
import { CurveType } from '../utils/curves';
import type { MetricStyle } from '../utils/themes/theme';

/** the `line-height` of the metric text */
const LINE_HEIGHT = 1.2;
const SECONDARY_METRIC_GAP = 4;
const BADGE_PADDING_INLINE = 10;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Align = 'left' | 'center' | 'right';

type Measure = (text: string, font: string) => number;

const font = (fontFamily: string, fontWeight: Font['fontWeight'], fontSize: number) =>
  cssFontShorthand({ fontFamily, fontWeight, fontStyle: 'normal', fontVariant: 'normal' }, fontSize);

/** where CSS puts the alphabetic baseline of a line box: half the leading above the font's ascent */
function baselineInLine(top: number, fontString: string, fontSize: number): number {
  const ctx = getMeasureContext();
  let ascent = fontSize * 0.8;
  let descent = fontSize * 0.2;
  if (ctx) {
    ctx.save();
    ctx.font = fontString;
    ctx.textBaseline = 'alphabetic';
    const metrics = ctx.measureText('M');
    ctx.restore();
    ascent = metrics.fontBoundingBoxAscent ?? ascent;
    descent = metrics.fontBoundingBoxDescent ?? descent;
  }
  return top + (fontSize * LINE_HEIGHT - ascent - descent) / 2 + ascent;
}

const anchorX = ({ x, width }: Box, align: Align) =>
  align === 'left' ? x : align === 'center' ? x + width / 2 : x + width;
const textAnchor = (align: Align) => (align === 'left' ? 'start' : align === 'center' ? 'middle' : 'end');

function textLine(content: string, x: number, y: number, fontString: string, color: Color, align: Align) {
  return (
    <text
      x={x}
      y={y}
      {...(align !== 'left' && { textAnchor: textAnchor(align) })}
      {...fontAttributes(fontString)}
      fill={color}
      xmlSpace="preserve"
    >
      {content}
    </text>
  );
}

interface TextRun {
  text: string;
  bold: boolean;
}

const decodeEntities = (text: string) =>
  text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&');

/** the text of a React node as runs of regular and bold text, for content drawn as SVG text */
function textRuns(node: ReactNode): TextRun[] {
  const runs: TextRun[] = [];
  let boldDepth = 0;
  for (const [, closing, boldTag, text] of renderToStaticMarkup(<>{node}</>).matchAll(
    /<(\/?)(b|strong)?\b[^>]*>|([^<]+)/g,
  )) {
    if (text !== undefined) runs.push({ text: decodeEntities(text), bold: boldDepth > 0 });
    else if (boldTag) boldDepth += closing ? -1 : 1;
  }
  return runs;
}

/** the markup of the first `<svg>` a React node renders, wherever it is nested */
function svgMarkup(node: ReactNode): string | undefined {
  const markup = renderToStaticMarkup(<>{node}</>);
  const start = markup.indexOf('<svg');
  const end = markup.lastIndexOf('</svg>');
  return start === -1 || end === -1 ? undefined : markup.slice(start, end + '</svg>'.length);
}

/**
 * The metric chart as SVG elements: the panels laid out like the HTML metric, with the same font sizes,
 * wrapped titles, spacing and colors, as each would render once settled (no hover).
 * @internal
 */
export function getSvgMetric(state: GlobalChartState, measureWidth: Measure): ReactNode {
  if (state.chartType !== ChartType.Metric) return null;
  const [spec] = getMetricSpecs(state);
  const { width, height } = chartSize(state);
  if (!spec || width === 0 || height === 0) return null;

  const { metric: style } = getChartThemeSelector(state);
  const backgroundColor = getResolvedBackgroundColorSelector(state);
  const { locale } = getSettingsSpecSelector(state);
  const hasTitles = hasChartTitles(state);
  const { data } = spec;
  const totalRows = data.length;
  const maxColumns = data.reduce((acc, row) => Math.max(acc, row.length), 0);
  const panel = { width: width / maxColumns, height: height / totalRows };
  const contrastOptions = getTextContrastOptions(style);

  const metrics = data.flatMap((columns, rowIndex) =>
    columns.flatMap((datum, columnIndex) => {
      if (!datum) return [];
      const textDimensions = getMetricTextPartDimensions(datum, panel, style, locale);
      const fittedValueFontSize = getFitValueFontSize(
        textDimensions.heightBasedSizes.valueFontSize,
        panel.width - textDimensions.progressBarWidth - textDimensions.iconGridColumnWidth,
        textDimensions.visibility.availableHeightWithoutValue,
        textDimensions.textParts,
        style.minValueFontSize,
        datum.valueIcon !== undefined,
        style.valueFontSize === 'fit',
        textDimensions.metricSpacing.panelPadding,
        style.fontFamily,
      );
      return [{ datum, rowIndex, columnIndex, textDimensions, fittedValueFontSize }];
    }),
  );
  const fitted = Math.min(Number.MAX_SAFE_INTEGER, ...metrics.map((m) => m.fittedValueFontSize));
  const { valueFontSize, valuePartFontSize } =
    typeof style.valueFontSize === 'number'
      ? getFixedFontSizes(style.valueFontSize)
      : style.valueFontSize === 'default'
        ? getSnappedFontSizes(fitted, panel.height, style)
        : getFittedFontSizes(fitted);
  metrics.forEach(({ textDimensions }) => {
    textDimensions.heightBasedSizes.valueFontSize = valueFontSize;
    textDimensions.heightBasedSizes.valuePartFontSize = valuePartFontSize;
  });

  const emptyBackgroundRGBA = combineColors(colorToRgba(style.emptyBackground), colorToRgba(backgroundColor));
  const emptyForeground = highContrastColor(emptyBackgroundRGBA, undefined, contrastOptions.text).color.keyword;
  const borders = (rowIndex: number, columnIndex: number, box: Box, withRight: boolean) => (
    <>
      {withRight && columnIndex < maxColumns - 1 && (
        <rect x={box.x + box.width - 1} y={box.y} width={1} height={box.height} fill={style.border} />
      )}
      {rowIndex < totalRows - 1 && (
        <rect x={box.x} y={box.y + box.height - 1} width={box.width} height={1} fill={style.border} />
      )}
      {hasTitles && rowIndex === 0 && <rect x={box.x} y={box.y} width={box.width} height={1} fill={style.border} />}
    </>
  );

  const panels = data.flatMap((columns, rowIndex) =>
    Array.from({ length: maxColumns }, (_, columnIndex) => {
      const box = { x: columnIndex * panel.width, y: rowIndex * panel.height, ...panel };
      const metric = metrics.find((m) => m.rowIndex === rowIndex && m.columnIndex === columnIndex);
      const key = `${rowIndex}-${columnIndex}`;
      if (!metric) {
        // an empty panel before the data of a row shows a dash, one after it nothing
        const leftEmpty = columnIndex < columns.length;
        return (
          <g key={key}>
            <rect {...box} fill={RGBATupleToString(emptyBackgroundRGBA)} />
            {leftEmpty && (
              <rect
                x={box.x + box.width - 11 - 20}
                y={box.y + box.height - 9 - 1}
                width={20}
                height={1}
                fill={emptyForeground}
              />
            )}
            {borders(rowIndex, columnIndex, box, leftEmpty)}
          </g>
        );
      }
      return (
        <g key={key}>
          {metricPanel(metric.datum, metric.textDimensions, box, style, backgroundColor, contrastOptions, measureWidth)}
          {borders(rowIndex, columnIndex, box, true)}
        </g>
      );
    }),
  );

  return <g className="echMetricContainer">{panels}</g>;
}

function metricPanel(
  datum: MetricDatum,
  { heightBasedSizes: sizes, metricSpacing, visibility, textParts }: MetricTextDimensions,
  box: Box,
  style: MetricStyle,
  chartBackgroundColor: Color,
  contrastOptions: ReturnType<typeof getTextContrastOptions>,
  measureWidth: Measure,
): ReactNode {
  const colors = getMetricPanelColors(datum, style, chartBackgroundColor, contrastOptions);
  const progressDatum = isMetricWProgress(datum) || isBulletMetric(datum) ? datum : undefined;
  const progressBarSize = progressDatum
    ? progressDatum.progressBarSize ?? getMetricProgressBarSize(sizes.progressBarThickness)
    : MeterSize.Small;
  const thickness = getMetricProgressBarThickness(progressBarSize) ?? 4;
  const vertical = progressDatum?.progressBarDirection === LayoutDirection.Vertical;
  const pad = metricSpacing.panelPadding;

  // the panel padding the progress bar takes, then the padding of the text
  const barSpace = progressDatum
    ? thickness +
      (isNil((datum as { target?: number }).target) ? 0 : PROGRESS_BAR_TARGET_SIZE) +
      metricSpacing.progressTextGap
    : 0;
  const inner: Box = {
    x: box.x + pad + (vertical ? barSpace : 0),
    y: box.y + pad,
    width: box.width - 2 * pad - (vertical ? barSpace : 0),
    height: box.height - 2 * pad - (progressDatum && !vertical ? barSpace : 0),
  };

  const titleFont = font(style.fontFamily, style.titleWeight, sizes.titleFontSize);
  const subtitleFont = font(style.fontFamily, 'normal', sizes.subtitleFontSize);
  const extraFont = font(style.fontFamily, 'normal', sizes.extraFontSize);
  const valueFont = font(style.fontFamily, 500, sizes.valueFontSize);
  const partFont = font(style.fontFamily, 500, sizes.valuePartFontSize);

  const titleLines = visibility.title ? visibility.titleLines : [];
  const subtitleLines = visibility.subtitle ? visibility.subtitleLines : [];
  const titlesHeight =
    titleLines.length * sizes.titleFontSize * LINE_HEIGHT +
    (subtitleLines.length > 0
      ? metricSpacing.titleSubtitleGap + subtitleLines.length * sizes.subtitleFontSize * LINE_HEIGHT
      : 0);
  const extraContent = visibility.extra ? extraRuns(datum) : undefined;
  const extraHeight = metricSpacing.extraPaddingTop + (extraContent ? sizes.extraFontSize * LINE_HEIGHT : 0);
  const valueHeight = sizes.valueFontSize * LINE_HEIGHT;

  let titlesTop: number;
  let valueTop: number;
  const extraTop = inner.y + inner.height - extraHeight;
  if (style.valuePosition === 'top') {
    valueTop = inner.y;
    titlesTop = valueTop + valueHeight + (visibility.title ? metricSpacing.primaryAdjacentGap : 0);
  } else if (style.valuePosition === 'middle') {
    titlesTop = inner.y;
    valueTop = titlesTop + titlesHeight + (inner.height - titlesHeight - valueHeight - extraHeight) / 2;
  } else {
    titlesTop = inner.y;
    valueTop = inner.y + inner.height - valueHeight;
  }
  const extraBlockTop =
    style.valuePosition === 'bottom'
      ? valueTop - (visibility.extra ? metricSpacing.primaryAdjacentGap : 0) - extraHeight
      : extraTop;

  // an icon takes a column on its side, beside the titles or beside a top value
  const iconColumn = datum.icon ? sizes.iconSize + pad : 0;
  const iconLeft = style.iconAlign === 'left';
  const besideIcon = (row: Box): Box =>
    iconColumn ? { ...row, x: iconLeft ? row.x + iconColumn : row.x, width: row.width - iconColumn } : row;
  const titlesBox = style.valuePosition === 'top' ? inner : besideIcon(inner);
  const valueBox = style.valuePosition === 'top' ? besideIcon(inner) : inner;

  const titles: ReactNode[] = [];
  let lineTop = titlesTop;
  titleLines.forEach((line, i) => {
    const y = baselineInLine(lineTop, titleFont, sizes.titleFontSize);
    titles.push(
      <g key={`t${i}`}>
        {textLine(
          line,
          anchorX(titlesBox, style.titlesTextAlign),
          y,
          titleFont,
          colors.textColors.highContrast,
          style.titlesTextAlign,
        )}
      </g>,
    );
    lineTop += sizes.titleFontSize * LINE_HEIGHT;
  });
  if (subtitleLines.length > 0) lineTop += metricSpacing.titleSubtitleGap;
  subtitleLines.forEach((line, i) => {
    const y = baselineInLine(lineTop, subtitleFont, sizes.subtitleFontSize);
    titles.push(
      <g key={`s${i}`}>
        {textLine(
          line,
          anchorX(titlesBox, style.titlesTextAlign),
          y,
          subtitleFont,
          colors.textColors.subtitle,
          style.titlesTextAlign,
        )}
      </g>,
    );
    lineTop += sizes.subtitleFontSize * LINE_HEIGHT;
  });

  // the value parts share the baseline of the value line, the small ones at their own size
  const partWidths = textParts.map(({ text, emphasis }) =>
    measureWidth(text, emphasis === 'small' ? partFont : valueFont),
  );
  const valueWidth = partWidths.reduce((sum, w) => sum + w, 0);
  const valueAlign = style.valueTextAlign;
  let partX =
    valueAlign === 'left'
      ? valueBox.x
      : valueAlign === 'center'
        ? valueBox.x + (valueBox.width - valueWidth) / 2
        : valueBox.x + valueBox.width - valueWidth;
  const valueBaseline = baselineInLine(valueTop, valueFont, sizes.valueFontSize);
  const valueColor = datum.valueColor ?? colors.textColors.highContrast;
  const value = textParts.map(({ text, emphasis }, i) => {
    const node = (
      <g key={`v${i}`}>
        {textLine(text, partX, valueBaseline, emphasis === 'small' ? partFont : valueFont, valueColor, 'left')}
      </g>
    );
    partX += partWidths[i] ?? 0;
    return node;
  });

  const extraRow = {
    ...inner,
    y: extraBlockTop + metricSpacing.extraPaddingTop,
    height: sizes.extraFontSize * LINE_HEIGHT,
  };
  const extra =
    extraContent &&
    (isSecondaryMetricProps(datum.extra) ? (
      <g>
        {secondaryMetric(
          datum.extra,
          extraRow,
          style.extraTextAlign,
          extraFont,
          sizes.extraFontSize,
          colors.textColors.extra,
          measureWidth,
        )}
      </g>
    ) : (
      <g>
        {runsLine(
          extraContent,
          extraRow,
          style.extraTextAlign,
          style.fontFamily,
          sizes.extraFontSize,
          colors.textColors.extra,
          measureWidth,
        )}
      </g>
    ));

  return (
    <>
      <rect {...box} fill={colors.panelColor} />
      {isMetricWTrend(datum) && sparkline(datum.trend, datum.trendShape, colors.blendedInteractionColor, box)}
      {progressDatum && progressBar(progressDatum, style, colors, box, pad, thickness, vertical)}
      {datum.icon && icon(datum.icon, sizes.iconSize, colors.textColors.highContrast, inner, iconColumn, iconLeft)}
      {titles}
      {extra}
      {value}
    </>
  );
}

function extraRuns({ extra }: MetricDatum): TextRun[] | undefined {
  if (isSecondaryMetricProps(extra)) return [{ text: extra.value, bold: false }];
  if (React.isValidElement(extra) || typeof extra === 'function') {
    const runs = textRuns(renderWithProps(extra, { fontSize: 0, color: '' }));
    return runs.length > 0 ? runs : undefined;
  }
  return undefined;
}

/** runs of regular and bold text on one line, aligned as a whole */
function runsLine(
  runs: TextRun[],
  row: Box,
  align: Align,
  fontFamily: string,
  fontSize: number,
  color: Color,
  measureWidth: Measure,
): ReactNode {
  const fonts = runs.map(({ bold }) => font(fontFamily, bold ? 'bold' : 'normal', fontSize));
  const widths = runs.map(({ text }, i) => measureWidth(text, fonts[i] ?? ''));
  const total = widths.reduce((sum, w) => sum + w, 0);
  let x = align === 'left' ? row.x : align === 'center' ? row.x + (row.width - total) / 2 : row.x + row.width - total;
  const baseline = baselineInLine(row.y, fonts[0] ?? '', fontSize);
  return runs.map(({ text }, i) => {
    const node = <g key={i}>{textLine(text, x, baseline, fonts[i] ?? '', color, 'left')}</g>;
    x += widths[i] ?? 0;
    return node;
  });
}

/** a secondary metric: its label and its value, the value on a pill shaped badge when it has a color */
function secondaryMetric(
  props: Extract<MetricDatum['extra'], { value: string }>,
  row: Box,
  align: Align,
  fontString: string,
  fontSize: number,
  color: Color,
  measureWidth: Measure,
): ReactNode {
  const content = props.value;
  const label = props.label && props.labelPosition !== 'tooltip' ? props.label : '';
  const labelAfter = props.labelPosition === 'after';
  const badge = props.badgeColor;
  const valueWidth = measureWidth(content, fontString) + (badge ? 2 * (BADGE_PADDING_INLINE + BADGE_BORDER) : 0);
  const labelWidth = label ? measureWidth(label, fontString) + SECONDARY_METRIC_GAP : 0;
  const total = valueWidth + labelWidth;
  const left =
    align === 'left' ? row.x : align === 'center' ? row.x + (row.width - total) / 2 : row.x + row.width - total;
  const baseline = baselineInLine(row.y, fontString, fontSize);
  const valueX = labelAfter ? left : left + labelWidth;
  const labelX = labelAfter ? left + valueWidth + SECONDARY_METRIC_GAP : left;
  const badgeHeight = Math.max(18, fontSize * LINE_HEIGHT + 2 * (BADGE_PADDING_BLOCK + BADGE_BORDER));
  const badgeTextColor = badge ? props.badgeTextColor ?? highContrastColor(colorToRgba(badge)).color.keyword : color;
  return (
    <>
      {label && textLine(label, labelX, baseline, fontString, color, 'left')}
      {badge && (
        <rect
          x={valueX}
          y={row.y + (row.height - badgeHeight) / 2}
          width={valueWidth}
          height={badgeHeight}
          rx={badgeHeight / 2}
          fill={badge}
        />
      )}
      {textLine(
        content,
        badge ? valueX + BADGE_PADDING_INLINE + BADGE_BORDER : valueX,
        baseline,
        fontString,
        badgeTextColor,
        'left',
      )}
    </>
  );
}

function sparkline(
  trend: Parameters<typeof getSortedData>[0],
  trendShape: string | undefined,
  color: Color,
  box: Box,
): ReactNode {
  const data = getSortedData(trend);
  const xMin = data.at(0)?.x ?? Number.NaN;
  const xMax = data.at(-1)?.x ?? Number.NaN;
  const [, yMax] = extent(data.map((d) => d.y));
  const path =
    xMax - xMin && yMax
      ? areaGenerator<{ x: number; y: number }>(
          (d) => (d.x - xMin) / (xMax - xMin),
          () => 1,
          (d) => 1 - d.y / yMax,
          (d) => isFiniteNumber(d.x) && isFiniteNumber(d.y),
          trendShape === 'bars' ? CurveType.CURVE_STEP_AFTER : CurveType.LINEAR,
        ).area(data)
      : undefined;
  return (
    <svg {...box} viewBox="0 0 1 1" preserveAspectRatio="none">
      <rect x={0} y={0} width={1} height={1} fill={color} />
      {path && <path d={path} transform="translate(0, 0.5),scale(1,0.5)" fill={getSparkLineColor(color)} />}
    </svg>
  );
}

/** the meter track along an edge of the panel, filled up to the value from the domain start */
function progressBar(
  datum: NonNullable<ReturnType<typeof asProgressDatum>>,
  style: MetricStyle,
  colors: ReturnType<typeof getMetricPanelColors>,
  box: Box,
  pad: number,
  thickness: number,
  vertical: boolean,
): ReactNode {
  const domain = isBulletMetric(datum) ? datum.domain : [datum.domainMin ?? 0, datum.domainMax];
  const scale = scaleLinear().domain(domain).range([0, 1]);
  if (isBulletMetric(datum) && datum.niceDomain) scale.nice();
  const ratio = clamp(scale(datum.value), 0, 1);
  const fill = datum.progressBarFill;
  const fillColor =
    fill?.type === MeterFillStyle.Single
      ? RGBATupleToString(combineColors(colorToRgba(fill.color), colors.blendingBackgroundColor))
      : colors.blendedColor;
  const track: Box = vertical
    ? { x: box.x + pad, y: box.y + pad, width: thickness, height: box.height - 2 * pad }
    : { x: box.x + pad, y: box.y + box.height - pad - thickness, width: box.width - 2 * pad, height: thickness };
  const filled: Box = vertical
    ? { ...track, y: track.y + track.height * (1 - ratio), height: track.height * ratio }
    : { ...track, width: track.width * ratio };
  const radius = Math.min(8, thickness / 2);
  return (
    <>
      <rect {...track} rx={radius} fill={style.barBackground} />
      {ratio > 0 && <rect {...filled} rx={radius} fill={fillColor} />}
    </>
  );
}

const asProgressDatum = (datum: MetricDatum) => (isMetricWProgress(datum) || isBulletMetric(datum) ? datum : undefined);

/** the icon in the first row, in its column; an icon that renders an `<svg>` is nested as is */
function icon(
  iconProp: NonNullable<MetricDatum['icon']>,
  size: number,
  color: Color,
  inner: Box,
  column: number,
  left: boolean,
): ReactNode {
  const markup = svgMarkup(renderWithProps(iconProp, { width: size, height: size, color }));
  if (!markup) return null;
  const x = left ? inner.x : inner.x + inner.width - column + (column - size);
  return (
    <g
      transform={`translate(${x} ${inner.y})`}
      color={color}
      fill={color}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
