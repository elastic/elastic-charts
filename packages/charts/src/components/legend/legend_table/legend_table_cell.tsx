/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

/** @public */
export type LegendTableCellProps = PropsWithChildren<{
  truncate?: boolean;
  className?: string;
}>;

/** @public */
export const LegendTableCell = ({ truncate = false, className, children }: LegendTableCellProps) => {
  const classes = classNames('echLegendTable__cell', className, {
    'echLegendTable__cell--truncate': truncate,
  });

  return (
    <div role="gridcell" className={classes}>
      {children}
    </div>
  );
};
