/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { TableBody } from './table_body';
import { TableFooter } from './table_footer';
import { TableHeader } from './table_header';
import { TableColumn } from './types';
import { SeriesIdentifier } from '../../common/series_id';
import { BaseDatum, TooltipValue } from '../../specs';
import { Datum, isNil } from '../../utils/common';
import { useTooltipContext } from '../tooltip/components/tooltip_provider';
import { PropsOrChildrenWithProps, ToggleSelectedTooltipItemCallback } from '../tooltip/types';

const TABLE_ITEM_HEIGHT = 20;
const TABLE_HEADER_HEIGHT = 25;
const TABLE_FOOTER_HEIGHT = 25;

/**
 * Manually synced with `$colorStripCheckWidth` scss var in [`_table.scss`](packages/charts/src/components/table/_table.scss)
 */
const COLOR_STRIP_CHECK_WIDTH = 11;

type TableProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = PropsOrChildrenWithProps<
  {
    columns: TableColumn<D, SI>[];
    items: TooltipValue<D, SI>[];
    pinned?: boolean;
    onSelect?: ToggleSelectedTooltipItemCallback;
    selected?: TooltipValue<D, SI>[];
  },
  {
    /**
     * Used to define the column widths, otherwise auto-generated
     */
    gridTemplateColumns: CSSProperties['gridTemplateColumns'];
  },
  {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
  }
>;

/** @public */
export const Table = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  className,
  ...props
}: TableProps<D, SI>) => {
  const tooltipContext = useTooltipContext<D, SI>();
  const pinned = props.pinned ?? tooltipContext.pinned;
  const wrapperClasses = classNames('echTable__tableWrapper', { 'echTable__tableWrapper--pinned': pinned });
  if ('children' in props) {
    const { gridTemplateColumns, maxHeight } = props;
    const classes = classNames('echTable__table', className, {
      'echTable__table--noGrid': !gridTemplateColumns,
    });
    return (
      <div className={wrapperClasses} style={{ maxHeight }}>
        <div role="table" className={classes} style={{ gridTemplateColumns }}>
          {props.children}
        </div>
      </div>
    );
  }
  const { items, onSelect, selected = [] } = { selected: tooltipContext.selected, ...props };
  const columns = props.columns.filter(({ hidden }) => {
    return !(typeof hidden === 'boolean' ? hidden : hidden?.(props.items) ?? false);
  });

  const gridTemplateColumns = columns
    .map(({ type, width }) => width ?? (type === 'color' ? COLOR_STRIP_CHECK_WIDTH : 'auto'))
    .map((width) => (typeof width === 'number' ? `${width}px` : width))
    .join(' ');

  return (
    <div className={wrapperClasses} style={{ maxHeight: props.maxHeight }}>
      <div role="table" className={classNames('echTable__table', className)} style={{ gridTemplateColumns }}>
        <TableHeader columns={columns} items={props.items} />
        <TableBody columns={columns} items={items} pinned={pinned} onSelect={onSelect} selected={selected} />
        <TableFooter columns={columns} items={props.items} />
      </div>
    </div>
  );
};

/** @internal */
export function computeTableMaxHeight<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  pinned: boolean,
  columns: TableColumn<D, SI>[],
  maxHeight: CSSProperties['maxHeight'],
  maxItems?: number,
): CSSProperties['maxHeight'] {
  if (pinned || isNil(maxItems)) return maxHeight;
  const headerHeight = +columns.some((c) => c.header) * TABLE_HEADER_HEIGHT;
  const bodyHeight = (Math.max(maxItems, 1) + 0.5) * TABLE_ITEM_HEIGHT;
  const footerHeight = +columns.some((c) => c.footer) * TABLE_FOOTER_HEIGHT;
  return headerHeight + bodyHeight + footerHeight;
}
