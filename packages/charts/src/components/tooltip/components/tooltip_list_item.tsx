/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { TooltipValue } from '../../../specs';
import { isDefined } from '../../../utils/common';

interface TooltipListItemProps {
  index: number;
  item: TooltipValue;
  className: string;
  backgroundColor: string;
}

/** @public */
export const TooltipListItem = ({
  item: { label, markValue, formattedValue, formattedMarkValue, color },
  className,
  backgroundColor,
}: TooltipListItemProps) => (
  <div
    className={className}
    style={{
      borderLeftColor: color,
    }}
  >
    <div className="echTooltip__item--backgroundColor" style={{ backgroundColor }}>
      <div className="echTooltip__item--color" style={{ backgroundColor: color }} />
    </div>

    <div className="echTooltip__item--container">
      <span className="echTooltip__label">{label}</span>
      <span className="echTooltip__value">{formattedValue}</span>
      {isDefined(markValue) && <span className="echTooltip__markValue">&nbsp;({formattedMarkValue})</span>}
    </div>
  </div>
);
