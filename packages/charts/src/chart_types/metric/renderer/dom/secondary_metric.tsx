/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CSSProperties } from 'react';
import React from 'react';

import { Badge } from './badge';

const LABEL_MARGIN = 4;

/**
 *  Props for displaying a secondary metric value with optional label and badge styling.
 *
 * @internal
 * */
export interface SecondaryMetricProps {
  /**
   * The main value to display.
   */
  value: string;
  /**
   * Optional label to display alongside the value.
   */
  label?: string;
  /**
   * Optional background color for the value badge. If it's not provided no badge is displayed
   */
  badgeColor?: string;
  /**
   * Determines whether the value appears before or after the label. Defaults to 'after'.
   */
  valuePosition?: 'before' | 'after';
  style?: CSSProperties;
}

/** @internal */
export const isSecondaryMetricProps = (props: any): props is SecondaryMetricProps => {
  return (
    props &&
    'value' in props &&
    typeof props.value === 'string' &&
    (props.label === undefined || typeof props.label === 'string') &&
    (props.badgeColor === undefined || typeof props.badgeColor === 'string')
  );
};

/** @internal */
export const SecondaryMetric: React.FC<SecondaryMetricProps> = ({
  value,
  label,
  badgeColor,
  valuePosition = 'after',
  style,
}) => {
  const valueNode = badgeColor ? (
    <Badge value={value} backgroundColor={badgeColor} />
  ) : (
    <span className="echSecondaryMetric__value">{value}</span>
  );

  const isValueBeforeLabel = valuePosition === 'before';
  const labelNode = (
    <span
      className="echSecondaryMetric__label"
      style={isValueBeforeLabel ? { marginLeft: `${LABEL_MARGIN}px` } : { marginRight: `${LABEL_MARGIN}px` }}
    >
      {label}
    </span>
  );

  return (
    <span className="echSecondaryMetric" style={style}>
      {isValueBeforeLabel && valueNode}
      {label && labelNode}
      {!isValueBeforeLabel && valueNode}
    </span>
  );
};
