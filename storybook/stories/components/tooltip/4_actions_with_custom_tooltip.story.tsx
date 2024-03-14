/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableColorCell,
  TooltipAction,
  TooltipSpec,
  useTooltipContext,
  SeriesIdentifier,
} from '@elastic/charts';

import { long } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const actions: TooltipAction<any, SeriesIdentifier>[] = [
    {
      label: () => 'Log storybook action',
      onSelect: (s) => action('onTooltipAction')(s),
    },
    {
      label: ({ length }) => (
        <span>
          Alert keys of all <b>{length}</b> selected series
        </span>
      ),
      disabled: ({ length }) => (length < 1 ? 'Select at least one series' : false),
      onSelect: (series) =>
        alert(`Selected the following: \n - ${series.map((s) => s.seriesIdentifier.key).join('\n - ')}`),
    },
  ];

  const TooltipBody: TooltipSpec['body'] = ({ items }) => {
    const { pinned, selected, toggleSelected } = useTooltipContext();
    return (
      <Table maxHeight={100} gridTemplateColumns="11px auto auto">
        <TableHeader>
          <TableRow>
            <TableColorCell />
            <TableCell style={{ textAlign: 'left' }}>Category</TableCell>
            <TableCell style={{ textAlign: 'right' }}>Value</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((value) => {
            const onSelect = () => toggleSelected(value);
            return (
              <TableRow
                isSelected={pinned && selected.includes(value)}
                onSelect={onSelect}
                key={`${value.seriesIdentifier.key}-${value.datum.x}`}
              >
                <TableColorCell color={value.color} />
                <TableCell style={{ textAlign: 'left' }}>{value.label}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{value.formattedValue}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };
  return (
    <TooltipShowcase
      info={long}
      pinned={boolean('pinned', false)}
      tooltip={{
        actions,
        body: TooltipBody,
        header: boolean('show header', true) ? ({ header }) => <>Time: {header?.formattedValue}</> : ('none' as const),
        footer: boolean('show footer', true) ? ({ items }) => <>Total of {items.length} categories</> : 'none',
      }}
      canPinTooltip
    />
  );
};

Example.parameters = {
  showHeader: true,
  markdown: `Tooltips may be composed with internal components to build out completely custom tooltips while maintaining a consistent style.\
  This example shows how you can build a tabular tooltip by structuring the table components explicitly within \`TooltipTable\` instead of using the \`columns\` option.`,
};
