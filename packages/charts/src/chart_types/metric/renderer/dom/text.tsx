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

type BreakPoint = 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';

interface TextParts {
  emphasis: 'small' | 'normal';
  text: string;
}

const WIDTH_BP: [number, number, BreakPoint][] = [
  [0, 180, 's'],
  [180, 250, 'm'],
  [250, 600, 'l'],
  [600, 1000, 'xl'],
  [1000, 2000, 'xxl'],
  [2000, Infinity, 'xxxl'],
];

const PADDING = 8;
const LINE_HEIGHT = 1.2; // aligned with our CSS
const ICON_SIZE: Record<BreakPoint, number> = { s: 16, m: 16, l: 24, xl: 36, xxl: 44, xxxl: 64 };
const TITLE_FONT_SIZE: Record<BreakPoint, number> = { s: 12, m: 16, l: 16, xl: 24, xxl: 32, xxxl: 42 };
const SUBTITLE_FONT_SIZE: Record<BreakPoint, number> = { s: 10, m: 14, l: 14, xl: 20, xxl: 26, xxxl: 26 };
const EXTRA_FONT_SIZE: Record<BreakPoint, number> = { s: 10, m: 14, l: 14, xl: 20, xxl: 26, xxxl: 26 };
const VALUE_FONT_SIZE: Record<BreakPoint, number> = { s: 22, m: 27, l: 34, xl: 56, xxl: 88, xxxl: 140 };
const VALUE_PART_FONT_SIZE: Record<BreakPoint, number> = { s: 16, m: 20, l: 24, xl: 40, xxl: 68, xxxl: 110 };

const TITLE_FONT: Font = {
  fontStyle: 'normal',
  fontFamily: DEFAULT_FONT_FAMILY,
  fontVariant: 'normal',
  fontWeight: 'bold',
  textColor: 'black',
};
const SUBTITLE_FONT: Font = {
  ...TITLE_FONT,
  fontWeight: 'normal',
};

function findRange(ranges: [number, number, BreakPoint][], value: number): BreakPoint {
  const range = ranges.find(([min, max]) => min <= value && value < max);
  return range ? range[2] : ranges[0]?.[2] ?? 's';
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
  size: BreakPoint,
  locale: string,
): ElementVisibility & { titleLines: string[]; subtitleLines: string[] } {
  const LEFT_RIGHT_PADDING = 16;
  const maxTitlesWidth = (size === 's' ? 1 : 0.8) * panel.width - (datum.icon ? 24 : 0) - LEFT_RIGHT_PADDING;

  const titleHeight = (maxLines: number, textMeasure: TextMeasure) => {
    return datum.title
      ? PADDING +
          wrapText(datum.title, TITLE_FONT, TITLE_FONT_SIZE[size], maxTitlesWidth, maxLines, textMeasure, locale)
            .length *
            TITLE_FONT_SIZE[size] *
            LINE_HEIGHT
      : 0;
  };

  const subtitleHeight = (maxLines: number, textMeasure: TextMeasure) => {
    return datum.subtitle
      ? PADDING +
          wrapText(
            datum.subtitle,
            SUBTITLE_FONT,
            SUBTITLE_FONT_SIZE[size],
            maxTitlesWidth,
            maxLines,
            textMeasure,
            locale,
          ).length *
            SUBTITLE_FONT_SIZE[size] *
            LINE_HEIGHT
      : 0;
  };

  const extraHeight = EXTRA_FONT_SIZE[size] * LINE_HEIGHT;
  const valueHeight = VALUE_FONT_SIZE[size] * LINE_HEIGHT + PADDING;

  const responsiveBreakPoints: Array<ElementVisibility> = [
    { titleMaxLines: 3, subtitleMaxLines: 2, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleMaxLines: 3, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleMaxLines: 2, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleMaxLines: 1, subtitleMaxLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: !!datum.extra },
    { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: false },
    { titleMaxLines: 1, subtitleMaxLines: 0, title: !!datum.title, subtitle: false, extra: false },
  ];

  const isVisible = (
    { titleMaxLines, subtitleMaxLines, title, subtitle, extra }: ElementVisibility,
    measure: TextMeasure,
  ) =>
    (title && titleMaxLines > 0 ? titleHeight(titleMaxLines, measure) : 0) +
      (subtitle && subtitleMaxLines > 0 ? subtitleHeight(subtitleMaxLines, measure) : 0) +
      (extra ? extraHeight : 0) +
      valueHeight <
    panel.height;

  return withTextMeasure((textMeasure) => {
    const visibilityBreakpoint =
      responsiveBreakPoints.find((breakpoint) => isVisible(breakpoint, textMeasure)) ?? responsiveBreakPoints.at(-1)!;
    return {
      ...visibilityBreakpoint,
      titleLines: wrapText(
        datum.title ?? '',
        TITLE_FONT,
        TITLE_FONT_SIZE[size],
        maxTitlesWidth,
        visibilityBreakpoint.titleMaxLines,
        textMeasure,
        locale,
      ),
      subtitleLines: wrapText(
        datum.subtitle ?? '',
        SUBTITLE_FONT,
        SUBTITLE_FONT_SIZE[size],
        maxTitlesWidth,
        visibilityBreakpoint.subtitleMaxLines,
        textMeasure,
        locale,
      ),
    };
  });
}

