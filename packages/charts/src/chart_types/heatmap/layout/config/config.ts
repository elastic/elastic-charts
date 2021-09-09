/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Config } from '../types/config_types';

/** @internal */
export const config: Config = {
  width: 500,
  height: 500,
  margin: { left: 0.01, right: 0.01, top: 0.01, bottom: 0.01 },
  maxRowHeight: 30,
  maxColumnWidth: 30,
  fontFamily: 'Sans-Serif',

  brushArea: {
    visible: true,
    fill: 'black', // black === transparent
    stroke: '#69707D', // euiColorDarkShade,
    strokeWidth: 2,
  },
  brushMask: {
    visible: true,
    fill: 'rgb(115 115 115 / 50%)',
  },
  brushTool: {
    visible: false,
    fill: 'gray',
  },

  timeZone: 'UTC',

  xAxisLabel: {
    name: 'X Value',
    visible: true,
    width: 'auto',
    fontSize: 12,
    fontFamily: 'Sans-Serif',
    fontStyle: 'normal',
    textColor: 'black',
    fontVariant: 'normal',
    fontWeight: 'normal',
    textOpacity: 1,
    align: 'center' as CanvasTextAlign,
    baseline: 'verticalAlign' as CanvasTextBaseline,
    padding: 6,
    formatter: String,
  },
  yAxisLabel: {
    name: 'Y Value',
    visible: true,
    width: 'auto',
    fontSize: 12,
    fontFamily: 'Sans-Serif',
    fontStyle: 'normal',
    textColor: 'black',
    fontVariant: 'normal',
    fontWeight: 'normal',
    textOpacity: 1,
    baseline: 'verticalAlign' as CanvasTextBaseline,
    padding: 5,
    formatter: String,
  },
  grid: {
    cellWidth: {
      min: 0,
      max: 30,
    },
    cellHeight: {
      min: 12,
      max: 30,
    },
    stroke: {
      width: 1,
      color: 'gray',
    },
  },
  cell: {
    maxWidth: 'fill',
    maxHeight: 'fill',
    align: 'center',
    label: {
      visible: true,
      maxWidth: 'fill',
      minFontSize: 8,
      maxFontSize: 12,
      fontFamily: 'Sans-Serif',
      fontStyle: 'normal',
      textColor: 'black',
      fontVariant: 'normal',
      fontWeight: 'normal',
      textOpacity: 1,
      useGlobalMinFontSize: true,
    },
    border: {
      strokeWidth: 1,
      stroke: 'gray',
    },
  },
};
