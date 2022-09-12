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
import { isFiniteNumber, LayoutDirection, renderWithProps } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { MetricStyle } from '../../../../utils/themes/theme';
import {
  isMetricWNumber,
  isMetricWProgress,
  MetricWNumber,
  MetricWProgress,
  MetricWText,
  MetricWTrend,
} from '../../specs';

type BreakPoint = 's' | 'm' | 'l';

const WIDTH_BP: [number, number, BreakPoint][] = [
  [0, 180, 's'],
  [180, 300, 'm'],
  [300, Infinity, 'l'],
];

const PADDING = 8;
const NUMBER_LINE_HEIGHT = 1.2; // aligned with our CSS
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
  titleLines: number;
  subtitleLines: number;
  title: boolean;
  subtitle: boolean;
  extra: boolean;
};

function elementVisibility(
  datum: MetricWText | MetricWNumber | MetricWProgress | MetricWTrend,
  panel: Size,
  size: BreakPoint,
): ElementVisibility {
  const titleHeight = (title: boolean, maxLines: number) =>
    PADDING + (title ? maxLines * TITLE_FONT_SIZE[size] * NUMBER_LINE_HEIGHT : 0);
  const subtitleHeight = (subtitle: boolean, maxLines: number) =>
    subtitle ? maxLines * SUBTITLE_FONT_SIZE[size] * NUMBER_LINE_HEIGHT + PADDING : 0;
  const extraHeight = (extra: boolean) => (extra ? EXTRA_FONT_SIZE[size] * NUMBER_LINE_HEIGHT : 0);
  const valueHeight = VALUE_FONT_SIZE[size] * NUMBER_LINE_HEIGHT + PADDING;

  const responsiveBreakPoints: Array<ElementVisibility> = [
    { titleLines: 3, subtitleLines: 2, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleLines: 3, subtitleLines: 1, title: !!datum.title, subtitle: !!datum.subtitle, extra: !!datum.extra },
    { titleLines: 3, subtitleLines: 0, title: !!datum.title, subtitle: false, extra: !!datum.extra },
    { titleLines: 2, subtitleLines: 0, title: !!datum.title, subtitle: false, extra: !!datum.extra },
    { titleLines: 2, subtitleLines: 0, title: !!datum.title, subtitle: false, extra: false },
    { titleLines: 1, subtitleLines: 0, title: !!datum.title, subtitle: false, extra: false },
  ];

  const isVisible = ({ titleLines, subtitleLines, title, subtitle, extra }: ElementVisibility) =>
    titleHeight(title, titleLines) + subtitleHeight(subtitle, subtitleLines) + extraHeight(extra) + valueHeight <
    panel.height;

  return (
    responsiveBreakPoints.find((breakpoint) => isVisible(breakpoint)) ??
    responsiveBreakPoints[responsiveBreakPoints.length - 1]
  );
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
  datum: MetricWText | MetricWNumber | MetricWProgress | MetricWTrend;
  panel: Size;
  style: MetricStyle;
  onElementClick: () => void;
  highContrastTextColor: Color;
}> = ({ id, datum, panel, style, onElementClick, highContrastTextColor }) => {
  const { title, subtitle, extra, value } = datum;

  const size = findRange(WIDTH_BP, panel.width);
  const hasProgressBar = isMetricWProgress(datum);
  const progressBarDirection = isMetricWProgress(datum) ? datum.progressBarDirection : undefined;
  const containerClassName = classNames('echMetricText', {
    'echMetricText--small': hasProgressBar,
    'echMetricText--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetricText--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  const visibility = elementVisibility(datum, panel, size);

  const titleWidthMaxSize = size === 's' ? '100%' : '80%';
  const titleWidth = `min(${titleWidthMaxSize}, calc(${titleWidthMaxSize} - ${datum.icon ? '24px' : '0px'}))`;

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
                  ...lineClamp(visibility.titleLines),
                  width: titleWidth,
                }}
              >
                {title}
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
            style={{ fontSize: `${SUBTITLE_FONT_SIZE[size]}px`, ...lineClamp(visibility.subtitleLines) }}
          >
            {subtitle}
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
          {isMetricWNumber(datum)
            ? isFiniteNumber(value)
              ? splitNumericSuffixPrefix(datum.valueFormatter(value)).map(([type, text], i) =>
                  type === 'numeric' ? (
                    text
                  ) : (
                    // eslint-disable-next-line react/no-array-index-key
                    <span
                      key={`${text}${i}`}
                      className="echMetricText__part"
                      style={{ fontSize: `${VALUE_PART_FONT_SIZE[size]}px` }}
                    >
                      {text}
                    </span>
                  ),
                )
              : style.nonFiniteText
            : value}
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
