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
    '@storybook/addon-actions',
    '@storybook/addon-knobs',
    '@storybook/addon-postcss',
    '@storybook/addon-viewport',
    'storybook-addon-theme-toggle',
    'storybook-addon-background-toggle',
    // https://github.com/storybookjs/storybook/issues/12199
    // source no longer works with the bucketed `xxx.stories.tsx` files
    // '@storybook/addon-storysource',
  ],
};
