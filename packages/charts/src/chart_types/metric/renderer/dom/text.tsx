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

const MAX_SMALL_PANEL_WIDTH = 250;
const MAX_SMALL_PANEL_HEIGHT = 300;
const MIN_PANEL_HEIGHT_FOR_SUBTITLE = 130;

/** @internal */
export const MetricText: React.FunctionComponent<{
  datum: MetricBase | MetricWProgress | MetricWTrend;
  progressBarMode: MetricSpec['progressBarMode'];
  progressBarOrientation: MetricSpec['progressBarOrientation'];
  panel: Size;
  style: MetricStyle;
}> = ({ datum, panel, progressBarMode, progressBarOrientation, style }) => {
  const isVertical = progressBarOrientation === LayoutDirection.Vertical;
  const isSmall = progressBarMode === ProgressBarMode.Small;
  const { title, subtitle, extra, value } = datum;
  // title size breakpoints
  const titleSize = panel.width > MAX_SMALL_PANEL_WIDTH && panel.height > MAX_SMALL_PANEL_HEIGHT ? 'M' : 'S';
  const metricTextSize = panel.width > MAX_SMALL_PANEL_WIDTH ? 'M' : 'S';
  const showSubtitle = panel.height > MIN_PANEL_HEIGHT_FOR_SUBTITLE;
  const containerClassName = classNames('echMetricText', {
    'echMetricText--small': isSmall,
    'echMetricText--vertical': isVertical,
    'echMetricText--horizontal': !isVertical,
  });
  const titleClassName = classNames('echMetricText__title', {
    [`echMetricText__title${titleSize}`]: true,
  });
  const valueClassName = classNames('echMetricText__value', {
    [`echMetricText__value${metricTextSize}`]: true,
  });
  const parts = splitNumericSuffixPrefix(datum.valueFormatter(value));
  const bgColor =
    isMetricWTrend(datum) || (isMetricWProgress(datum) && progressBarMode === 'none') ? datum.color : style.background;

  const highContrastTextColor =
    highContrastColor(colorToRgba(bgColor)) === Colors.White.rgba ? style.text.lightColor : style.text.darkColor;

  return (
    <div className={containerClassName} style={{ color: highContrastTextColor }}>
      <div>{title && <h2 className={titleClassName}>{title}</h2>}</div>
      <div>{showSubtitle && subtitle && <h3 className="echMetricText__subtitle">{subtitle}</h3>}</div>
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
