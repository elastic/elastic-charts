/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { TooltipTable, TooltipTableColumn, XYChartSeriesIdentifier } from '@elastic/charts';

import { tableMultipleX } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const showColor = boolean('show color', true);
  const columns: TooltipTableColumn<any, XYChartSeriesIdentifier>[] = [
    { type: 'number', header: 'Value A', cell: ({ datum }) => datum.x },
    { type: 'number', header: 'Value B', cell: ({ datum }) => datum.y },
    { type: 'number', header: 'sum(A,B)', cell: ({ datum }) => datum.x + datum.y },
    { type: 'number', header: 'avg(A,B)', cell: ({ datum }) => ((datum.x + datum.y) / 2).toFixed(1) },
  ];
  if (showColor) {
    columns.unshift({ type: 'color' });
  }

  return (
    <TooltipShowcase
      info={tableMultipleX}
      tooltip={{ body: ({ items }) => <TooltipTable items={items} columns={columns} /> }}
    />
  );
};

Example.parameters = {
  showHeader: true,
  background: { disable: true },
};
