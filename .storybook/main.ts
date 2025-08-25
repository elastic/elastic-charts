/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';

import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['./stories/**/*.mdx', './stories/**/*.story.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // '@storybook/addon-docs',
    '@storybook/addon-a11y',
    'storybook-addon-toggles',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      strictMode: false, // disable react strict mode
    },
  },
  features: {
    outline: false,
    interactions: false,
  },
  viteFinal: (sbViteConfig) => {
    return mergeConfig(sbViteConfig, {
      resolve: {
        alias: [
          {
            find: /^@elastic\/charts\/(.*)/,
            replacement: path.resolve(__dirname, '../packages/charts/$1'),
          },
          {
            find: '@elastic/charts',
            replacement: path.resolve(__dirname, '../packages/charts/src/index.ts'),
          },
          {
            // Need to resolve `@elastic/` sass imports in `@elastic/` packages from eui
            find: 'node_modules/@elastic',
            replacement: path.resolve(__dirname, '../node_modules/@elastic'),
          },
          {
            // Alias for shared storybook utils, components and types
            find: '@ech/sb',
            replacement: path.resolve(__dirname, './shared'),
          },
        ],
      },
      css: {
        preprocessorOptions: {
          scss: {
            quietDeps: true, // silence divider deprecation warning messages
          },
        },
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('development'),
      },
    });
  },
};

export default config;
