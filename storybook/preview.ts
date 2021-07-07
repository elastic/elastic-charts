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
import { switchTheme } from './theme_service';

import './style.scss';

switchTheme('light');
preloadIcons();

if (process.env.VRT) {
  preloadIcons();
  document.querySelector('html')?.classList.add('disable-animations');
}

export const parameters = {
  backgrounds: {
    grid: {
      disable: true,
    },
    values: [
      {
        name: 'Black',
        value: '#000',
      },
      {
        name: 'White',
        value: '#fff',
      },
      {
        name: 'Pink',
        value: '#f04d9a',
      },
      {
        name: 'Blue',
        value: '#14abf5',
      },
      {
        name: 'Yellow',
        value: '#fec709',
      },
      {
        name: 'Green',
        value: '#00c1b4',
      },
    ],
  },
};

export const decorators = [StoryWrapper];
