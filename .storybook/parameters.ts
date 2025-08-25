/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Parameters as SBParameters } from '@storybook/addons';
import type { TogglesParameter } from 'storybook-addon-toggles';

import { backgroundsOptions } from './backgrounds';

type Parameters = SBParameters & TogglesParameter;

export const parameters: Parameters = {
  backgrounds: {
    options: backgroundsOptions,
  },
  toggles: {
    options: [
      {
        id: 'showHeader',
        title: 'Show story header',
        defaultValue: true,
        disabled: {
          showChartTitle: true,
          showChartDescription: true,
        },
      },
      {
        id: 'showChartTitle',
        title: 'Show chart title',
        defaultValue: false,
      },
      {
        id: 'showChartDescription',
        title: 'Show chart description',
        defaultValue: false,
      },
      {
        id: 'showChartBoundary',
        title: 'Show chart boundary',
        defaultValue: false,
      },
    ],
  },

  viewport: {
    options: {
      vrt: {
        // to match vrt default viewport to help with mouse positioning
        // See e2e/playwright.config.ts#L20
        name: 'VRT Viewport',
        styles: {
          width: '785px',
          height: '1000px',
        },
      },
    },
  },
};
