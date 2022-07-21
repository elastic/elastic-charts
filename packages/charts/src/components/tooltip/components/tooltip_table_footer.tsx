/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum } from '../../../specs';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableColorCell } from './tooltip_table_color_cell';
import { TooltipTableRow } from './tooltip_table_row';
import { TooltipTableColumn } from './types';

type TooltipTableFooterProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<
  {
    columns: TooltipTableColumn<D, SI>[];
  },
  {},
  {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
  }
>;

/** @public */
export const TooltipTableFooter = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  maxHeight,
  className,
  ...props
}: TooltipTableFooterProps<D, SI>) => {
  const classes = classNames('echTooltip__tableFooter', className);
  if ('children' in props) {
    return (
      <tfoot className={classes} style={{ maxHeight }}>
        {props.children}
      </tfoot>
    );
  }

  if (props.columns.every((c) => !c.footer)) return null;

  return (
    <tfoot className={classes}>
      <TooltipTableRow maxHeight={maxHeight}>
        {props.columns.map(({ style, id, className: cn, type, footer }, i) => {
          const key = id ?? `${type}-${i}`;
          if (type === 'color') return <TooltipTableColorCell className={cn} style={style} key={key} />;
          return (
            <TooltipTableCell className={cn} style={style} key={id ?? key}>
              {footer ? (typeof footer === 'string' ? footer : footer()) : undefined}
            </TooltipTableCell>
          );
        })}
      </TooltipTableRow>
    </tfoot>
  );
};
