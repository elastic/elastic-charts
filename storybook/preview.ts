/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
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
