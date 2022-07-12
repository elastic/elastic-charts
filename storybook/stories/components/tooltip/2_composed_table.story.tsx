/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  TooltipWrapper,
  CustomTooltip,
  TooltipHeader,
  TooltipTable,
  TooltipTableBody,
  TooltipTableHeader,
  TooltipTableFooter,
  TooltipTableRow,
  TooltipTableCell,
} from '@elastic/charts';

import { tableSimple } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const MyTooltip: CustomTooltip = ({ values, header }) => {
    return (
      <TooltipWrapper>
        <TooltipHeader header={header} />
        <TooltipTable>
          <TooltipTableHeader>
            <TooltipTableRow>
              <TooltipTableCell>X Value</TooltipTableCell>
              <TooltipTableCell>Y Value</TooltipTableCell>
              <TooltipTableCell>Z Value</TooltipTableCell>
            </TooltipTableRow>
          </TooltipTableHeader>
          <TooltipTableBody>
            {values.map(({ datum, seriesIdentifier: { key }, color }) => (
              <TooltipTableRow key={`${key}-${datum.x}`} color={color}>
                <TooltipTableCell>{datum.x}</TooltipTableCell>
                <TooltipTableCell>{datum.y}</TooltipTableCell>
                <TooltipTableCell>{datum.z}</TooltipTableCell>
              </TooltipTableRow>
            ))}
          </TooltipTableBody>
          <TooltipTableFooter>
            <TooltipTableRow>
              <TooltipTableCell>X Foot</TooltipTableCell>
              <TooltipTableCell>Y Foot</TooltipTableCell>
              <TooltipTableCell>Z Foot</TooltipTableCell>
            </TooltipTableRow>
          </TooltipTableFooter>
        </TooltipTable>
      </TooltipWrapper>
    );
  };
  return <TooltipShowcase info={tableSimple} customTooltip={MyTooltip} />;
};

Example.parameters = {
  markdown: `Tooltips may be composed with internal components to build out completely custom tooltips while maintaining a consistent style.\
  This example shows how you can build a tabular tooltip by structuring the table components explicitly within \`TooltipTable\` instead of using the \`columns\` option.`,
};
