/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';

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

const srcDir = path.resolve('./src');
const headlessDir = path.join(srcDir, 'headless');

/**
 * In the build for Node, the headless entry imports the main entry as the file it is built to, so that the two
 * share one copy of the chart and its module state. Anything else it imported of the chart would be a second
 * copy, bundled into the headless file.
 */
const mainEntryOnly =
  (mainEntryFile: string) =>
  (
    { context = '', request = '' }: { context?: string; request?: string },
    callback: (error?: Error, external?: string) => void,
  ) => {
    const target = path.resolve(context, request);
    if (!request.startsWith('.') || !context.startsWith(headlessDir) || target.startsWith(headlessDir)) callback();
    else if (target === srcDir || target === path.join(srcDir, 'index')) callback(undefined, mainEntryFile);
    else callback(new Error(`${context} imports ${request}: the headless entry may import only the main entry`));
  };

/**
 * What the `node` condition of the package exports resolves to: one file for each entry. In Node, a module
 * that is a file of its own costs memory and load time that its code alone does not, and nothing there needs
 * the modules apart. Bundlers keep the build with a file for each module, which they can leave out one by one.
 * Dependencies stay imports in both, so the application's copy of each is the one in use.
 */
const forNode = (format: 'esm' | 'cjs', mainEntryFile: string) =>
  ({
    format,
    syntax: 'es2022',
    dts: false,
    source: {
      entry: {
        index: './src/index.ts',
        'headless/index': './src/headless/index.ts',
      },
    },
    output: {
      distPath: `./dist/node/${format}`,
      externals: [mainEntryOnly(mainEntryFile)],
    },
  }) as const;

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
      source: {
        entry: {
          index: srcEntry,
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
      source: {
        entry: {
          index: srcEntry,
        },
      },
      output: {
        distPath: './dist/cjs',
      },
    },
    forNode('esm', '../index.mjs'),
    forNode('cjs', '../index.js'),
  ],
  source: {
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
