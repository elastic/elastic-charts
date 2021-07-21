/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { preloadIcons } from './preload_icons';
import { StoryWrapper } from './story_wrapper';
import { ThemeName } from './use_base_theme';

import './style.scss';

if (process.env.VRT) {
  preloadIcons();
  document.querySelector('html')?.classList.add('disable-animations');
}

export const parameters = {
  globals: {
    // Required for reading globals from query param
    // See https://github.com/storybookjs/storybook/issues/15632#issuecomment-883542827
    backgrounds: {},
  },
  themes: {
    default: 'Light',
    clearable: false,
    target: 'html',
    icon: 'mirror',
    list: [
      { name: ThemeName.Light, class: 'light-theme', color: '#fff' },
      { name: ThemeName.Dark, class: 'dark-theme', color: '#000' },
      { name: ThemeName.EUILight, class: 'light-theme', color: '#fff' },
      { name: ThemeName.EUIDark, class: 'dark-theme', color: '#000' },
    ],
  },
  backgrounds: {
    clearable: true,
    default: 'White',
    values: [
      { name: 'White', value: '#fff' }, // $euiColorEmptyShade
      { name: 'Black', value: '#1D1E24' }, // $euiColorEmptyShade
      { name: 'Red', value: '#f04d9a' },
      { name: 'Blue', value: '#14abf5' },
      { name: 'Yellow', value: '#fec709' },
      { name: 'Green', value: '#00c1b4' },
    ],
    grid: {
      disable: true,
    },
  },
};

export const decorators = [StoryWrapper];
