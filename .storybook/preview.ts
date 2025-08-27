/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';

import './style.scss';

import { StoryDecorator } from './decorator';
import { parameters } from './parameters';
import { getThemeOptions } from './themes';

const preview: Preview = {
  parameters: {
    ...parameters,
    react: {
      strictMode: false, // Disable Strict Mode
    },
  },
  decorators: [
    withThemeByClassName(getThemeOptions('light')),
    StoryDecorator,
  ],
};

export default preview;
