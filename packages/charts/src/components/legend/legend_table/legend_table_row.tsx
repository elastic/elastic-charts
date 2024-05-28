/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

interface LegendTableRowProps extends React.HTMLAttributes<HTMLDivElement> {}

/** @public */
export const LegendTableRow = ({ id, children, className, ...rest }: LegendTableRowProps) => {
  const classes = classNames('echLegendTable__row', className);

  return (
    <div role="row" id={id} className={classes} {...rest}>
      {children}
    </div>
  );
};
