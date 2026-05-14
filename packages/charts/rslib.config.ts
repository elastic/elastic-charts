/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    tsconfigPath: './tsconfig.src.json',
    exclude: [/\.test\.[jt]sx?$/, /[/\\]__mocks__[/\\]/, /src[/\\]mocks[/\\]/, /src[/\\]utils[/\\]data_samples[/\\]/],
    entry: {
      index: './src/index.ts',
      theme_light: './src/styles/theme_light.scss',
      theme_dark: './src/styles/theme_dark.scss',
      theme_only_light: './src/styles/theme_only_light.scss',
      theme_only_dark: './src/styles/theme_only_dark.scss',
      'legacy/theme_light': './src/styles/legacy/theme_light.scss',
      'legacy/theme_dark': './src/styles/legacy/theme_dark.scss',
      'legacy/theme_only_light': './src/styles/legacy/theme_only_light.scss',
      'legacy/theme_only_dark': './src/styles/legacy/theme_only_dark.scss',
    },
  },
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      dts: {
        bundle: false,
        distPath: './dist/types',
      },
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      dts: false,
      output: {
        distPath: {
          root: './dist/cjs',
        },
        filename: {
          js: '[name].cjs',
        },
      },
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [
    pluginReact(),
    pluginSass({
      sassLoaderOptions: {
        sassOptions: {
          loadPaths: ['../../'],
        },
      },
    }),
  ],
});
