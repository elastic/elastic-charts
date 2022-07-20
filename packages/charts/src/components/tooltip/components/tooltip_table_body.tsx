/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { ReactNode } from 'react';

import { TooltipValue } from '../../../specs';
import { Logger } from '../../../utils/logger';
import { PropsOrChildrenWithProps } from '../types';
import { TooltipTableColumn } from './tooltip_table';
import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableRow } from './tooltip_table_row';

type TooltipTableBodyProps = PropsOrChildrenWithProps<
  {
    items: TooltipValue[];
    columns: TooltipTableColumn[];
  },
  {},
  {}
>;

/** @public */
export const TooltipTableBody = (props: TooltipTableBodyProps) => {
  const className = classNames('echTooltip__tableBody');
  if ('children' in props) {
    return <tbody className={className}>{props.children}</tbody>;
  }

  return (
    <tbody>
      {props.items.map((item, i) => {
        const { isHighlighted, color, isVisible } = item;
        if (!isVisible) return null;
        return (
          <TooltipTableRow key={i} color={color} isHighlighted={isHighlighted}>
            {props.columns.map(({ id, style, ...rest }, j) => {
              return (
                <TooltipTableCell style={style} key={id ?? `${i}:${j}`}>
                  {'renderCell' in rest ? rest.renderCell(item) : getValueFromItem(item, rest.accessor)}
                </TooltipTableCell>
              );
            })}
          </TooltipTableRow>
        );
      })}
    </tbody>
  );
};

function getValueFromItem(item: TooltipValue, accessor: string | number): ReactNode {
  if (item.datum.hasOwnProperty(accessor)) {
    return item.datum[accessor];
  } else {
    Logger.warn(`Missing value for accessor: ${accessor}. Please review tooltip table column configuration.`);
  }

  return null;
}
