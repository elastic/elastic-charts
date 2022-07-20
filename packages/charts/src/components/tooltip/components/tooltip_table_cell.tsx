/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, PropsWithChildren } from 'react';

/** @public */
export type TooltipCellStyle = Pick<
  CSSProperties,
  'maxHeight' | 'textAlign' | 'padding' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
>;

type TooltipTableCellProps = PropsWithChildren<{
  tagName?: 'td' | 'th';
  className?: string;
  style?: TooltipCellStyle;
}>;

/** @public */
export const TooltipTableCell = ({ className, tagName = 'td', ...props }: TooltipTableCellProps) => {
  const classes = classNames('echTooltip__tableCell', className);
  const style: CSSProperties = {
    ...props.style,
    textAlign: 'right',
  };
  if (tagName === 'th') {
    return (
      <th className={classes} style={style}>
        {props.children}
      </th>
    );
  }
  return (
    <td className={classes} style={style}>
      {props.children}
    </td>
  );
};
