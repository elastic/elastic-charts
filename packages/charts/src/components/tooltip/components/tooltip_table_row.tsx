/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { Color } from '../../../common/colors';
import { isNil } from '../../../utils/common';
import { PropsOrChildren } from '../types';
import { TooltipListItem } from './tooltip_list_item';
import { TooltipTableCell } from './tooltip_table_cell';

type TooltipTableRowContentProps = PropsOrChildren<{
  renderItem?: typeof TooltipListItem;
}>;

type TooltipTableRowProps = TooltipTableRowContentProps & {
  maxHeight?: CSSProperties['maxHeight'];
  color?: Color;
};

/** @public */
export const TooltipTableRow = ({ maxHeight, color, ...props }: TooltipTableRowProps) => {
  const className = classNames('echTooltip__tableRow', { 'echTooltip__tableRow--scrollable': !isNil(maxHeight) });
  if ('children' in props) {
    return (
      <tr className={className} style={{ maxHeight, borderColor: color }}>
        {props.children}
      </tr>
    );
  }

  return (
    <>
      {[1].map((_, i) => (
        <TooltipTableCell key={i}>TODO</TooltipTableCell>
      ))}
    </>
  );
};
