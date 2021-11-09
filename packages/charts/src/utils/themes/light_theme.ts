/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Colors } from '../../common/colors';
import { GOLDEN_RATIO, TAU } from '../../common/constants';
import { palettes } from './colors';
import { Theme } from './theme';
import {
  DEFAULT_CHART_MARGINS,
  DEFAULT_CHART_PADDING,
  DEFAULT_GEOMETRY_STYLES,
  DEFAULT_MISSING_COLOR,
} from './theme_common';

/** @public */
export const LIGHT_THEME: Theme = {
  chartPaddings: DEFAULT_CHART_PADDING,
  chartMargins: DEFAULT_CHART_MARGINS,
  lineSeriesStyle: {
    line: {
      visible: true,
      strokeWidth: 1,
      opacity: 1,
    },
    point: {
      visible: true,
      strokeWidth: 1,
      fill: Colors.White.keyword,
      radius: 2,
      opacity: 1,
    },
  },
  bubbleSeriesStyle: {
    point: {
      visible: true,
      strokeWidth: 1,
      fill: Colors.White.keyword,
      radius: 2,
      opacity: 1,
    },
  },
  areaSeriesStyle: {
    area: {
      visible: true,
      opacity: 0.3,
    },
    line: {
      visible: true,
      strokeWidth: 1,
      opacity: 1,
    },
    point: {
      visible: false,
      strokeWidth: 1,
      fill: Colors.White.keyword,
      radius: 2,
      opacity: 1,
    },
  },
  barSeriesStyle: {
    rect: {
      opacity: 1,
    },
    rectBorder: {
      visible: false,
      strokeWidth: 1,
    },
    displayValue: {
      fontSize: 8,
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      padding: 0,
      fill: '#777',
      offsetX: 0,
      offsetY: 0,
    },
  },
  arcSeriesStyle: {
    arc: {
      visible: true,
      stroke: Colors.Black.keyword,
      strokeWidth: 1,
      opacity: 1,
    },
  },
  sharedStyle: DEFAULT_GEOMETRY_STYLES,
  scales: {
    barsPadding: 0.25,
    histogramPadding: 0.05,
  },
  axes: {
    axisTitle: {
      visible: true,
      fontSize: 12,
      fontFamily: 'sans-serif',
      padding: {
        inner: 8,
        outer: 0,
      },
      fill: '#333',
    },
    axisPanelTitle: {
      visible: true,
      fontSize: 10,
      fontFamily: 'sans-serif',
      padding: {
        inner: 8,
        outer: 0,
      },
      fill: '#333',
    },
    axisLine: {
      visible: true,
      stroke: '#eaeaea',
      strokeWidth: 1,
    },
    tickLabel: {
      visible: true,
      fontSize: 10,
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      fill: '#777',
      padding: 0,
      rotation: 0,
      offset: {
        x: 0,
        y: 0,
        reference: 'local',
      },
      alignment: {
        vertical: 'near',
        horizontal: 'near',
      },
    },
    tickLine: {
      visible: true,
      stroke: '#eaeaea',
      strokeWidth: 1,
      size: 10,
      padding: 10,
    },
    gridLine: {
      horizontal: {
        visible: false,
        stroke: '#D3DAE6',
        strokeWidth: 1,
        opacity: 1,
        dash: [0, 0],
      },
      vertical: {
        visible: false,
        stroke: '#D3DAE6',
        strokeWidth: 1,
        opacity: 1,
        dash: [0, 0],
      },
      lumaSteps: [224, 184, 128, 96, 64, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0],
    },
  },
  colors: {
    vizColors: palettes.echPaletteColorBlind.colors,
    defaultVizColor: DEFAULT_MISSING_COLOR,
  },
  legend: {
    verticalWidth: 200,
    horizontalHeight: 64,
    spacingBuffer: 10,
    margin: 0,
    labelOptions: {
      maxLines: 1,
    },
  },
  crosshair: {
    band: {
      fill: '#F5F5F5',
      visible: true,
    },
    line: {
      stroke: '#98A2B3',
      strokeWidth: 1,
      visible: true,
    },
    crossLine: {
      stroke: '#98A2B3',
      strokeWidth: 1,
      dash: [5, 5],
      visible: true,
    },
  },
  background: {
    color: Colors.Transparent.keyword,
  },
  goal: {
    minFontSize: 8,
    maxFontSize: 64,
    tickLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: Colors.Black.keyword,
    },
    majorLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: Colors.Black.keyword,
    },
    minorLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: Colors.Black.keyword,
    },
    majorCenterLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: Colors.Black.keyword,
    },
    minorCenterLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: Colors.Black.keyword,
    },
    targetLine: {
      stroke: Colors.Black.keyword,
    },
    tickLine: {
      stroke: 'darkgrey',
    },
    progressLine: {
      stroke: Colors.Black.keyword,
    },
  },
  partition: {
    outerSizeRatio: 1 / GOLDEN_RATIO,
    emptySizeRatio: 0,
    fontFamily: 'Sans-Serif',
    minFontSize: 8,
    maxFontSize: 64,
    idealFontSizeJump: 1.05,
    maximizeFontSize: false,
    circlePadding: 2,
    radialPadding: TAU / 360,
    horizontalTextAngleThreshold: TAU / 12,
    horizontalTextEnforcer: 1,
    fillLabel: {
      textColor: '#000000',
      fontFamily: 'Sans-Serif',
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 400,
      valueFont: {
        fontWeight: 400,
        fontStyle: 'normal',
        fontVariant: 'normal',
      },
      padding: 2,
      clipText: false,
    },
    linkLabel: {
      maximumSection: 10,
      fontFamily: 'Sans-Serif',
      fontSize: 12,
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 400,
      gap: 10,
      spacing: 2,
      horizontalStemLength: 10,
      radiusPadding: 10,
      lineWidth: 1,
      maxCount: 36,
      maxTextLength: 100,
      textColor: '#000000',
      minimumStemLength: 0,
      stemAngle: TAU / 8,
      padding: 0,
      valueFont: {
        fontWeight: 400,
        fontStyle: 'normal',
        fontVariant: 'normal',
      },
    },
    sectorLineWidth: 1,
    sectorLineStroke: 'white',
  },
};
