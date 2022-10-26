/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { tableSimple, simple, long } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const maxVisibleTooltipItems = number('max visible tooltip items', 3);
  const dataSet = select(
    'dataSet',
    {
      'Simple - table': 'tableSimple',
      'Simple - list': 'simple',
      'Long - list': 'long',
    },
    'simple',
  );
  const dataSets = {
    tableSimple,
    simple,
    long,
  };

  const pinned = boolean('pinned', true);

  return (
    <TooltipShowcase
      info={dataSets[dataSet]}
      pinned={pinned}
      canPinTooltip
      tooltip={{
        maxVisibleTooltipItems,
        actions: [
          {
            disabled: (d) => d.length < 1,
            label: (d) => `Filter categor${d.length > 1 ? 'ies' : 'y'}`,
            onSelect: (s) => action('onTooltipAction')(s),
          },
          {
            disabled: (d) => d.length < 1,
            label: (d) => `Copy value${d.length > 1 ? 's' : ''}`,
            onSelect: (s) => action('onTooltipAction')(s),
          },
          {
            disabled: (d) => d.length < 1,
            label: (d) => (
              <span title={d.length < 1 ? 'Select at least 1 category to search' : 'Search the selected category'}>
                Search for term{d.length > 1 ? 's' : ''}
              </span>
            ),
            onSelect: (s) => action('onTooltipAction')(s),
          },
        ],
      }}
    />
  );
};

Example.parameters = {
  markdown: `Tooltips may be composed with internal components to build out completely custom tooltips while maintaining a consistent style.\
  This example shows how you can build the default list tooltip by defining the \`columns\` on the \`TooltipTable\` component inside a \`CustomTooltip\`.`,
  background: { disable: true },
};
