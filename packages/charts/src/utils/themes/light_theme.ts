/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Colors } from '../../common/colors';
import { GOLDEN_RATIO, TAU } from '../../common/constants';
import { ColorVariant } from '../common';
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
    fit: {
      line: {
        opacity: 1,
        visible: true,
        dash: [5, 5],
        stroke: ColorVariant.Series,
      },
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
    fit: {
      line: {
        visible: true,
        dash: [5, 5],
        stroke: ColorVariant.Series,
        opacity: 1,
      },
      area: {
        visible: true,
        opacity: 0.15,
        fill: ColorVariant.Series,
      },
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
    fallbackColor: Colors.White.keyword,
  },
  goal: {
    minFontSize: 8,
    maxFontSize: 64,
    maxCircularSize: 360,
    maxBulletSize: 500,
    barThicknessMinSizeRatio: 1 / 10,
    baselineArcThickness: 32,
    baselineBarThickness: 32,
    marginRatio: 0.05,
    maxTickFontSize: 24,
    maxLabelFontSize: 32,
    maxCentralFontSize: 38,
    arcBoxSamplePitch: (5 / 360) * TAU,
    capturePad: 16,
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
      textColor: ColorVariant.Adaptive,
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
      textColor: ColorVariant.Adaptive,
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
  heatmap: {
    maxRowHeight: 30,
    maxColumnWidth: 30,
    brushArea: {
      visible: true,
      stroke: '#69707D', // euiColorDarkShade,
      strokeWidth: 2,
    },
    brushMask: {
      visible: true,
      fill: '#73737380',
    },
    brushTool: {
      visible: false,
      fill: 'gray',
    },
    xAxisLabel: {
      visible: true,
      fontSize: 12,
      fontFamily: 'Sans-Serif',
      fontStyle: 'normal',
      textColor: Colors.Black.keyword,
      fontVariant: 'normal',
      fontWeight: 'normal',
      padding: { top: 5, bottom: 5, left: 5, right: 5 },
      rotation: 0,
    },
    yAxisLabel: {
      visible: true,
      width: 'auto',
      fontSize: 12,
      fontFamily: 'Sans-Serif',
      fontStyle: 'normal',
      textColor: Colors.Black.keyword,
      fontVariant: 'normal',
      fontWeight: 'normal',
      padding: { top: 5, bottom: 5, left: 5, right: 5 },
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
        textColor: Colors.Black.keyword,
        fontVariant: 'normal',
        fontWeight: 'normal',
        useGlobalMinFontSize: true,
      },
      border: {
        strokeWidth: 1,
        stroke: 'gray',
      },
    },
  },
  metric: {
    text: {
      lightColor: '#E0E5EE',
      darkColor: '#343741',
    },
    border: '#EDF0F5',
    barBackground: '#EDF0F5',
    background: '#FFFFFF',
    nonFiniteText: 'N/A',
  },
};
