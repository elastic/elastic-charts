/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, useState } from 'react';

import { highContrastColor } from '../../../../common/color_calcs';
import { changeColorLightness, colorToRgba } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { DEFAULT_CSS_CURSOR } from '../../../../common/constants';
import { BasicListener, ElementClickListener, ElementOverListener, MetricElementEvent } from '../../../../specs';
import { LayoutDirection } from '../../../../utils/common';
import { Size } from '../../../../utils/dimensions';
import { MetricStyle } from '../../../../utils/themes/theme';
import { isMetricWProgress, isMetricWTrend, MetricBase, MetricWProgress, MetricWTrend } from '../../specs';
import { ProgressBar } from './progress';
import { SparkLine } from './sparkline';
import { MetricText } from './text';

/** @internal */
export const Metric: React.FunctionComponent<{
  chartId: string;
  rowIndex: number;
  columnIndex: number;
  totalColumns: number;
  totalRows: number;
  datum: MetricBase | MetricWProgress | MetricWTrend;
  panel: Size;
  style: MetricStyle;
  onElementClick?: ElementClickListener;
  onElementOver?: ElementOverListener;
  onElementOut?: BasicListener;
}> = ({
  chartId,
  rowIndex,
  columnIndex,
  totalColumns,
  totalRows,
  datum,
  panel,
  style,
  onElementClick,
  onElementOver,
  onElementOut,
}) => {
  const [mouseState, setMouseState] = useState<'leave' | 'enter' | 'down'>('leave');
  const [lastMouseDownTimestamp, setLastMouseDownTimestamp] = useState<number>(0);
  const metricHTMLId = `echMetric-${chartId}-${rowIndex}-${columnIndex}`;
  const hasProgressBar = isMetricWProgress(datum);
  const progressBarDirection = hasProgressBar ? datum.progressBarDirection : undefined;

  const containerClassName = classNames('echMetric', {
    'echMetric--rightBorder': columnIndex < totalColumns - 1,
    'echMetric--bottomBorder': rowIndex < totalRows - 1,
    'echMetric--small': hasProgressBar,
    'echMetric--vertical': progressBarDirection === LayoutDirection.Vertical,
    'echMetric--horizontal': progressBarDirection === LayoutDirection.Horizontal,
  });

  const lightnessAmount = mouseState === 'leave' ? 0 : mouseState === 'enter' ? 0.05 : 0.1;
  const interactionColor = changeColorLightness(datum.color, lightnessAmount, 0.8);
  const backgroundInteractionColor = changeColorLightness(style.background, lightnessAmount, 0.8);

  const datumWithInteractionColor: MetricBase | MetricWProgress | MetricWTrend = {
    ...datum,
    color: interactionColor,
  };
  const updatedStyle: MetricStyle = {
    ...style,
    background: backgroundInteractionColor,
  };

  const event: MetricElementEvent = { type: 'metricElementEvent', rowIndex, columnIndex };

  const containerStyle: CSSProperties = {
    backgroundColor:
      !isMetricWTrend(datumWithInteractionColor) && !isMetricWProgress(datumWithInteractionColor)
        ? datumWithInteractionColor.color
        : updatedStyle.background,
    cursor: onElementClick ? 'pointer' : DEFAULT_CSS_CURSOR,
    borderColor: style.border,
  };

  const bgColor = isMetricWTrend(datum) || !isMetricWProgress(datum) ? datum.color : style.background;

  const highContrastTextColor =
    highContrastColor(colorToRgba(bgColor)) === Colors.White.rgba ? style.text.lightColor : style.text.darkColor;

  const onElementClickHandler = () => onElementClick && onElementClick([event]);
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/click-events-have-key-events
    <div
      role="figure"
      aria-labelledby={datum.title && metricHTMLId}
      className={containerClassName}
      style={containerStyle}
      onMouseLeave={() => {
        setMouseState('leave');
        if (onElementOut) onElementOut();
      }}
      onMouseEnter={() => {
        setMouseState('enter');
        if (onElementOver) onElementOver([event]);
      }}
      onMouseDown={() => {
        setMouseState('down');
        setLastMouseDownTimestamp(Date.now());
      }}
      onMouseUp={() => {
        setMouseState('enter');
        if (Date.now() - lastMouseDownTimestamp < 200 && onElementClick) {
          onElementClickHandler();
        }
      }}
      onFocus={() => {
        setMouseState('enter');
      }}
      onBlur={() => {
        setMouseState('leave');
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <MetricText
        id={metricHTMLId}
        datum={datumWithInteractionColor}
        panel={panel}
        style={updatedStyle}
        onElementClick={onElementClickHandler}
        highContrastTextColor={highContrastTextColor}
      />
      {isMetricWTrend(datumWithInteractionColor) && <SparkLine id={metricHTMLId} datum={datumWithInteractionColor} />}
      {isMetricWProgress(datumWithInteractionColor) && (
        <ProgressBar datum={datumWithInteractionColor} barBackground={updatedStyle.barBackground} />
      )}
      <div className="echMetric--outline" style={{ color: highContrastTextColor }}></div>
    </div>
  );
};
