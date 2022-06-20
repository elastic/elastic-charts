/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { useState } from 'react';

import { changeColorLightness } from '../../../../common/color_library_wrappers';
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
  const metricHTMLId = `echMetric-${chartId}-${rowIndex}-${columnIndex}`;
  const hasProgressBar = isMetricWProgress(datum);
  const progressBarDirection = hasProgressBar ? datum.progressBarDirection : undefined;

  const metricPanelClassName = classNames('echMetric', {
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

  const ComponentType = onElementClick ? 'button' : 'div';
  const event: MetricElementEvent = { type: 'metricElementEvent', datumIndex: [rowIndex, columnIndex] };
  return (
    <ComponentType
      role="figure"
      aria-labelledby={datum.title && metricHTMLId}
      className={metricPanelClassName}
      onMouseLeave={() => {
        if (onElementClick) setMouseState('leave');
        if (onElementOut) onElementOut();
      }}
      onMouseEnter={() => {
        if (onElementClick) setMouseState('enter');
        if (onElementOver) onElementOver([event]);
      }}
      onMouseDown={() => onElementClick && setMouseState('down')}
      onMouseUp={() => onElementClick && setMouseState('enter')}
      onClick={() => onElementClick && onElementClick([event])}
      style={{
        backgroundColor:
          !isMetricWTrend(datumWithInteractionColor) && !isMetricWProgress(datumWithInteractionColor)
            ? datumWithInteractionColor.color
            : updatedStyle.background,
      }}
    >
      <MetricText id={metricHTMLId} datum={datumWithInteractionColor} panel={panel} style={updatedStyle} />
      {isMetricWTrend(datumWithInteractionColor) && <SparkLine id={metricHTMLId} datum={datumWithInteractionColor} />}
      {isMetricWProgress(datumWithInteractionColor) && (
        <ProgressBar datum={datumWithInteractionColor} barBackground={updatedStyle.barBackground} />
      )}
    </ComponentType>
  );
};
