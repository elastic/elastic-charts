/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { ReactNode, useRef } from 'react';

import { TableCell } from './table_cell';
import { TableColorCell } from './table_color_cell';
import { TableRow } from './table_row';
import { TableCellStyle, TableColumn } from './types';
import { SeriesIdentifier } from '../../common/series_id';
import { BaseDatum, TooltipValue } from '../../specs';
import { Datum } from '../../utils/common';
import { PropsOrChildrenWithProps, ToggleSelectedTooltipItemCallback } from '../tooltip/types';

type TableBodyProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    items: TooltipValue<D, SI>[];
    columns: TableColumn<D, SI>[];
    pinned?: boolean;
    onSelect?: ToggleSelectedTooltipItemCallback;
    selected: TooltipValue<D, SI>[];
  },
  {},
  {
    className?: string;
  }
>;

/** @public */
export const TableBody = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  className,
  ...props
}: TableBodyProps<D, SI>) => {
  const tableBodyRef = useRef<HTMLTableSectionElement | null>(null);

  if ('children' in props) {
    const classes = classNames('echTable__tableBody', className);
    return (
      <div role="rowgroup" className={classes}>
        {props.children}
      </div>
    );
  }

  const { items, pinned, selected, onSelect, columns } = props;
  const classes = classNames('echTable__tableBody');
  // TODO: find a better way determine this from the data
  const allHighlighted = items.every((i) => i.isHighlighted);

  return (
    <div role="rowgroup" className={classes} ref={tableBodyRef}>
      {items.map((item) => {
        const { isHighlighted, isVisible, displayOnly } = item;
        if (!isVisible) return null;
        return (
          <TableRow
            key={`${item.seriesIdentifier.key}-${item.label}-${item.value}`}
            isHighlighted={!pinned && !allHighlighted && isHighlighted}
            isSelected={pinned && selected.includes(item)}
            onSelect={displayOnly || !onSelect ? undefined : () => onSelect(item)}
          >
            {columns.map((column, j) => {
              return renderCellContent(item, column, column.id ?? `${column.type}-${j}`);
            })}
          </TableRow>
        );
      })}
    </div>
  );
};

function getCellStyles<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  style,
  type,
}: TableColumn<D, SI>): TableCellStyle {
  const textAlign: TableCellStyle['textAlign'] = type === 'number' ? 'right' : type === 'text' ? 'left' : undefined;

  return {
    textAlign,
    ...style,
  };
}

function renderCellContent<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  item: TooltipValue<D, SI>,
  column: TableColumn<D, SI>,
  key: string,
): ReactNode {
  if (column.type === 'color') {
    return <TableColorCell displayOnly={item.displayOnly} color={item.color} key={key} />;
  }

  return (
    <TableCell truncate={column.truncate} style={getCellStyles(column)} key={key}>
      {column.cell(item)}
    </TableCell>
  );
}
