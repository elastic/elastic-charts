/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const path = require('path');

const CircularDependencyPlugin = require('circular-dependency-plugin');

const nonce = 'Pk1rZ1XDlMuYe8ubWV3Lh0BzwrTigJQ=';

const scssLoaders = [
  {
    loader: 'css-loader',
    options: { importLoaders: 1 },
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [require('autoprefixer')],
      },
    },
  },
  {
    loader: 'sass-loader',
    options: {
      sassOptions: {
        // prevent divider deprecation warning messages
        quietDeps: true,
      },
    },
  },
];

const MAX_CYCLES = 0;
let numCyclesDetected = 0;

module.exports = ({ config }) => {
  config.mode = 'development';

  if (process.env.CI) {
    config.plugins.push(
      new CircularDependencyPlugin({
        onStart() {
          numCyclesDetected = 0;
        },
        onDetected({ paths, compilation }) {
          if (!/node_modules\/.+/.test(paths[0])) {
            numCyclesDetected++;
            compilation.warnings.push(new Error(paths.join(' -> ')));
          }
        },
        onEnd({ compilation }) {
          if (numCyclesDetected > MAX_CYCLES) {
            compilation.errors.push(
              new Error(`Detected ${numCyclesDetected} cycles which exceeds configured limit of ${MAX_CYCLES}`),
            );
          }
        },
      }),
    );
  }

  config.module.rules.push({
    test: /\.tsx?$/,
    loader: 'ts-loader',
    exclude: /node_modules/,
    options: {
      configFile: 'tsconfig.json',
      transpileOnly: true,
    },
  });

  // Replace default css rules with nonce
  config.module.rules = config.module.rules.filter((r) => !r?.test?.test?.('.css'));

  config.module.rules.push({
    test: /\.css$/,
    use: [
      {
        loader: 'style-loader',
        options: {
          attributes: {
            nonce,
          },
        },
      },
      {
        loader: 'css-loader',
        options: { importLoaders: 1 },
      },
    ],
  });

  config.module.rules.push({
    test: /\.scss$/,
    include: [path.resolve(__dirname, './'), path.resolve(__dirname, '../node_modules/@elastic')],
    use: [
      {
        loader: 'style-loader',
        options: {
          attributes: {
            nonce,
          },
        },
      },
      ...scssLoaders,
    ],
  });

  config.resolve.extensions.push('.ts', '.tsx');

  config.resolve.alias = {
    '@elastic/charts$': path.resolve(__dirname, '../packages/charts/src'),
    '@elastic/charts/': path.resolve(__dirname, '../packages/charts/'),
  };

  return config;
};