function lineClamp(maxLines: number): CSSProperties {
  return {
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: maxLines, // due to an issue with react CSSProperties filtering out this line, see https://github.com/facebook/react/issues/23033
    lineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
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

  const size = findRange(WIDTH_BP, panel.width);
  const hasProgressBar = isMetricWProgress(datum);
  const progressBarDirection = isMetricWProgress(datum) ? datum.progressBarDirection : undefined;
  const containerClassName = classNames('echMetricText', {
    [`echMetricText--${progressBarSize}`]: hasProgressBar,
    'echMetricText--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetricText--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  const visibility = elementVisibility(datum, panel, size, locale);

  const titleWidthMaxSize = size === 's' ? '100%' : '80%';
  const titlesWidth = `min(${titleWidthMaxSize}, calc(${titleWidthMaxSize} - ${datum.icon ? '24px' : '0px'}))`;

  const isNumericalMetric = isMetricWNumber(datum) || isMetricWNumberArrayValues(datum);
  const textParts = getTextParts(datum, style);

  const TitleElement = () => (
    <span
      style={{
        fontSize: `${TITLE_FONT_SIZE[size]}px`,
        whiteSpace: 'pre-wrap',
        width: titlesWidth,
        ...lineClamp(visibility.titleLines.length),
      }}
      title={datum.title}
    >
      {datum.title}
    </span>
  );
  return (
    <div className={containerClassName} style={{ color: highContrastTextColor }}>
      <div>
        {visibility.title && (
          <h2 id={id} className="echMetricText__title">
            {onElementClick ? (
              <button
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
        {datum.icon && (
          <div className="echMetricText__icon">
            {renderWithProps(datum.icon, {
              width: ICON_SIZE[size],
              height: ICON_SIZE[size],
              color: highContrastTextColor,
            })}
          </div>
        )}
      </div>
      <div>
        {visibility.subtitle && (
          <p
            className="echMetricText__subtitle"
            style={{
              fontSize: `${SUBTITLE_FONT_SIZE[size]}px`,
              width: titlesWidth,
              whiteSpace: 'pre-wrap',
              ...lineClamp(visibility.subtitleLines.length),
            }}
            title={datum.subtitle}
          >
            {datum.subtitle}
          </p>
        )}
      </div>
      <div className="echMetricText__gap">{body && <div className="echMetricText__body">{body}</div>}</div>
      <div>
        {visibility.extra && (
          <p className="echMetricText__extra" style={{ fontSize: `${EXTRA_FONT_SIZE[size]}px` }}>
            {extra}
          </p>
        )}
      </div>
      <div>
        <p
          className="echMetricText__value"
          style={{
            fontSize: `${VALUE_FONT_SIZE[size]}px`,
            textOverflow: isNumericalMetric ? undefined : 'ellipsis',
            marginRight: datum.valueIcon ? ICON_SIZE[size] + 8 : undefined,
            color: datum.valueColor,
          }}
          title={textParts.map(({ text }) => text).join('')}
        >
          {textParts.map(({ emphasis, text }, i) => {
            return emphasis === 'small' ? (
              <span
                key={`${text}${i}`}
                className="echMetricText__part"
                style={{ fontSize: `${VALUE_PART_FONT_SIZE[size]}px` }}
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
            style={{ fontSize: `${VALUE_FONT_SIZE[size]}px`, color: datum.valueColor ?? highContrastTextColor }}
          >
            {renderWithProps(datum.valueIcon, {
              width: VALUE_PART_FONT_SIZE[size],
              height: VALUE_PART_FONT_SIZE[size],
              color: datum.valueColor ?? highContrastTextColor,
              verticalAlign: 'middle',
            })}
          </p>
        )}
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
