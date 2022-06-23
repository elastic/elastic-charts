/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { TooltipValue } from '../../../specs/settings';
import { isNil } from '../../../utils/common';
import { PropsOrChildren } from '../types';
import { TooltipListItem } from './tooltip_list_item';
import { TooltipTableCell } from './tooltip_table_cell';
import { TooltipTableRow } from './tooltip_table_row';

type TooltipTableBodyContentProps = PropsOrChildren<{
  items: TooltipValue[];
  renderItem?: typeof TooltipListItem;
}>;

type TooltipTableBodyProps = TooltipTableBodyContentProps & {
  maxHeight?: CSSProperties['maxHeight'];
};

/** @public */
export const TooltipTableBody = ({ maxHeight, ...props }: TooltipTableBodyProps) => {
  const className = classNames('echTooltip__tableFooter', { 'echTooltip__tableFooter--scrollable': !isNil(maxHeight) });
  if ('children' in props) {
    return (
      <tbody className={className} style={{ maxHeight }}>
        <TooltipTableCell className="colorStripe"> </TooltipTableCell>
        {props.children}
      </tbody>
    );
  }

  return (
    <tbody>
      {props.items.map(({ datum, color }, i) => (
        <TooltipTableRow color={color} key={i}>
          <TooltipTableCell className="colorStripe" backgroundColor={color}>
            {' '}
          </TooltipTableCell>
          <TooltipTableCell>{datum.x}</TooltipTableCell>
          <TooltipTableCell>{datum.y}</TooltipTableCell>
          <TooltipTableCell>{datum.z}</TooltipTableCell>
        </TooltipTableRow>
      ))}
    </tbody>
  );
};
