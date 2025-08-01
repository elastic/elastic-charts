/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './index.tsx',
  mode: 'development',
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'tsconfig.json',
          transpileOnly: true,
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
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
                // need to include root so `@elastic/eui-theme-borealis` can find `@elastic/eui-theme-common`
                includePaths: ['../'],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './index.html',
      filename: 'index.html',
      favicon: '../public/favicon.ico',
    }),
    new webpack.EnvironmentPlugin({ RNG_SEED: null, VRT: 'false' }),
  ],
  resolve: {
    alias: {
      '@elastic/charts$': path.resolve(__dirname, '../packages/charts/src'),
      '@elastic/charts/': path.resolve(__dirname, '../packages/charts/'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
};
