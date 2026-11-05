/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, rspack } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, '../..');
const chartsRoot = path.resolve(repoRoot, 'packages/charts');

export default defineConfig({
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'classic',
      },
    }),
    pluginSass({
      sassLoaderOptions: {
        sassOptions: {
          loadPaths: [repoRoot],
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin', 'slash-div', 'color-functions'],
        },
      },
    }),
  ],
  source: {
    entry: {
      index: '../tmp/index.tsx',
    },
    tsconfigPath: './tsconfig.json',
    define: {
      'process.env.RNG_SEED': JSON.stringify(process.env.RNG_SEED ?? null),
      'process.env.VRT': JSON.stringify(process.env.VRT ?? 'true'),
    },
  },
  resolve: {
    aliasStrategy: 'prefer-alias',
    alias: {
      '@storybook/addon-knobs': path.resolve(configDir, 'mocks/@storybook/addon-knobs'),
      '@storybook/addon-actions': path.resolve(configDir, 'mocks/@storybook/addon-actions'),
      // Prefix `@elastic/charts/` does not match subpaths in Rspack: enhanced-resolve
      // appends another `/`, so `@elastic/charts/src/...` falls through to package exports.
      '@elastic/charts$': path.join(chartsRoot, 'src'),
      '@elastic/charts/src': path.join(chartsRoot, 'src'),
    },
  },
  html: {
    template: './index.ejs',
    title: 'Elastic Charts VRT',
    favicon: path.join(repoRoot, 'public/favicon.ico'),
  },
  server: {
    host: '0.0.0.0',
    port: 9002,
    strictPort: true,
    compress: true,
    publicDir: {
      name: path.join(repoRoot, 'public'),
      copyOnBuild: true,
    },
  },
  dev: {
    hmr: false,
    liveReload: false,
    lazyCompilation: false,
    client: {
      overlay: false,
      logLevel: 'silent',
    },
  },
  output: {
    target: 'web',
    polyfill: 'off',
    cleanDistPath: true,
    // Relative URLs so the Firebase preview at /e2e/ can load JS/CSS.
    assetPrefix: 'auto',
    distPath: {
      root: '../.out',
    },
    filenameHash: false,
    filename: {
      js: '[name].bundle.js',
      css: '[name].css',
      font: 'fonts/[name][ext]',
    },
  },
  tools: {
    rspack: {
      resolve: {
        fallback: {
          // EUI markdown deps (vfile, replace-ext) import `path` but never call it
          path: false,
        },
      },
      plugins: [
        new rspack.ProvidePlugin({
          process: 'process/browser.js',
        }),
      ],
    },
  },
});
