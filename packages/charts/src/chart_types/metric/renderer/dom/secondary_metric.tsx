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
  valuePosition = 'after',
  style,
  ariaDescription,
  badgeBorderColor,
  icon,
  iconSide,
}) => {
  const isValueBeforeLabel = valuePosition === 'before';
  const hasLabel = !!label;

  // TODO: consider icon separated to we give priority when the value is too long

  const valueNode = badgeColor ? (
    <Badge
      className={classNames('echSecondaryMetric__value', {
        'echSecondaryMetric__value--full': !hasLabel,
      })}
      value={value}
      backgroundColor={badgeColor}
      borderColor={badgeBorderColor}
      icon={icon}
      iconSide={iconSide}
    />
  ) : (
    <span
      className={classNames('echSecondaryMetric__value', 'echSecondaryMetric__truncate', {
        'echSecondaryMetric__value--full': !hasLabel,
      })}
    >
      {value}
    </span>
  );

  return (
    <span
      className="echSecondaryMetric"
      {...(style ? { style } : {})}
      {...(ariaDescription ? { 'aria-describedby': ariaDescription } : {})}
    >
      {isValueBeforeLabel && valueNode}
      {hasLabel && <span className="echSecondaryMetric__label echSecondaryMetric__truncate">{label}</span>}
      {!isValueBeforeLabel && valueNode}
    </span>
  );
};
