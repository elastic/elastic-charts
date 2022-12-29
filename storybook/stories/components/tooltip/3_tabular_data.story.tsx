/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  CustomTooltip,
  TooltipContainer,
  TooltipTable,
  TooltipTableColumn,
  XYChartSeriesIdentifier,
} from '@elastic/charts';

import { tableMultipleX } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const pinned = boolean('pinned', false);

  const MyTooltip: CustomTooltip<any, XYChartSeriesIdentifier> = ({ values }) => {
    const showColor = boolean('show color', true);
    const columns: TooltipTableColumn<any, XYChartSeriesIdentifier>[] = [
      { type: 'custom', header: 'X Value', cell: ({ datum }) => datum.x },
      { type: 'custom', header: 'Y Value', cell: ({ datum }) => datum.y },
      { type: 'custom', header: 'Z Value', cell: ({ datum }) => datum.z },
    ];

    if (showColor) {
      columns.unshift({ type: 'color' });
    }

    return (
      <TooltipContainer>
        <TooltipTable items={values} columns={columns} />
      </TooltipContainer>
    );
  };
  return <TooltipShowcase info={tableMultipleX} customTooltip={MyTooltip} pinned={pinned} />;
};

Example.parameters = {
  background: { disable: true },
};
