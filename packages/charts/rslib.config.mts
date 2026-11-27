/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { readFileSync } from 'fs';
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

const headless = path.resolve('./src/headless');

/** What the headless file of the build for Node has in place of a package: a stand-in that does only what it needs */
const STAND_INS: Record<string, string> = {
  react: path.join(headless, 'react_stand_in/react.ts'),
  'react-dom': path.join(headless, 'react_stand_in/react_dom.ts'),
  'react-dom/server': path.join(headless, 'react_stand_in/server.ts'),
  'react-redux': path.join(headless, 'react_stand_in/react_redux.ts'),
  '@popperjs/core': path.join(headless, 'popper_stand_in.ts'),
};

const { dependencies, peerDependencies } = JSON.parse(readFileSync('./package.json', 'utf8')) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};
const dependencyNames = [...Object.keys(dependencies), ...Object.keys(peerDependencies)];
const imported = (names: string[]) => names.map((name) => new RegExp(`^${name}(/.*)?$`));

/**
 * What the `node` condition of the package exports resolves to: one file for each entry. In Node, a module
 * that is a file of its own costs memory and load time that its code alone does not, and nothing there needs
 * the modules apart. Bundlers keep the build with a file for each module, which they can leave out one by one.
 * Dependencies stay imports, so the application's copy of each is the one in use.
 */
const forNode = (format: 'esm' | 'cjs') =>
  ({
    format,
    syntax: 'es2022',
    dts: false,
    source: { entry: { index: './src/index.ts' } },
    output: { distPath: `./dist/node/${format}` },
  }) as const;

/**
 * The headless entry for Node is a file that holds all of the chart, with stand-ins in place of React and of
 * what only a page needs: it renders once, to markup. So it shares nothing with the main entry's file, and a
 * chart it renders is made of the components it exports itself.
 */
const headlessForNode = (format: 'esm' | 'cjs') =>
  ({
    format,
    syntax: 'es2022',
    dts: false,
    source: { entry: { index: './src/headless/index.ts' } },
    resolve: {
      alias: Object.fromEntries(Object.entries(STAND_INS).map(([name, file]) => [`${name}$`, file])),
    },
    output: {
      distPath: `./dist/node/${format}/headless`,
      autoExternal: false,
      externals: imported(dependencyNames.filter((name) => !(name in STAND_INS))),
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
    forNode('esm'),
    forNode('cjs'),
    headlessForNode('esm'),
    headlessForNode('cjs'),
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
