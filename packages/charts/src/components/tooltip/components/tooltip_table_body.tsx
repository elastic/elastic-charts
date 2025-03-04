/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { ReactNode } from 'react';
import React, { useRef } from 'react';

import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableColorCell } from './tooltip_table_color_cell';
import { TooltipTableRow } from './tooltip_table_row';
import type { TooltipCellStyle, TooltipTableColumn } from './types';
import type { SeriesIdentifier } from '../../../common/series_id';
import type { BaseDatum, TooltipValue } from '../../../specs';
import type { Datum } from '../../../utils/common';
import type { PropsOrChildrenWithProps, ToggleSelectedTooltipItemCallback } from '../types';

type TooltipTableBodyProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    items: TooltipValue<D, SI>[];
    columns: TooltipTableColumn<D, SI>[];
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
export const TooltipTableBody = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  className,
  ...props
}: TooltipTableBodyProps<D, SI>) => {
  function createItemId(item: TooltipValue<D, SI>) {
    return `${item.seriesIdentifier.key}-${item.label}-${item.value}`;
  }

  const tableBodyRef = useRef<HTMLTableSectionElement | null>(null);

  if ('children' in props) {
    const classes = classNames('echTooltip__tableBody', className);
    return (
      <div role="rowgroup" className={classes}>
        {props.children}
      </div>
    );
  }

  const { items, pinned, selected, onSelect, columns } = props;
  const classes = classNames('echTooltip__tableBody');
  // TODO: find a better way determine this from the data
  const allHighlighted = items.every((i) => i.isHighlighted);

  return (
    <div role="rowgroup" className={classes} ref={tableBodyRef}>
      {items.map((item) => {
        const { isHighlighted, isVisible, displayOnly } = item;
        if (!isVisible) return null;
        const itemId = createItemId(item);
        return (
          <TooltipTableRow
            key={itemId}
            isHighlighted={!pinned && !allHighlighted && isHighlighted}
            // Because of redux toolkit/immer's immutability, we need to check by
            // a unique identifier instead of the object reference.
            isSelected={pinned && selected.some((selectedItem) => createItemId(selectedItem) === itemId)}
            onSelect={displayOnly || !onSelect ? undefined : () => onSelect(item)}
          >
            {columns.map((column, j) => {
              return renderCellContent(item, column, column.id ?? `${column.type}-${j}`);
            })}
          </TooltipTableRow>
        );
      })}
    </div>
  );
};

function getCellStyles<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  style,
  type,
}: TooltipTableColumn<D, SI>): TooltipCellStyle {
  const textAlign: TooltipCellStyle['textAlign'] = type === 'number' ? 'right' : type === 'text' ? 'left' : undefined;

  return {
    textAlign,
    ...style,
  };
}

function renderCellContent<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  item: TooltipValue<D, SI>,
  column: TooltipTableColumn<D, SI>,
  key: string,
): ReactNode {
  if (column.type === 'color') {
    return <TooltipTableColorCell displayOnly={item.displayOnly} color={item.color} key={key} />;
  }

  return (
    <TooltipTableCell truncate={column.truncate} style={getCellStyles(column)} key={key}>
      {column.cell(item)}
    </TooltipTableCell>
  );
}
