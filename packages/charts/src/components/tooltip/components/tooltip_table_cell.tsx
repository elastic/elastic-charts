/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { PropsOrChildren } from '../types';

type TooltipTableCellContentProps = PropsOrChildren<{
  content: string;
}>;

type TooltipTableCellProps = TooltipTableCellContentProps & {
  maxHeight?: CSSProperties['maxHeight'];
  textAlign?: CSSProperties['textAlign'];
  padding?: CSSProperties['padding'];
  className?: string;
};

/** @public */
export const TooltipTableCell = ({
  className,
  maxHeight,
  textAlign = 'right',
  padding,
  ...props
}: TooltipTableCellProps) => {
  const classes = classNames('echTooltip__tableCell', className);
  if ('children' in props) {
    return (
      <td className={classes} style={{ maxHeight, textAlign, padding }}>
        {props.children}
      </td>
    );
  }

  return (
    <td className={classes} style={{ maxHeight, textAlign, padding }}>
      {props.content}
    </td>
  );
};
