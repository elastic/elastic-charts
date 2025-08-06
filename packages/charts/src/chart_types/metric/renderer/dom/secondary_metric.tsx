/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import { Badge } from './badge';
import type { SecondaryMetricProps } from '../../specs';

/** @internal */
export const SecondaryMetric: React.FC<SecondaryMetricProps> = ({
  value,
  label,
  badgeColor,
  labelPosition = 'before',
  style,
  ariaDescription,
  badgeBorderColor,
  icon,
  iconPosition,
}) => {
  const hasLabel = !!label;
  const labelNode = hasLabel ? (
    <span className="echSecondaryMetric__label echSecondaryMetric__truncate">{label}</span>
  ) : undefined;

  return (
    <span
      className="echSecondaryMetric"
      {...(style ? { style } : {})}
      {...(ariaDescription ? { 'aria-describedby': ariaDescription } : {})}
    >
      {labelPosition === 'before' && labelNode}
      {badgeColor ? (
        <Badge
          className={classNames('echSecondaryMetric__value', {
            'echSecondaryMetric__value--full': !hasLabel,
          })}
          value={value}
          backgroundColor={badgeColor}
          borderColor={badgeBorderColor}
          icon={icon}
          iconPosition={iconPosition}
        />
      ) : (
        <span
          className={classNames('echSecondaryMetric__value', 'echSecondaryMetric__truncate', {
            'echSecondaryMetric__value--full': !hasLabel,
          })}
        >
          {value}
        </span>
      )}
      {labelPosition === 'after' && labelNode}
    </span>
  );
};
