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
import { BaseDatum, TooltipValue } from '../../../specs';
import { Datum, isNil } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
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
  },
  {},
  {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
  }
>;

/** @public */
export const TooltipTable = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  maxHeight,
  className,
  ...props
}: TooltipTableProps<D, SI>) => {
  const classes = classNames('echTooltip__table', className, {
    'echTooltip__table--scrollable': !isNil(maxHeight),
  });

  if ('children' in props) {
    return (
      <table className={classes} style={{ maxHeight }}>
        {props.children}
      </table>
    );
  }

  const columns = props.columns.filter(({ hidden }) => {
    return !(typeof hidden === 'boolean' ? hidden : hidden?.(props.items) ?? false);
  });

  return (
    <table className={classes} style={{ maxHeight }}>
      <TooltipTableHeader columns={columns} items={props.items} />
      <TooltipTableBody columns={columns} items={props.items} />
      <TooltipTableFooter columns={columns} items={props.items} />
    </table>
  );
};
