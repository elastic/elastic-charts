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
import { MetricWProgress } from '../../specs';

/** @internal */
export const ProgressBar: React.FunctionComponent<{
  datum: MetricWProgress;
  barBackground: Color;
  blendedBarColor: Color;
}> = ({ datum: { title, domainMax, value, progressBarDirection }, barBackground, blendedBarColor }) => {
  const verticalDirection = progressBarDirection === LayoutDirection.Vertical;
  // currently we provide only the small progress bar;
  const isSmall = true;
  const percent = Number(clamp((value / domainMax) * 100, 0, 100).toFixed(1));

  const bgClassName = classNames('echSingleMetricProgress', {
    'echSingleMetricProgress--vertical': verticalDirection,
    'echSingleMetricProgress--horizontal': !verticalDirection,
    'echSingleMetricProgress--small': isSmall,
  });
  const barClassName = classNames('echSingleMetricProgressBar', {
    'echSingleMetricProgressBar--vertical': verticalDirection,
    'echSingleMetricProgressBar--horizontal': !verticalDirection,
    'echSingleMetricProgressBar--small': isSmall,
  });
  const percentProp = verticalDirection ? { height: `${percent}%` } : { width: `${percent}%` };
  return (
    <div className={bgClassName} style={{ backgroundColor: isSmall ? barBackground : undefined }}>
      <div
        className={barClassName}
        style={{ ...percentProp, backgroundColor: blendedBarColor }}
        role="meter"
        aria-label={title ? `Percentage of ${title}` : 'Percentage'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      />
    </div>
  );
};
