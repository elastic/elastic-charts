/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { ReactNode } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { onTooltipItemSelected } from '../../../state/actions/tooltip';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableColorCell } from './tooltip_table_color_cell';
import { TooltipTableRow } from './tooltip_table_row';
import { TooltipCellStyle, TooltipTableColumn } from './types';

type TooltipTableBodyProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    items: TooltipValue<D, SI>[];
    columns: TooltipTableColumn<D, SI>[];
    pinned: boolean;
    onSelect: typeof onTooltipItemSelected;
    selected: SeriesIdentifier[];
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
  if ('children' in props) {
    const classes = classNames('echTooltip__tableBody', className);
    return <tbody className={classes}>{props.children}</tbody>;
  }

  const highlightedCount = props.items.reduce((acc, { isHighlighted }) => acc + (isHighlighted ? 1 : 0), 0);
  const noneHighlighted = highlightedCount === 0;
  const tooManyHighlighted = highlightedCount > 3;
  const canShowAll = props.items.length <= 3;
  const classes = classNames('echTooltip__tableBody', {
    'echTooltip__tableBody--limited': !props.pinned && !canShowAll && (noneHighlighted || tooManyHighlighted),
    'echTooltip__tableBody--pinned': props.pinned,
  });

  return (
    <tbody className={classes}>
      {props.items.map((item, i) => {
        const { isHighlighted, isVisible } = item;
        if (!isVisible) return null;
        return (
          <TooltipTableRow
            key={i}
            isHighlighted={!props.pinned && isHighlighted}
            isSelected={props.pinned && props.selected.some(({ key }) => key === item.seriesIdentifier.key)}
            onSelect={() => props.onSelect(item.seriesIdentifier)}
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
    return <TooltipTableColorCell color={item.color} key={key} />;
  }

  return (
    <TooltipTableCell style={getCellStyles(column)} key={key}>
      {column.cell(item)}
    </TooltipTableCell>
  );
}
