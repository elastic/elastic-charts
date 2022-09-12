/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import { Color } from '../../../../common/colors';
import { DEFAULT_FONT_FAMILY } from '../../../../common/default_theme_attributes';
import { Font } from '../../../../common/text_utils';
import { TextMeasure, withTextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import { isFiniteNumber, LayoutDirection, renderWithProps } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { wrapText } from '../../../../utils/text/wrap';
import { MetricStyle } from '../../../../utils/themes/theme';
import { isMetricWProgress, MetricBase, MetricWProgress, MetricWTrend } from '../../specs';

type BreakPoint = 's' | 'm' | 'l';

const WIDTH_BP: [number, number, BreakPoint][] = [
  [0, 180, 's'],
  [180, 300, 'm'],
  [300, Infinity, 'l'],
];

const PADDING = 8;
const LINE_HEIGHT = 1.2; // aligned with our CSS
const ICON_SIZE: Record<BreakPoint, number> = { s: 16, m: 16, l: 24 };
const TITLE_FONT_SIZE: Record<BreakPoint, number> = { s: 12, m: 16, l: 16 };
const SUBTITLE_FONT_SIZE: Record<BreakPoint, number> = { s: 10, m: 14, l: 14 };
const EXTRA_FONT_SIZE: Record<BreakPoint, number> = { s: 10, m: 14, l: 14 };
const VALUE_FONT_SIZE: Record<BreakPoint, number> = { s: 22, m: 27, l: 34 };
const VALUE_PART_FONT_SIZE: Record<BreakPoint, number> = { s: 16, m: 20, l: 24 };

function findRange(ranges: [number, number, BreakPoint][], value: number): BreakPoint {
  const range = ranges.find(([min, max]) => min <= value && value < max);
  return range ? range[2] : ranges[0][2];
}

type ElementVisibility = {
  titleMaxLines: number;
  subtitleMaxLines: number;
  title: boolean;
  subtitle: boolean;
  extra: boolean;
};

function elementVisibility(
  datum: MetricBase | MetricWProgress | MetricWTrend,
  panel: Size,
  size: BreakPoint,
): ElementVisibility & { titleLines: string[]; subtitleLines: string[] } {
  const LEFT_RIGHT_PADDING = 16;
  const maxTitlesWidth = (size === 's' ? 1 : 0.8) * panel.width - (datum.icon ? 24 : 0) - LEFT_RIGHT_PADDING;

  const titleFont: Font = {
    fontStyle: 'normal',
    fontFamily: DEFAULT_FONT_FAMILY,
    fontVariant: 'normal',
    fontWeight: 400,
    textColor: 'black',
  };
  const subtitleFont: Font = {
    ...titleFont,
    fontWeight: 300,
  };
  const titleHeight = (maxLines: number, textMeasure: TextMeasure) => {
    return datum.title
      ? PADDING +
          wrapText(datum.title, titleFont, TITLE_FONT_SIZE[size], maxTitlesWidth, maxLines, textMeasure).length *
            TITLE_FONT_SIZE[size] *
            LINE_HEIGHT
      : 0;
  };

  const subtitleHeight = (maxLines: number, textMeasure: TextMeasure) => {
    return datum.subtitle
      ? PADDING +
          wrapText(datum.subtitle, subtitleFont, SUBTITLE_FONT_SIZE[size], maxTitlesWidth, maxLines, textMeasure)
            .length *
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
      responsiveBreakPoints.find((breakpoint) => isVisible(breakpoint, textMeasure)) ??
      responsiveBreakPoints[responsiveBreakPoints.length - 1];
    return {
      ...visibilityBreakpoint,
      titleLines: wrapText(
        datum.title ?? '',
        titleFont,
        TITLE_FONT_SIZE[size],
        maxTitlesWidth,
        visibilityBreakpoint.titleMaxLines,
        textMeasure,
      ),
      subtitleLines: wrapText(
        datum.subtitle ?? '',
        subtitleFont,
        SUBTITLE_FONT_SIZE[size],
        maxTitlesWidth,
        visibilityBreakpoint.subtitleMaxLines,
        textMeasure,
      ),
    };
  });
}

/** @internal */
export const MetricText: React.FunctionComponent<{
  id: string;
  datum: MetricBase | MetricWProgress | MetricWTrend;
  panel: Size;
  style: MetricStyle;
  onElementClick: () => void;
  highContrastTextColor: Color;
}> = ({ id, datum, panel, style, onElementClick, highContrastTextColor }) => {
  const { extra, value } = datum;

  const size = findRange(WIDTH_BP, panel.width - 16);
  const hasProgressBar = isMetricWProgress(datum);
  const progressBarDirection = isMetricWProgress(datum) ? datum.progressBarDirection : undefined;
  const containerClassName = classNames('echMetricText', {
    'echMetricText--small': hasProgressBar,
    'echMetricText--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetricText--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  const visibility = elementVisibility(datum, panel, size);

  const parts = splitNumericSuffixPrefix(datum.valueFormatter(value));

  const titlesMaxWidthRatio = size === 's' ? '100%' : '80%';
  const titlesWidth = `min(${titlesMaxWidthRatio}, calc(${titlesMaxWidthRatio} - ${datum.icon ? '24px' : '0px'}))`;

  return (
    <div className={containerClassName} style={{ color: highContrastTextColor }}>
      <div>
        {visibility.title && (
          <h2 id={id} className="echMetricText__title">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onElementClick();
              }}
            >
              <span
                style={{
                  fontSize: `${TITLE_FONT_SIZE[size]}px`,
                  whiteSpace: 'pre-wrap',
                  width: titlesWidth,
                }}
              >
                {visibility.titleLines.join('\n')}
              </span>
            </button>
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
            }}
          >
            {visibility.subtitleLines.join('\n')}
          </p>
        )}
      </div>
      <div className="echMetricText__gap"></div>
      <div>
        {visibility.extra && (
          <p className="echMetricText__extra" style={{ fontSize: `${EXTRA_FONT_SIZE[size]}px` }}>
            {extra}
          </p>
        )}
      </div>
      <div>
        <p className="echMetricText__value" style={{ fontSize: `${VALUE_FONT_SIZE[size]}px` }}>
          {isFiniteNumber(value)
            ? parts.map(([type, text], i) =>
                type === 'numeric' ? (
                  text
                ) : (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={i} className="echMetricText__part" style={{ fontSize: `${VALUE_PART_FONT_SIZE[size]}px` }}>
                    {text}
                  </span>
                ),
              )
            : style.nonFiniteText}
        </p>
      </div>
    </div>
  );
};

function splitNumericSuffixPrefix(text: string) {
  const charts = text.split('');
  const parts = charts.reduce<Array<[string, string[]]>>((acc, curr) => {
    const type = curr === '.' || curr === ',' || isFiniteNumber(Number.parseInt(curr)) ? 'numeric' : 'string';

    if (acc.length > 0 && acc[acc.length - 1][0] === type) {
      acc[acc.length - 1][1].push(curr);
    } else {
      acc.push([type, [curr]]);
    }
    return acc;
  }, []);
  return parts.map(([type, chars]) => [type, chars.join('')]);
}
