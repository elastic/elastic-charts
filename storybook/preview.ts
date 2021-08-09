/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// import euiDarkVars from '@elastic/eui/dist/eui_theme_dark.json';
// import euiLightVars from '@elastic/eui/dist/eui_theme_light.json';

import { BackgroundParameter } from 'storybook-addon-background-toggle';
import { ThemeParameter } from 'storybook-addon-theme-toggle';

import { preloadIcons } from './preload_icons';
import { StoryWrapper } from './story_wrapper';
import { ThemeName } from './use_base_theme';

import './style.scss';

if (process.env.VRT) {
  preloadIcons();
  document.querySelector('html')?.classList.add('disable-animations');
}

type Parameter = ThemeParameter & BackgroundParameter;

export const parameters: Parameter = {
  theme: {
    default: ThemeName.Light,
    clearable: false,
    selector: 'html',
    themes: [
      {
        id: ThemeName.Light,
        title: 'Light',
        class: 'light-theme',
        color: '#fff',
      },
      {
        id: ThemeName.Dark,
        title: 'Dark',
        class: 'dark-theme',
        color: '#000',
      },
      {
        id: ThemeName.EUILight,
        title: 'Light - eui',
        class: 'light-theme',
        color: '#fff',
        imageUrl:
          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8cGF0aCBmaWxsPSIjRkY5NTdEIiBkPSJNMTggMjVjLS41LTUuNS01LjUtMTAuNS0xMS0xMWw3LTdjLjUgNS41IDUuNSAxMC41IDExIDExbC03IDd6Ii8+CiAgPGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjciIGZpbGw9IiNGMDRFOTgiLz4KICA8Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSI3IiBmaWxsPSIjRkVDNTE0Ii8+CiAgPHBhdGggZmlsbD0iIzAwQkZCMyIgZD0iTTMxIDE0Yy03LjE4IDAtMTMtNS44Mi0xMy0xM2gxM3YxM3oiLz4KICA8cGF0aCBmaWxsPSIjMUJBOUY1IiBkPSJNMSAxOGM3LjE4IDAgMTMgNS44MiAxMyAxM0gxVjE4eiIvPgo8L3N2Zz4K',
      },
      {
        id: ThemeName.EUIDark,
        title: 'Dark - eui',
        class: 'dark-theme',
        color: '#000',
        imageUrl:
          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8cGF0aCBmaWxsPSIjRkY5NTdEIiBkPSJNMTggMjVjLS41LTUuNS01LjUtMTAuNS0xMS0xMWw3LTdjLjUgNS41IDUuNSAxMC41IDExIDExbC03IDd6Ii8+CiAgPGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjciIGZpbGw9IiNGMDRFOTgiLz4KICA8Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSI3IiBmaWxsPSIjRkVDNTE0Ii8+CiAgPHBhdGggZmlsbD0iIzAwQkZCMyIgZD0iTTMxIDE0Yy03LjE4IDAtMTMtNS44Mi0xMy0xM2gxM3YxM3oiLz4KICA8cGF0aCBmaWxsPSIjMUJBOUY1IiBkPSJNMSAxOGM3LjE4IDAgMTMgNS44MiAxMyAxM0gxVjE4eiIvPgo8L3N2Zz4K',
      },
    ],
  },
  background: {
    clearable: true,
    selector: '#none',
    options: [
      { id: 'white', title: 'White', color: '#fff' },
      // { id: 'white', title: 'White', color: euiLightVars.euiPageBackgroundColor },
      { id: 'black', title: 'Black', color: '#1D1E24' },
      // { id: 'black', title: 'Black', color: euiDarkVars.euiPageBackgroundColor },
      { id: 'red', title: 'Red', color: '#f04d9a' },
      { id: 'blue', title: 'Blue', color: '#14abf5' },
      { id: 'yellow', title: 'Yellow', color: '#fec709' },
      { id: 'green', title: 'Green', color: '#00c1b4' },
    ],
  },
};

export const decorators = [StoryWrapper];
