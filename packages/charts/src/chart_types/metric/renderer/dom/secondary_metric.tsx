/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { fillTextColor } from '../../../../common/fill_text_color';

interface BadgeProps {
  value: string;
  backgroundColor: string;
}

const Badge: React.FC<BadgeProps> = ({ value, backgroundColor }) => {
  const highContrastColor = fillTextColor(backgroundColor, backgroundColor);
  return (
    <span className="echBadge__content" style={{ backgroundColor }}>
      <span className="echBadge__text" style={{ color: highContrastColor.color.keyword }}>
        {value}
      </span>
    </span>
  );
};

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
}

/** @internal */
export const isSecondaryMetricProps = (props: any): props is SecondaryMetricProps => {
  return (
    props &&
    'value' in props &&
    typeof props.value === 'string' &&
    (props.prefix === undefined || typeof props.prefix === 'string') &&
    (props.badgeColor === undefined || typeof props.badgeColor === 'string')
  );
};

/** @internal */
export const SecondaryMetric: React.FC<SecondaryMetricProps> = ({
  value,
  label,
  badgeColor,
  valuePosition = 'after',
}) => {
  const valueNode = badgeColor ? <Badge value={value} backgroundColor={badgeColor} /> : value;

  return valuePosition === 'before' ? (
    <span>
      {valueNode} {label && ` ${label}`}
    </span>
  ) : (
    <span>
      {label && `${label} `} {valueNode}
    </span>
  );
};
