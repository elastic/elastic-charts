/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, ReactNode, useRef } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { onTooltipItemSelected } from '../../../state/actions/tooltip';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { useTooltipContext } from './tooltip_provider';
import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableColorCell } from './tooltip_table_color_cell';
import { TooltipTableRow } from './tooltip_table_row';
import { TooltipCellStyle, TooltipTableColumn } from './types';

const getRowId = (i: number) => `table-scroll-to-row-${i}`;

type TooltipTableBodyProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    items: TooltipValue<D, SI>[];
    columns: TooltipTableColumn<D, SI>[];
    pinned: boolean;
    onSelect: typeof onTooltipItemSelected | ((...args: Parameters<typeof onTooltipItemSelected>) => void);
    selected: TooltipValue<D, SI>[];
  },
  {},
  {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
  }
>;

/** @public */
export const TooltipTableBody = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  className,
  ...props
}: TooltipTableBodyProps<D, SI>) => {
  const { theme, pinned } = useTooltipContext<D, SI>();
  const maxHeight = pinned ? props.maxHeight ?? theme.maxTableBodyHeight : undefined;
  const tableBodyRef = useRef<HTMLTableSectionElement | null>(null);

  if ('children' in props) {
    const classes = classNames('echTooltip__tableBody', className);
    return (
      <tbody className={classes} style={{ maxHeight }}>
        {props.children}
      </tbody>
    );
  }

  const classes = classNames('echTooltip__tableBody');

  return (
    <tbody className={classes} ref={tableBodyRef} style={{ maxHeight }}>
      {props.items.map((item, i) => {
        const { isHighlighted, isVisible, displayOnly } = item;
        if (!isVisible) return null;
        return (
          <TooltipTableRow
            key={`${item.seriesIdentifier.key}-${item.value}`}
            id={getRowId(i)}
            isHighlighted={!props.pinned && isHighlighted}
            isSelected={props.pinned && props.selected.includes(item)}
            onSelect={displayOnly ? undefined : () => props.onSelect(item)}
          >
            {props.columns.map((column, j) => {
              return renderCellContent(item, column, column.id ?? `${column.type}-${j}`);
            })}
          </TooltipTableRow>
        );
      })}
    </tbody>
  );
};

function getCellStyles<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  style,
  type,
}: TooltipTableColumn<D, SI>): TooltipCellStyle {
  const textAlign: TooltipCellStyle['textAlign'] = type === 'number' ? 'left' : type === 'text' ? 'right' : undefined;

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
    <TooltipTableCell style={getCellStyles(column)} key={key}>
      {column.cell(item)}
    </TooltipTableCell>
  );
}
