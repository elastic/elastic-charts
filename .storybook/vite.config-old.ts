/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';

import { defineConfig } from 'vite';

export default defineConfig({
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
