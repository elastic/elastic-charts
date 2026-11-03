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
      },
      redirect: {
        dts: {
          extension: false,
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
      dts: false,
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
    sourceMap: true,
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'classic',
      },
    }),
  ],
});
