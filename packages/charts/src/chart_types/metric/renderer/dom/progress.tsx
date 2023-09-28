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
import { Icon } from '../../../../components/icons/icon';
import { clamp, isNil, LayoutDirection } from '../../../../utils/common';
import { MetricWProgress } from '../../specs';

const TARGET_SIZE = 8;

/** @internal */
export const ProgressBar: React.FunctionComponent<{
  datum: MetricWProgress;
  barBackground: Color;
  size: 'small';
}> = ({
  datum: { title, domainMax, value, target, color, valueFormatter, targetFormatter, progressBarDirection },
  barBackground,
  size,
}) => {
  const verticalDirection = progressBarDirection === LayoutDirection.Vertical;
  const getPercent = (n: number) => Number(clamp((n / domainMax) * 100, 0, 100).toFixed(1));
  const percent = getPercent(value);
  const targetPlacement = isNil(target) ? null : `calc(${getPercent(target)}% - ${TARGET_SIZE / 2}px)`;

  const bgClassName = classNames('echSingleMetricProgress', `echSingleMetricProgress--${size}`, {
    'echSingleMetricProgress--vertical': verticalDirection,
    'echSingleMetricProgress--horizontal': !verticalDirection,
  });
  const barClassName = classNames('echSingleMetricProgressBar', `echSingleMetricProgressBar--${size}`, {
    'echSingleMetricProgressBar--vertical': verticalDirection,
    'echSingleMetricProgressBar--horizontal': !verticalDirection,
  });
  const targetClassName = classNames('echSingleMetricTarget', `echSingleMetricTarget--${size}`, {
    'echSingleMetricTarget--vertical': verticalDirection,
    'echSingleMetricTarget--horizontal': !verticalDirection,
  });
  const percentProp = verticalDirection ? { height: `${percent}%` } : { width: `${percent}%` };

  return (
    <div className={bgClassName} style={{ backgroundColor: size === 'small' ? barBackground : undefined }}>
      {targetPlacement && (
        <div
          className={targetClassName}
          style={verticalDirection ? { bottom: targetPlacement } : { left: targetPlacement }}
          aria-valuenow={target}
          title={`target: ${(targetFormatter ?? valueFormatter)(target || 0)}`}
        >
          <Icon height={TARGET_SIZE} width={TARGET_SIZE} type="downArrow" color={color} />
        </div>
      )}
      <div
        className={barClassName}
        style={{ backgroundColor: color, ...percentProp }}
        role="meter"
        title={`value: ${valueFormatter(value)}`}
        aria-label={title ? `Percentage of ${title}` : 'Percentage'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      />
    </div>
  );
};
