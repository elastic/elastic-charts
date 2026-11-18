/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

const srcEntry = [
  './src/**/*.ts',
  './src/**/*.tsx',
  '!**/*.test.*',
  '!**/__mocks__/**',
  '!src/mocks/**',
  '!src/utils/data_samples/**',
];

export default defineConfig({
  lib: [
    {
      format: 'esm',
      bundle: false,
      syntax: 'es2022',
      dts: {
        bundle: false,
        distPath: './dist/esm',
        autoExtension: true,
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
      output: {
        distPath: './dist/esm',
      },
    },
    {
      format: 'cjs',
      bundle: false,
      syntax: 'es2022',
      dts: {
        bundle: false,
        distPath: './dist/cjs',
        autoExtension: true,
      },
      redirect: {
        dts: {
          extension: true,
        },
      },
      output: {
        distPath: './dist/cjs',
      },
    },
  ],
  source: {
    entry: {
      index: srcEntry,
    },
    tsconfigPath: './tsconfig.src.json',
  },
  output: {
    target: 'web',
    // Rslib embeds original sources in each JS map (~8 MB), unlike tsc. Keep them off.
    sourceMap: {
      js: false,
    },
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'classic',
      },
    }),
  ],
});
