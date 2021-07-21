/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

module.exports = {
  stories: ['./stories/**/*.stories.ts', './stories/**/*.stories.tsx'],
  addons: [
    {
      name: '@storybook/addon-essentials',
      // Many of these could be used in the future, keeping here for now
      options: {
        viewport: false,
        outline: false,
        controls: false,
        docs: false,
        backgrounds: false,
      },
    },
    '@storybook/addon-backgrounds', // custom
    '@storybook/addon-knobs',
    '@storybook/addon-postcss',
    '@storybook/addon-storysource',
    'storybook-addon-themes',
  ],
};
