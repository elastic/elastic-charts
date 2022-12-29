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
  CustomTooltip,
  TooltipTable,
  TooltipTableBody,
  TooltipTableHeader,
  TooltipTableRow,
  TooltipTableCell,
  TooltipTableColorCell,
  TooltipAction,
  XYChartSeriesIdentifier,
  TooltipContainer,
} from '@elastic/charts';

import { long } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const actions: TooltipAction<any, XYChartSeriesIdentifier>[] = [
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

  const MyTooltip: CustomTooltip<any, XYChartSeriesIdentifier> = ({ values, selected, pinned, toggleSelected }) => {
    return (
      <TooltipContainer>
        <TooltipTable maxHeight={300} gridTemplateColumns="11px auto auto">
          <TooltipTableHeader>
            <TooltipTableRow>
              <TooltipTableColorCell />
              <TooltipTableCell>Series</TooltipTableCell>
              <TooltipTableCell>Y Value</TooltipTableCell>
            </TooltipTableRow>
          </TooltipTableHeader>
          <TooltipTableBody>
            {values.map((value) => {
              const {
                datum,
                seriesIdentifier: { key },
                color,
              } = value;
              const onSelect = () => {
                toggleSelected(value);
              };

              return (
                <TooltipTableRow
                  isSelected={pinned && selected.includes(value)}
                  onSelect={onSelect}
                  key={`${key}-${datum.x}`}
                >
                  <TooltipTableColorCell color={color} />
                  <TooltipTableCell>{value.label}</TooltipTableCell>
                  <TooltipTableCell>{value.formattedValue}</TooltipTableCell>
                </TooltipTableRow>
              );
            })}
          </TooltipTableBody>
        </TooltipTable>
      </TooltipContainer>
    );
  };
  return (
    <TooltipShowcase
      info={long}
      customTooltip={MyTooltip}
      pinned={boolean('pinned', false)}
      tooltip={{ actions }}
      canPinTooltip
    />
  );
};

Example.parameters = {
  markdown: `Tooltips may be composed with internal components to build out completely custom tooltips while maintaining a consistent style.\
  This example shows how you can build a tabular tooltip by structuring the table components explicitly within \`TooltipTable\` instead of using the \`columns\` option.`,
};
