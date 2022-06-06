/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import { highContrastColor } from '../../../../common/color_calcs';
import { colorToRgba } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { isFiniteNumber, LayoutDirection } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { MetricStyle } from '../../../../utils/themes/theme';
import {
  isMetricWProgress,
  isMetricWTrend,
  MetricBase,
  MetricSpec,
  MetricWProgress,
  MetricWTrend,
  ProgressBarMode,
} from '../../specs';

const MIN_PANEL_HEIGHT_FOR_SUBTITLE = 130;

const WIDTH_BP: [number, number, string][] = [
  [0, 200, 's'],
  [200, 300, 'm'],
  [300, Infinity, 'l'],
];

function findRange(ranges: [number, number, string][], value: number) {
  const range = ranges.find(([min, max]) => {
    return value >= min && value < max;
  });
  return range ? range[2] : ranges[0][2];
}

/** @internal */
export const MetricText: React.FunctionComponent<{
  id: string;
  datum: MetricBase | MetricWProgress | MetricWTrend;
  progressBarMode: MetricSpec['progressBarMode'];
  progressBarOrientation: MetricSpec['progressBarOrientation'];
  panel: Size;
  style: MetricStyle;
}> = ({ id, datum, panel, progressBarMode, progressBarOrientation, style }) => {
  const isVertical = progressBarOrientation === LayoutDirection.Vertical;
  const isSmall = progressBarMode === ProgressBarMode.Small;
  const { title, subtitle, extra, value } = datum;
  const size = findRange(WIDTH_BP, panel.width);
  // title size breakpoints

  const showSubtitle = panel.height > MIN_PANEL_HEIGHT_FOR_SUBTITLE;
  const containerClassName = classNames('echMetricText', {
    'echMetricText--small': isSmall,
    'echMetricText--vertical': isVertical,
    'echMetricText--horizontal': !isVertical,
  });
  const titleClassName = classNames('echMetricText__title', {
    [`echMetricText__title--${size}`]: true,
  });
  const subtitleClassName = classNames('echMetricText__subtitle', {
    [`echMetricText__subtitle--${size}`]: true,
  });
  const valueClassName = classNames('echMetricText__value', {
    [`echMetricText__value--${size}`]: true,
  });
  const parts = splitNumericSuffixPrefix(datum.valueFormatter(value));
  const bgColor =
    isMetricWTrend(datum) || (isMetricWProgress(datum) && progressBarMode === 'none') ? datum.color : style.background;

  const highContrastTextColor =
    highContrastColor(colorToRgba(bgColor)) === Colors.White.rgba ? style.text.lightColor : style.text.darkColor;

  return (
    <div className={containerClassName} style={{ color: highContrastTextColor }}>
      <div>
        {title && (
          <h2 id={id} className={titleClassName}>
            {title}
            {showSubtitle && subtitle && <span className={subtitleClassName}> {subtitle}</span>}
          </h2>
        )}
      </div>
      <div className="echMetricText__gap"></div>
      <div>{extra && <h5 className="echMetricText__extra">{extra}</h5>}</div>
      <div>
        <h4 className={valueClassName}>
          {isFiniteNumber(value)
            ? parts.map(([type, text], i) =>
                type === 'numeric' ? (
                  text
                ) : (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={i} className="echMetricText__unit">
                    {text}
                  </span>
                ),
              )
            : style.nonFiniteText}
        </h4>
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
