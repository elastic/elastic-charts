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

type TooltipTableHeaderProps = PropsOrChildrenWithProps<
  {
    columns: TooltipTableColumn[];
  },
  {},
  {
    maxHeight?: CSSProperties['maxHeight'];
    textAlign?: CSSProperties['textAlign'];
    padding?: CSSProperties['padding'];
  }
>;

/** @public */
export const TooltipTableHeader = ({ maxHeight, ...props }: TooltipTableHeaderProps) => {
  const className = classNames('echTooltip__tableHeader');
  if ('children' in props) {
    return (
      <thead className={className} style={{ maxHeight }}>
        {props.children}
      </thead>
    );
  }

  if (!props.columns.some((c) => c.header)) return null;

  return (
    <thead className={className} style={{ maxHeight }}>
      <TooltipTableRow>
        {props.columns.map(({ header, textAlign, id }) => {
          if (!header) return null;
          const headerStr = typeof header === 'string' ? header : header();
          return (
            <TooltipTableCell textAlign={textAlign ?? props.textAlign} key={id ?? headerStr}>
              {headerStr}
            </TooltipTableCell>
          );
        })}
      </TooltipTableRow>
    </thead>
  );
};
