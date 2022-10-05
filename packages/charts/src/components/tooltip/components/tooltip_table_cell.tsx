/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, PropsWithChildren, useEffect } from 'react';

import { useTableColumnWidthContext } from './table_column_width_provider';
import { TooltipCellStyle } from './types';

/** @public */
export type TooltipTableCellProps = PropsWithChildren<{
  tagName?: 'td' | 'th';
  truncate?: boolean;
  width?: CSSProperties['gridTemplateColumns'];
  className?: string;
  style?: TooltipCellStyle;
}>;

/** @public */
export const TooltipTableCell = ({
  style,
  width = 'auto',
  truncate = false,
  tagName = 'td',
  className,
  children,
}: TooltipTableCellProps) => {
  const { rowCount, setGridTemplateColumns } = useTableColumnWidthContext();

  useEffect(() => {
    if (rowCount.current === 0) {
      setGridTemplateColumns((acc) => `${acc} ${typeof width === 'number' ? `${width}px` : width}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
