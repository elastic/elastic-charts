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

type TooltipTableCellContentProps = PropsOrChildren<{
  content: string;
  renderItem?: typeof TooltipListItem;
}>;

type TooltipTableCellProps = TooltipTableCellContentProps & {
  maxHeight?: CSSProperties['maxHeight'];
  className?: string;
  backgroundColor?: string;
};

/** @public */
export const TooltipTableCell = ({ maxHeight, className, backgroundColor, ...props }: TooltipTableCellProps) => {
  const classes = classNames('echTooltip__tableCell', className, {
    'echTooltip__tableCell--scrollable': !isNil(maxHeight),
  });
  if ('children' in props) {
    return (
      <td className={classes} style={{ maxHeight, backgroundColor }}>
        {props.children}
      </td>
    );
  }

  return (
    <td className={classes} style={{ maxHeight, backgroundColor }}>
      {props.content}
    </td>
  );
};
