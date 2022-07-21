/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, PropsWithChildren } from 'react';

import { isNil } from '../../../utils/common';

type TooltipTableRowProps = PropsWithChildren<{
  className?: string;
  isHighlighted?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
}>;

/** @public */
export const TooltipTableRow = ({ maxHeight, isHighlighted = false, children, className }: TooltipTableRowProps) => {
  const classes = classNames('echTooltip__tableRow', className, {
    'echTooltip__tableRow--scrollable': !isNil(maxHeight),
    'echTooltip__tableRow--highlighted': isHighlighted,
  });

  return (
    <tr className={classes} style={{ maxHeight }}>
      {children}
    </tr>
  );
};
