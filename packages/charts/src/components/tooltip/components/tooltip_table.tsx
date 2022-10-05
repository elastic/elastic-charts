/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, useState } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { onTooltipItemSelected } from '../../../state/actions/tooltip';
import { Datum, isNil } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { TableColumnWidthProvider } from './table_column_width_provider';
import { useTooltipContext } from './tooltip_provider';
import { TooltipTableBody } from './tooltip_table_body';
import { TooltipTableFooter } from './tooltip_table_footer';
import { TooltipTableHeader } from './tooltip_table_header';
import { TooltipTableColumn } from './types';

type TooltipTableProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    columns: TooltipTableColumn<D, SI>[];
    items: TooltipValue<D, SI>[];
    pinned?: boolean;
    onSelect?: typeof onTooltipItemSelected | ((...args: Parameters<typeof onTooltipItemSelected>) => void);
    selected?: TooltipValue<D, SI>[];
  },
  {
    /**
     * Used to defined the column widths, otherwise auto-generated
     */
    gridTemplateColumns?: CSSProperties['gridTemplateColumns'];
  },
  {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
  }
>;

/** @public */
export const TooltipTable = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  className,
  ...props
}: TooltipTableProps<D, SI>) => {
  const { theme } = useTooltipContext<D, SI>();
  const maxHeight = props.maxHeight ?? theme.maxTableHeight;
  const [autoGridTemplateColumns, setGridTemplateColumns] = useState<CSSProperties['gridTemplateColumns']>('');

  if ('children' in props) {
    const gridTemplateColumns = props.gridTemplateColumns ?? autoGridTemplateColumns;
    const classes = classNames('echTooltip__table', className, {
      'echTooltip__table--noGrid': !gridTemplateColumns,
    });
    return (
      <TableColumnWidthProvider
        disabled={!isNil(props.gridTemplateColumns)}
        gridTemplateColumns={autoGridTemplateColumns}
        setGridTemplateColumns={setGridTemplateColumns}
      >
        <div className="echTooltip__tableWrapper" style={{ maxHeight }}>
          <table className={classes} style={{ gridTemplateColumns }}>
            {props.children}
          </table>
        </div>
      </TableColumnWidthProvider>
    );
  }

  const columns = props.columns.filter(({ hidden }) => {
    return !(typeof hidden === 'boolean' ? hidden : hidden?.(props.items) ?? false);
  });

  const { items, pinned = false, onSelect, selected = [] } = props;
  // const gridTemplateColumns = `repeat(${columns.length}, auto)`;
  const gridTemplateColumns = columns
    .map(({ type, width }) => (width ?? type === 'color' ? 10 : 'auto'))
    .map((width) => `${typeof width === 'number' ? `${width}px` : width}`)
    .join(' ');

  return (
    <TableColumnWidthProvider disabled>
      <div className="echTooltip__tableWrapper" style={{ maxHeight }}>
        <table className={classNames('echTooltip__table', className)} style={{ gridTemplateColumns }}>
          <TooltipTableHeader columns={columns} items={props.items} />
          <TooltipTableBody columns={columns} items={items} pinned={pinned} onSelect={onSelect} selected={selected} />
          <TooltipTableFooter columns={columns} items={props.items} />
        </table>
      </div>
    </TableColumnWidthProvider>
  );
};
