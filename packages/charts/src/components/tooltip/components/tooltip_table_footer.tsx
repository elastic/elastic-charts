/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { isNil } from '../../../utils/common';
import { PropsOrChildren } from '../types';
import { TooltipListItem } from './tooltip_list_item';
import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableRow } from './tooltip_table_row';

type TooltipTableFooterContentProps = PropsOrChildren<{
  columns: string[];
  renderItem?: typeof TooltipListItem;
}>;

type TooltipTableFooterProps = TooltipTableFooterContentProps & {
  maxHeight?: CSSProperties['maxHeight'];
};

/** @public */
export const TooltipTableFooter = ({ maxHeight, ...props }: TooltipTableFooterProps) => {
  const className = classNames('echTooltip__tableFooter', { 'echTooltip__tableFooter--scrollable': !isNil(maxHeight) });
  if ('children' in props) {
    return (
      <tfoot className={className} style={{ maxHeight }}>
        <TooltipTableCell> </TooltipTableCell>
        {props.children}
      </tfoot>
    );
  }

  return (
    <tfoot>
      <TooltipTableRow>
        <TooltipTableCell className="colorStripe"> </TooltipTableCell>
        {props.columns.map((column) => (
          <TooltipTableCell key={column}>{column}</TooltipTableCell>
        ))}
      </TooltipTableRow>
    </tfoot>
  );
};
