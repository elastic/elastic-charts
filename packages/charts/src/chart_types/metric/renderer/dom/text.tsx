/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { Color } from '../../../../common/colors';
import { DEFAULT_FONT_FAMILY } from '../../../../common/default_theme_attributes';
import { Font } from '../../../../common/text_utils';
import { TextMeasure, withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { isFiniteNumber, LayoutDirection, renderWithProps } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { wrapText } from '../../../../utils/text/wrap';
import { MetricStyle } from '../../../../utils/themes/theme';
import { isMetricWNumber, isMetricWNumberArrayValues, isMetricWProgress, MetricDatum } from '../../specs';

interface TextParts {
  emphasis: 'small' | 'normal';
  text: string;
}

type BreakPoint = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

const HEIGHT_BP: [number, number, BreakPoint][] = [
  [0, 200, 'xs'],
  [200, 300, 's'],
  [300, 400, 'm'],
  [400, 500, 'l'],
  [500, 600, 'xl'],
  [600, Infinity, 'xxl'],
];

const PADDING = 8;
const LINE_HEIGHT = 1.2; // aligned with our CSS
const ICON_SIZE: Record<BreakPoint, number> = { xs: 16, s: 16, m: 24, l: 24, xl: 32, xxl: 42 };

const TITLE_FONT_SIZE: Record<BreakPoint, number> = { xs: 16, s: 16, m: 24, l: 24, xl: 32, xxl: 42 };
const SUBTITLE_FONT_SIZE: Record<BreakPoint, number> = { xs: 14, s: 14, m: 16, l: 20, xl: 26, xxl: 36 };
const EXTRA_FONT_SIZE: Record<BreakPoint, number> = { xs: 14, s: 14, m: 16, l: 20, xl: 26, xxl: 36 };
const VALUE_FONT_SIZE: Record<BreakPoint, number> = { xs: 36, s: 36, m: 56, l: 72, xl: 104, xxl: 170 };
const VALUE_PART_FONT_SIZE: Record<BreakPoint, number> = { xs: 24, s: 24, m: 42, l: 56, xl: 80, xxl: 130 };
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

interface Sizes {
  iconSize: number;
  titleFontSize: number;
  subtitleFontSize: number;
  extraFontSize: number;
  valueFontSize: number;
  valuePartFontSize: number;
}

function getFontSizes(ranges: [number, number, BreakPoint][], value: number, style: MetricStyle): Sizes {
  const range = ranges.find(([min, max]) => min <= value && value < max);
  const size = range ? range[2] : ranges[0]?.[2] ?? 's';
  const valueFontSize = typeof style.text.valueFontSize === 'number' ? style.text.valueFontSize : VALUE_FONT_SIZE[size];
  const valuePartFontSize =
    typeof style.text.valueFontSize === 'number'
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

type ElementVisibility = {
  titleMaxLines: number;
  subtitleMaxLines: number;
  title: boolean;
  subtitle: boolean;
  extra: boolean;
};

function elementVisibility(
  datum: MetricDatum,
  panel: Size,
  sizes: Sizes,
  locale: string,
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

  const responsiveBreakPoints: Array<ElementVisibility> = [
    { titleMaxLines: 3, subtitleMaxLines: 2, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleMaxLines: 3, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleMaxLines: 2, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleMaxLines: 1, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: !!datum.extra },
    { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: false },
    { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: false },
  ];

  const getCombinedHeight = (
    { titleMaxLines, subtitleMaxLines, title, subtitle, extra }: ElementVisibility,
    measure: TextMeasure,
  ) =>
    (title && titleMaxLines > 0 ? titleHeight(titleMaxLines, measure) : 0) +
    (subtitle && subtitleMaxLines > 0 ? subtitleHeight(subtitleMaxLines, measure) : 0) +
    (extra ? extraHeight : 0) +
    valueHeight +
    PADDING;

  const isVisible = (ev: ElementVisibility, measure: TextMeasure) => getCombinedHeight(ev, measure) < panel.height;

  return withTextMeasure((textMeasure) => {
    const visibilityBreakpoint =
      responsiveBreakPoints.find((breakpoint) => isVisible(breakpoint, textMeasure)) ?? responsiveBreakPoints.at(-1)!;

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

function getAutoValueFontSize(
  valueFontSize: number,
  maxWidth: number,
  gapHeight: number,
  textParts: TextParts[],
  minValueFontSize: number,
  hasIcon: boolean,
) {
  const widthConstrainedSize = withTextMeasure((textMeasure) => {
    const textWidth =
      textParts.reduce((sum, { text, emphasis }) => {
        const fontSize = emphasis === 'small' ? valueFontSize / VALUE_PART_FONT_RATIO : valueFontSize;
        return sum + textMeasure(text, VALUE_FONT, fontSize).width;
      }, 0) + (hasIcon ? valueFontSize + PADDING : 0);
    const ratio = maxWidth / textWidth;
    return ratio * valueFontSize;
  });
  const heightConstrainedSize = valueFontSize + gapHeight;
  const autoValueFontSize = Math.max(Math.min(heightConstrainedSize, widthConstrainedSize), minValueFontSize);

  return {
    valueFontSize: autoValueFontSize,
    valuePartFontSize: autoValueFontSize / VALUE_PART_FONT_RATIO,
  };
}

function lineClamp(maxLines: number): CSSProperties {
  return {
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: maxLines, // due to an issue with react CSSProperties filtering out this line, see https://github.com/facebook/react/issues/23033
    lineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
  };
}

/** @internal */
export const MetricText: React.FunctionComponent<{
  id: string;
  datum: MetricDatum;
  panel: Size;
  style: MetricStyle;
  onElementClick?: () => void;
  highContrastTextColor: Color;
  progressBarSize: 'small';
  locale: string;
}> = ({ id, datum, panel, style, onElementClick, highContrastTextColor, progressBarSize, locale }) => {
  const { extra, body } = datum;
  const sizes = getFontSizes(HEIGHT_BP, panel.height, style);
  const hasProgressBar = isMetricWProgress(datum);
  const progressBarDirection = isMetricWProgress(datum) ? datum.progressBarDirection : undefined;
  const containerClassName = classNames('echMetricText', {
    [`echMetricText--${progressBarSize}`]: hasProgressBar,
    'echMetricText--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetricText--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  const visibility = elementVisibility(datum, panel, sizes, locale);
  const isNumericalMetric = isMetricWNumber(datum) || isMetricWNumberArrayValues(datum);
  const textParts = getTextParts(datum, style);
  const { valueFontSize, valuePartFontSize } =
    style.text.valueFontSize !== 'auto'
      ? sizes
      : getAutoValueFontSize(
          sizes.valueFontSize,
          panel.width - 2 * PADDING,
          visibility.gapHeight,
          textParts,
          style.text.minValueFontSize,
          datum.valueIcon !== undefined,
        );

  const TitleElement = () => (
    <span
      style={{
        fontSize: sizes.titleFontSize,
        textAlign: style.text.titlesTextAlign,
        ...lineClamp(visibility.titleLines.length),
      }}
      title={datum.title}
    >
      {datum.title}
    </span>
  );
  return (
    <div className={containerClassName} style={{ color: highContrastTextColor }}>
      <div
        className={classNames(
          'echMetricText__titlesBlock',
          `echMetricText__titlesBlock--${style.text.titlesTextAlign}`,
        )}
        style={
          datum.icon && {
            marginLeft:
              'center' === style.text.titlesTextAlign || style.text.iconAlign === 'left' ? sizes.iconSize + PADDING : 0,
            marginRight:
              'center' === style.text.titlesTextAlign || style.text.iconAlign === 'right'
                ? sizes.iconSize + PADDING
                : 0,
          }
        }
      >
        {visibility.title && (
          <h2 id={id} className="echMetricText__title">
            {onElementClick ? (
              <button
                // ".echMetric" displays an outline halo;
                // inline styles protect us from unintended overrides of these styles.
                style={{ outline: 'none' }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onElementClick();
                }}
              >
                <TitleElement />
              </button>
            ) : (
              <TitleElement />
            )}
          </h2>
        )}
        {visibility.subtitle && (
          <p
            className="echMetricText__subtitle"
            style={{
              fontSize: sizes.subtitleFontSize,
              ...lineClamp(visibility.subtitleLines.length),
            }}
            title={datum.subtitle}
          >
            {datum.subtitle}
          </p>
        )}
      </div>

      {datum.icon && (
        <div className={classNames('echMetricText__icon', `echMetricText__icon--${style.text.iconAlign}`)}>
          {renderWithProps(datum.icon, {
            width: sizes.iconSize,
            height: sizes.iconSize,
            color: highContrastTextColor,
          })}
        </div>
      )}

      <div className="echMetricText__gap">{body && <div className="echMetricText__body">{body}</div>}</div>

      <div
        className={classNames(
          'echMetricText__valuesBlock',
          `echMetricText__valuesBlock--${style.text.valuesTextAlign}`,
        )}
      >
        <div>
          {visibility.extra && (
            <p className="echMetricText__extra" style={{ fontSize: sizes.extraFontSize }}>
              {extra}
            </p>
          )}
        </div>

        <div className="echMetricText__valueGroup">
          <p
            className="echMetricText__value"
            style={{
              fontSize: valueFontSize,
              textOverflow: isNumericalMetric ? undefined : 'ellipsis',
              color: datum.valueColor,
            }}
            title={textParts.map(({ text }) => text).join('')}
          >
            {textParts.map(({ emphasis, text }, i) => {
              return emphasis === 'small' ? (
                <span
                  key={`${text}${i}`}
                  className="echMetricText__part"
                  style={{
                    fontSize: valuePartFontSize,
                  }}
                >
                  {text}
                </span>
              ) : (
                text
              );
            })}
          </p>
          {datum.valueIcon && (
            <p
              className="echMetricText__valueIcon"
              style={{
                fontSize: valueFontSize,
                color: datum.valueColor ?? highContrastTextColor,
                marginRight: style.text.valuesTextAlign === 'center' ? -(valuePartFontSize + PADDING) : undefined,
              }}
            >
              {renderWithProps(datum.valueIcon, {
                width: valuePartFontSize,
                height: valuePartFontSize,
                color: datum.valueColor ?? highContrastTextColor,
                verticalAlign: 'middle',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function getTextParts(datum: MetricDatum, style: MetricStyle): TextParts[] {
  const values = Array.isArray(datum.value) ? datum.value : [datum.value];
  const valueFormatter =
    isMetricWNumber(datum) || isMetricWNumberArrayValues(datum) ? datum.valueFormatter : (v: number) => `${v}`;
  const textParts = values.reduce<TextParts[]>((acc, value, i, { length }) => {
    const parts: TextParts[] =
      typeof value === 'number'
        ? isFiniteNumber(value)
          ? splitNumericSuffixPrefix(valueFormatter(value))
          : [{ emphasis: 'normal', text: style.nonFiniteText }]
        : [{ emphasis: 'normal', text: value }];

    if (i < length - 1) {
      parts.push({ emphasis: 'normal', text: ', ' });
    }
    return [...acc, ...parts];
  }, []);

  if (!Array.isArray(datum.value)) return textParts;

  return [{ emphasis: 'normal', text: '[' }, ...textParts, { emphasis: 'normal', text: ']' }];
}

function splitNumericSuffixPrefix(text: string): TextParts[] {
  return text
    .split('')
    .reduce<{ emphasis: 'normal' | 'small'; textParts: string[] }[]>((acc, curr) => {
      const emphasis = curr === '.' || curr === ',' || isFiniteNumber(Number.parseInt(curr)) ? 'normal' : 'small';
      if (acc.length > 0 && acc.at(-1)?.emphasis === emphasis) {
        acc.at(-1)?.textParts.push(curr);
      } else {
        acc.push({ emphasis, textParts: [curr] });
      }
      return acc;
    }, [])
    .map(({ emphasis, textParts }) => ({
      emphasis,
      text: textParts.join(''),
    }));
}
