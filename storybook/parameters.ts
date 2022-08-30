/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import euiDarkVars from '@elastic/eui/dist/eui_theme_dark.json';
import euiLightVars from '@elastic/eui/dist/eui_theme_light.json';
import type { Parameters as SBParameters } from '@storybook/addons';
import { BackgroundParameter } from 'storybook-addon-background-toggle';
import { ThemeParameter } from 'storybook-addon-theme-toggle';

import { SB_KNOBS_PANEL, SB_SOURCE_PANEL } from './stories/utils/storybook';

type Parameters = SBParameters & ThemeParameter & BackgroundParameter;

const euiLogoUrl =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8cGF0aCBmaWxsPSIjRkY5NTdEIiBkPSJNMTggMjVjLS41LTUuNS01LjUtMTAuNS0xMS0xMWw3LTdjLjUgNS41IDUuNSAxMC41IDExIDExbC03IDd6Ii8+CiAgPGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjciIGZpbGw9IiNGMDRFOTgiLz4KICA8Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSI3IiBmaWxsPSIjRkVDNTE0Ii8+CiAgPHBhdGggZmlsbD0iIzAwQkZCMyIgZD0iTTMxIDE0Yy03LjE4IDAtMTMtNS44Mi0xMy0xM2gxM3YxM3oiLz4KICA8cGF0aCBmaWxsPSIjMUJBOUY1IiBkPSJNMSAxOGM3LjE4IDAgMTMgNS44MiAxMyAxM0gxVjE4eiIvPgo8L3N2Zz4K';

export const storybookParameters: Parameters = {
  options: {
    selectedPanel: process.env.NODE_ENV === 'development' ? SB_KNOBS_PANEL : SB_SOURCE_PANEL,
  },
  previewTabs: {
    'storybook/docs/panel': {
      hidden: true,
    },
    canvas: {
      title: 'Story',
      hidden: false,
    },
  },
  theme: {
    default: 'light',
    clearable: false,
    selector: 'html',
    themes: [
      {
        id: 'light',
        title: 'Light',
        class: 'light-theme',
        color: '#fff',
      },
      {
        id: 'dark',
        title: 'Dark',
        class: 'dark-theme',
        color: '#000',
      },
      {
        id: 'eui-light',
        title: 'Light - EUI',
        class: ['light-theme', 'eui'],
        color: euiLightVars.euiColorEmptyShade,
        imageUrl: euiLogoUrl,
      },
      {
        id: 'eui-dark',
        title: 'Dark - EUI',
        class: ['dark-theme', 'eui'],
        color: euiDarkVars.euiColorEmptyShade,
        imageUrl: euiLogoUrl,
      },
    ],
  },
  background: {
    clearable: true,
    selector: '#none',
    options: [
      { id: 'white', title: 'White', color: '#fff' },
      { id: 'black', title: 'Black', color: '#000' },
      { id: 'red', title: 'Red', color: '#f04d9a' },
      { id: 'blue', title: 'Blue', color: '#14abf5' },
      { id: 'yellow', title: 'Yellow', color: '#fec709' },
      { id: 'green', title: 'Green', color: '#00c1b4' },
    ],
  },
  viewport: {
    viewports: {
      vrt: {
        // to match vrt default viewport to help with mouse positioning
        // See e2e/playwright.config.ts#L20
        name: 'VRT Viewport',
        styles: {
          width: '785px',
          height: '600px',
        },
      },
    },
  },
};
