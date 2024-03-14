/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import { TableCell } from './table_cell';
import { TableColorCell } from './table_color_cell';
import { TableRow } from './table_row';
import { TableColumn } from './types';
import { SeriesIdentifier } from '../../common/series_id';
import { BaseDatum, TooltipValue } from '../../specs';
import { Datum } from '../../utils/common';
import { PropsOrChildrenWithProps } from '../tooltip/types';

type TableHeaderProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    columns: TableColumn<D, SI>[];
    items: TooltipValue<D, SI>[];
  },
  {},
  {
    className?: string;
  }
>;

/** @public */
export const TableHeader = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  className,
  ...props
}: TableHeaderProps<D, SI>) => {
  const classes = classNames('echTable__tableHeader', className);
  if ('children' in props) {
    return (
      <div role="rowgroup" className={classes}>
        {props.children}
      </div>
    );
  }

  if (props.columns.every((c) => !c.header)) return null;

  return (
    <div role="rowgroup" className={classes}>
      <TableRow>
        {props.columns.map(({ header, style, id, className: cn, type }, i) => {
          const key = id ?? `${type}-${i}`;
          if (type === 'color') return <TableColorCell className={cn} style={style} key={key} />;
          return (
            <TableCell className={cn} style={style} key={key}>
              {header ? (typeof header === 'string' ? header : header(props.items)) : undefined}
            </TableCell>
          );
        })}
      </TableRow>
    </div>
  );
};
