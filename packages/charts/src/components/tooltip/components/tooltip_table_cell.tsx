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
import { isNonNullablePrimitiveValue } from '../../../utils/common';

/** @public */
export type TooltipTableCellProps = PropsWithChildren<{
  tagName?: 'td' | 'th';
  truncate?: boolean;
  className?: string;
  title?: string;
  style?: TooltipCellStyle;
}>;

/** @public */
export const TooltipTableCell = ({
  style,
  truncate = false,
  tagName = 'td',
  className,
  children,
  title: manualTitle,
}: TooltipTableCellProps) => {
  const classes = classNames('echTooltip__tableCell', className, {
    'echTooltip__tableCell--truncate': truncate,
  });

  const title = manualTitle ?? (truncate && isNonNullablePrimitiveValue(children) ? `${children}` : undefined);
  return (
    <div role={tagName === 'th' ? 'rowheader' : 'gridcell'} className={classes} style={style} title={title}>
      {children}
    </div>
  );
};
