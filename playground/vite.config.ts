/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],

  // Entry point - Vite automatically uses index.html as entry
  root: __dirname,

  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },

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
        // Silence deprecation warnings
        silenceDeprecations: [
          'legacy-js-api',
          'import',
          'global-builtin',
          'color-functions',
          'slash-div',
          'function-units',
        ],
      },
    },
  },

  define: {
    'process.env.RNG_SEED': JSON.stringify(process.env.RNG_SEED || null),
    'process.env.VRT': JSON.stringify(process.env.VRT || 'false'),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },

  // // TypeScript configuration
  // esbuild: {
  //   loader: 'tsx',
  //   include: ['**/*.ts', '**/*.tsx'],
  // },

  // // Optimize dependencies
  // optimizeDeps: {
  //   include: ['react', 'react-dom'],
  // },
});
