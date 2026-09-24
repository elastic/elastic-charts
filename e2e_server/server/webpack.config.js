/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: '../tmp/index.tsx',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    path: path.resolve(__dirname, '../.out'),
  },
  infrastructureLogging: {
    level: 'verbose',
    debug: true,
  },
  devServer: {
    host: '0.0.0.0',
    port: 9002,
    compress: true,
    client: {
      logging: 'none',
      overlay: false,
      progress: false,
    },
    allowedHosts: 'all',
    liveReload: false,
    devMiddleware: {
      stats: 'errors-only',
    },
    static: {
      directory: path.resolve(__dirname, '../../public'),
      publicPath: '/',
    },
  },
  module: {
    rules: [
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'e2e_server/server/webpack.tsconfig.json',
          transpileOnly: true,
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
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
                includePaths: ['../../'],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      '@storybook/addon-knobs': path.resolve(__dirname, 'mocks/@storybook/addon-knobs'),
      '@storybook/addon-actions': path.resolve(__dirname, 'mocks/@storybook/addon-actions'),
      '@elastic/charts$': path.resolve(__dirname, '../../packages/charts/src'),
      '@elastic/charts/': path.resolve(__dirname, '../../packages/charts/'),
    },
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      // webpack 5 no longer polyfills node core modules; EUI's markdown deps (vfile, replace-ext) import `path`
      // but it's never called, as no story renders EUI markdown
      path: false,
    },
  },
  optimization:
    process.env.NODE_ENV === 'production'
      ? {
          minimize: true,
          minimizer: [new TerserPlugin()],
        }
      : {},
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './index.ejs',
      filename: 'index.html',
      favicon: '../../public/favicon.ico',
    }),
    new webpack.EnvironmentPlugin({ RNG_SEED: null, VRT: 'true' }),
    new MiniCssExtractPlugin(),
    new SpeedMeasurePlugin(),
  ],
};
