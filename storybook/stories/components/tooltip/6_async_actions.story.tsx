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

import { simple } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const pinned = boolean('pinned', true);

  return (
    <TooltipShowcase
      info={simple}
      pinned={pinned}
      canPinTooltip
      tooltip={{
        actionsLoading: "I'm loading some actions...",
        maxVisibleTooltipItems: 3,
        actions: (selected) => {
          return selected.length > 0
            ? new Promise((resolve) => {
                setTimeout(() => {
                  resolve([
                    {
                      label: () => `Async action on ${selected.length} selected`,
                      onSelect: (s) => action('onTooltipAction')(s),
                    },
                    {
                      label: () => `Sync action`,
                      onSelect: (s) => action('onTooltipAction')(s),
                    },
                  ]);
                }, 1000);
              })
            : [
                {
                  label: () => `Sync action`,
                  onSelect: (s) => action('onTooltipAction')(s),
                },
              ];
        },
      }}
    />
  );
};

Example.parameters = {
  background: { disable: true },
  markdown: 'Select a series to load async actions',
};
