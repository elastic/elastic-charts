/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { PropsOrChildrenWithProps } from '../types';
import { TooltipTableColumn } from './tooltip_table';
import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableRow } from './tooltip_table_row';

type TooltipTableFooterProps = PropsOrChildrenWithProps<
  {
    columns: TooltipTableColumn[];
    textAlign?: CSSProperties['textAlign'];
  },
  {},
  {
    maxHeight?: CSSProperties['maxHeight'];
  }
>;

/** @public */
export const TooltipTableFooter = ({ maxHeight, ...props }: TooltipTableFooterProps) => {
  const className = classNames('echTooltip__tableFooter');
  if ('children' in props) {
    return (
      <tfoot className={className} style={{ maxHeight }}>
        {props.children}
      </tfoot>
    );
  }

  if (!props.columns.some((c) => c.footer)) return null;

  return (
    <tfoot>
      <TooltipTableRow maxHeight={maxHeight}>
        {props.columns.map(({ footer, textAlign, id, className }) => {
          if (!footer) return null;
          const footerStr = typeof footer === 'string' ? footer : footer();
          return (
            <TooltipTableCell className={className} textAlign={textAlign ?? props.textAlign} key={id ?? footerStr}>
              {footerStr}
            </TooltipTableCell>
          );
        })}
      </TooltipTableRow>
    </tfoot>
  );
};
