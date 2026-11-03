import path from 'path';

import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

const configDir = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(configDir, '..');
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
      index: './index.tsx',
    },
    tsconfigPath: './tsconfig.json',
    define: {
      'process.env.RNG_SEED': JSON.stringify(process.env.RNG_SEED ?? null),
      'process.env.VRT': JSON.stringify(process.env.VRT ?? 'false'),
    },
  },
  resolve: {
    aliasStrategy: 'prefer-alias',
    alias: {
      // Prefix `@elastic/charts/` does not match subpaths in webpack 5: enhanced-resolve
      // appends another `/`, so `@elastic/charts/src/...` falls through to package exports.
      '@elastic/charts$': path.join(chartsRoot, 'src'),
      '@elastic/charts/src': path.join(chartsRoot, 'src'),
    },
  },
  html: {
    template: './index.html',
    favicon: path.join(repoRoot, 'public/favicon.ico'),
  },
  server: {
    port: 8080,
    publicDir: {
      name: path.join(repoRoot, 'public'),
    },
  },
  output: {
    target: 'web',
    polyfill: 'off',
    sourceMap: true,
  },
});
