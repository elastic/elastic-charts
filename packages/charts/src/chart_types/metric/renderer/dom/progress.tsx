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
import { clamp, LayoutDirection } from '../../../../utils/common';
import { MetricWProgress, MetricSpec, ProgressBarMode } from '../../specs';

/** @internal */
export const ProgressBar: React.FunctionComponent<{
  datum: Pick<MetricWProgress, 'domain' | 'value' | 'color'>;
  mode: MetricSpec['progressBarMode'];
  orientation: MetricSpec['progressBarOrientation'];
  barBackground: Color;
}> = ({ datum: { domain, value, color }, mode, orientation, barBackground }) => {
  const isVertical = orientation === LayoutDirection.Vertical;
  const isSmall = mode === ProgressBarMode.Small;
  const percent = clamp((domain ? value / (domain[1] - domain[0]) : 1) * 100, 0, 100);

  const bgClassName = classNames('echSingleMetricProgress', {
    'echSingleMetricProgress--vertical': isVertical,
    'echSingleMetricProgress--horizontal': !isVertical,
    'echSingleMetricProgress--small': isSmall,
  });
  const barClassName = classNames('echSingleMetricProgressBar', {
    'echSingleMetricProgressBar--vertical': isVertical,
    'echSingleMetricProgressBar--horizontal': !isVertical,
    'echSingleMetricProgressBar--small': isSmall,
  });
  const percentProp = isVertical ? { height: `${percent}%` } : { width: `${percent}%` };
  return (
    <div className={bgClassName} style={{ background: isSmall ? barBackground : undefined }}>
      <div className={barClassName} style={{ background: color, ...percentProp }} />
    </div>
  );
};
