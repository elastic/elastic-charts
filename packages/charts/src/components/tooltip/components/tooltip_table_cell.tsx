/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import { TooltipCellStyle } from './types';

/** @public */
export type TooltipTableCellProps = PropsWithChildren<{
  tagName?: 'td' | 'th';
  truncate?: boolean;
  className?: string;
  style?: TooltipCellStyle;
}>;

/** @public */
export const TooltipTableCell = ({
  style,
  truncate = false,
  tagName = 'td',
  className,
  children,
}: TooltipTableCellProps) => {
  const classes = classNames('echTooltip__tableCell', className, {
    'echTooltip__tableCell--truncate': truncate,
  });

  if (tagName === 'th') {
    return (
      <th className={classes} style={style}>
        {children}
      </th>
    );
  }
  return (
    <td className={classes} style={style}>
      {children}
    </td>
  );
};
