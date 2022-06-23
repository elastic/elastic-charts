/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties } from 'react';

import { TooltipValue } from '../../../specs';
import { isNil } from '../../../utils/common';
import { PropsOrChildren } from '../types';
import { TooltipListItem } from './tooltip_list_item';
import { TooltipTableBody } from './tooltip_table_body';
import { TooltipTableHeader } from './tooltip_table_header';

type TooltipListContentProps = PropsOrChildren<{
  columns: string[];
  items: TooltipValue[];
  backgroundColor: string;
  renderItem?: typeof TooltipListItem;
}>;

type TooltipListProps = TooltipListContentProps & {
  maxHeight?: CSSProperties['maxHeight'];
};

/** @public */
export const TooltipTable = ({ maxHeight, ...props }: TooltipListProps) => {
  const className = classNames('echTooltip__table', { 'echTooltip__table--scrollable': !isNil(maxHeight) });
  if ('children' in props) {
    return (
      <table className={className} style={{ maxHeight }}>
        {props.children}
      </table>
    );
  }

  return (
    <table className={className} style={{ maxHeight }}>
      <TooltipTableHeader columns={props.columns} />
      <TooltipTableBody items={props.items} />
      {/* <TooltipTableFooter columns={props.columns} /> */}
    </table>
  );
};
