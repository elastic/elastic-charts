/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React from 'react';

import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableColorCell } from './tooltip_table_color_cell';
import { TooltipTableRow } from './tooltip_table_row';
import { TooltipTableColumn } from './types';
import { BaseDatum } from '../../../chart_types/specs';
import { SeriesIdentifier } from '../../../common/series_id';
import { TooltipValue } from '../../../specs';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';

type TooltipTableHeaderProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    columns: TooltipTableColumn<D, SI>[];
    items: TooltipValue<D, SI>[];
  },
  {},
  {
    className?: string;
  }
>;

/** @public */
export const TooltipTableHeader = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  className,
  ...props
}: TooltipTableHeaderProps<D, SI>) => {
  const classes = classNames('echTooltip__tableHeader', className);
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
      <TooltipTableRow>
        {props.columns.map(({ header, style, id, className: cn, type }, i) => {
          const key = id ?? `${type}-${i}`;
          if (type === 'color') return <TooltipTableColorCell className={cn} style={style} key={key} />;
          return (
            <TooltipTableCell className={cn} style={style} key={key}>
              {header ? (typeof header === 'string' ? header : header(props.items)) : undefined}
            </TooltipTableCell>
          );
        })}
      </TooltipTableRow>
    </div>
  );
};
