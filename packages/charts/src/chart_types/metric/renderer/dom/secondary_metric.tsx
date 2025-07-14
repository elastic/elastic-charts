/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

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
}) => {
  const valueNode = badgeColor ? (
    <Badge
      className="echSecondaryMetric__value"
      value={value}
      backgroundColor={badgeColor}
      borderColor={badgeBorderColor}
    />
  ) : (
    <span className="echSecondaryMetric__value echSecondaryMetric__truncate">{value}</span>
  );

  const isValueBeforeLabel = valuePosition === 'before';
  const labelNode = <span className="echSecondaryMetric__label echSecondaryMetric__truncate">{label}</span>;

  return (
    <span
      className="echSecondaryMetric"
      {...(style ? { style } : {})}
      {...(ariaDescription ? { 'aria-describedby': ariaDescription } : {})}
    >
      {isValueBeforeLabel && valueNode}
      {label && labelNode}
      {!isValueBeforeLabel && valueNode}
    </span>
  );
};
