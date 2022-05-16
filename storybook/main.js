/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

module.exports = {
  stories: ['./stories/**/*.(stories|story).ts?(x)'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-docs',
    '@storybook/addon-knobs',
    '@storybook/addon-postcss',
    '@storybook/addon-storysource',
    '@storybook/addon-viewport',
    'storybook-addon-background-toggle',
    'storybook-addon-theme-toggle',
  ],
  typescript: {
    reactDocgen: false,
  },
};
