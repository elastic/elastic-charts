/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { LegendTableBody } from './legend_table_body';
import { LegendTableHeader } from './legend_table_header';
import { LegendItem } from '../../../common/legend';
import { LayoutDirection } from '../../../utils/common';
import { SharedLegendItemProps } from '../types';

/** @internal */
export interface LegendTableProps extends SharedLegendItemProps {
  items: LegendItem[];
  seriesWidth?: number;
}

/** @internal */
export const GRID_COLOR_WIDTH = 10;
/** @internal */
export const GRID_ACTION_WIDTH = 26;
/** @internal */
export const MIN_LABEL_WIDTH = 24;

/** @internal */
export function LegendTable({ items, seriesWidth = MIN_LABEL_WIDTH, ...itemProps }: LegendTableProps) {
  const legendValuesLength = items?.[0]?.values.length ? `repeat(${items?.[0]?.values.length}, auto)` : '';
  const actionComponentWidth = itemProps.action ? `${GRID_ACTION_WIDTH}px` : '';
  const gridTemplateColumns = {
    vertical: `${GRID_COLOR_WIDTH}px minmax(${seriesWidth}px, 1fr) ${legendValuesLength} ${actionComponentWidth}`,
    horizontal: `${GRID_COLOR_WIDTH}px minmax(50%, 1fr) ${legendValuesLength} ${actionComponentWidth}`,
  };
  return (
    <div
      className="echLegendTable"
      role="table"
      style={{
        gridTemplateColumns:
          itemProps.positionConfig.direction === LayoutDirection.Horizontal
            ? gridTemplateColumns.horizontal
            : gridTemplateColumns.vertical,
      }}
    >
      <LegendTableHeader
        isMostlyRTL={itemProps.isMostlyRTL}
        hasAction={!!itemProps.action}
        legendValues={itemProps.legendValues}
        legendTitle={itemProps.legendTitle}
        labelOptions={itemProps.labelOptions}
      />
      <LegendTableBody items={items} {...itemProps} />
    </div>
  );
}
