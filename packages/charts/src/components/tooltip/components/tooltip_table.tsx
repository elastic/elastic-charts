/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, ReactNode } from 'react';

import { TooltipValue } from '../../../specs';
import { isNil } from '../../../utils/common';
import { PropsOrChildren } from '../types';
import { TooltipTableBody } from './tooltip_table_body';
import { TooltipTableFooter } from './tooltip_table_footer';
import { TooltipTableHeader } from './tooltip_table_header';

/**
 * Column definition for tooltip table
 * @alpha
 */
export type TooltipTableColumn = {
  id?: string;
  className?: string;
  textAlign?: CSSProperties['textAlign'];
  header?: string | (() => string);
  footer?: string | (() => string);
  hidden?: boolean | ((items: TooltipValue[]) => boolean);
} & (
  | {
      accessor: string | number;
    }
  | {
      renderCell: (item: TooltipValue) => ReactNode;
    }
);

type TooltipListContentProps = PropsOrChildren<{
  columns: TooltipTableColumn[];
  items: TooltipValue[];
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

  const columns = props.columns.filter(({ hidden }) => {
    return !(typeof hidden === 'boolean' ? hidden : hidden?.(props.items) ?? false);
  });

  return (
    <table className={className} style={{ maxHeight }}>
      <TooltipTableHeader columns={columns} />
      <TooltipTableBody columns={columns} items={props.items} />
      <TooltipTableFooter columns={columns} />
    </table>
  );
};
