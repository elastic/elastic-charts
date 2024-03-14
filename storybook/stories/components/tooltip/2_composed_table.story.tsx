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
  Table,
  TableBody,
  TableHeader,
  TableFooter,
  TableRow,
  TableCell,
  TableColorCell,
  TooltipSpec,
  TableCellStyle,
} from '@elastic/charts';

import { tableSimple } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const pinned = boolean('pinned', false);
  const showColor = boolean('show color', true);
  const maxHeight = number('max table height', 120);
  const style: TableCellStyle = { textAlign: 'right' };

  const TooltipBody: TooltipSpec['body'] = ({ items }) => {
    return (
      <Table gridTemplateColumns={`repeat(${showColor ? 4 : 3}, auto)`} maxHeight={maxHeight}>
        <TableHeader>
          <TableRow>
            {showColor && <TableColorCell />}
            <TableCell>X Value</TableCell>
            <TableCell>Y Value</TableCell>
            <TableCell>Z Value</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(({ datum, seriesIdentifier: { key }, color }) => (
            <TableRow key={`${key}-${datum.x}`}>
              {showColor && <TableColorCell color={color} />}
              <TableCell style={style}>{datum.x}</TableCell>
              <TableCell style={style}>{datum.y}</TableCell>
              <TableCell style={style}>{datum.z}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            {showColor && <TableColorCell />}
            <TableCell style={style}>{items.reduce((s, { datum: { x } }) => s + x, 0)}</TableCell>
            <TableCell style={style}>{items.reduce((s, { datum: { y } }) => s + y, 0)}</TableCell>
            <TableCell style={style}>{items.reduce((s, { datum: { z } }) => s + z, 0)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  };
  return <TooltipShowcase info={tableSimple} pinned={pinned} tooltip={{ body: TooltipBody }} />;
};

Example.parameters = {
  showHeader: true,
  markdown: `Tooltips may be composed with internal components to build out completely custom tooltips while maintaining a consistent style.\
  This example shows how you can build a tabular tooltip by structuring the table components explicitly within \`TooltipTable\` instead of using the \`columns\` option.`,
};
