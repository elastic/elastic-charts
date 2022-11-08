/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import {
  CustomTooltip,
  TooltipHeader,
  TooltipTable,
  TooltipTableBody,
  TooltipTableHeader,
  TooltipTableFooter,
  TooltipTableRow,
  TooltipTableCell,
  TooltipTableColorCell,
} from '@elastic/charts';

import { tableSimple } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const pinned = boolean('pinned', false);

  const MyTooltip: CustomTooltip = ({ values, header }) => {
    const showColor = boolean('show color', true);
    const maxHeight = number('max table height', 120);
    return (
      <>
        <TooltipHeader header={header} />
        <TooltipTable gridTemplateColumns={`repeat(${showColor ? 4 : 3}, auto)`} maxHeight={maxHeight}>
          <TooltipTableHeader>
            <TooltipTableRow>
              {showColor && <TooltipTableColorCell />}
              <TooltipTableCell>X Value</TooltipTableCell>
              <TooltipTableCell>Y Value</TooltipTableCell>
              <TooltipTableCell>Z Value</TooltipTableCell>
            </TooltipTableRow>
          </TooltipTableHeader>
          <TooltipTableBody>
            {values.map(({ datum, seriesIdentifier: { key }, color }) => (
              <TooltipTableRow key={`${key}-${datum.x}`}>
                {showColor && <TooltipTableColorCell color={color} />}
                <TooltipTableCell>{datum.x}</TooltipTableCell>
                <TooltipTableCell>{datum.y}</TooltipTableCell>
                <TooltipTableCell>{datum.z}</TooltipTableCell>
              </TooltipTableRow>
            ))}
          </TooltipTableBody>
          <TooltipTableFooter>
            <TooltipTableRow>
              {showColor && <TooltipTableColorCell />}
              <TooltipTableCell>X Foot</TooltipTableCell>
              <TooltipTableCell>Y Foot</TooltipTableCell>
              <TooltipTableCell>Z Foot</TooltipTableCell>
            </TooltipTableRow>
          </TooltipTableFooter>
        </TooltipTable>
      </>
    );
  };
  return <TooltipShowcase info={tableSimple} customTooltip={MyTooltip} pinned={pinned} />;
};

Example.parameters = {
  markdown: `Tooltips may be composed with internal components to build out completely custom tooltips while maintaining a consistent style.\
  This example shows how you can build a tabular tooltip by structuring the table components explicitly within \`TooltipTable\` instead of using the \`columns\` option.`,
};
