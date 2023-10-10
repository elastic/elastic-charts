/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { palettes } from './colors';
import { Theme } from './theme';
import { DEFAULT_CHART_MARGINS, DEFAULT_CHART_PADDING, DEFAULT_GEOMETRY_STYLES } from './theme_common';
import { Colors } from '../../common/colors';
import { TAU } from '../../common/constants';
import { DEFAULT_FONT_FAMILY } from '../../common/default_theme_attributes';
import { ColorVariant } from '../common';

/** @public */
export const LIGHT_THEME: Theme = {
  chartPaddings: DEFAULT_CHART_PADDING,
  chartMargins: DEFAULT_CHART_MARGINS,
  lineSeriesStyle: {
    line: {
      visible: true,
      strokeWidth: 2,
      opacity: 1,
    },
    point: {
      visible: true,
      strokeWidth: 2,
      stroke: ColorVariant.Series,
      fill: '#FFF',
      radius: 3,
      opacity: 1,
    },
    isolatedPoint: {
      visible: true,
      stroke: ColorVariant.Series,
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
      strokeWidth: 2,
      opacity: 1,
    },
    point: {
      visible: false,
      stroke: ColorVariant.Series,
      strokeWidth: 2,
      fill: '#FFF',
      radius: 3,
      opacity: 1,
    },
    isolatedPoint: {
      visible: true,
      stroke: ColorVariant.Series,
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
      fontSize: 10,
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      alignment: { horizontal: 'center', vertical: 'middle' },
      padding: 0,
      fill: { textBorder: 0 },
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
      fontFamily: DEFAULT_FONT_FAMILY,
      padding: {
        inner: 10,
        outer: 0,
      },
      fill: '#343741',
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
      stroke: '#eaedf3',
      strokeWidth: 1,
    },
    tickLabel: {
      visible: true,
      fontSize: 10,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontStyle: 'normal',
      fill: '#646a77',
      padding: { outer: 8, inner: 10 },
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
      visible: false,
      stroke: '#eaedf3',
      strokeWidth: 1,
      size: 10,
      padding: 10,
    },
    gridLine: {
      horizontal: {
        visible: true,
        stroke: '#eaedf3',
        strokeWidth: 1,
        opacity: 1,
        dash: [0, 0],
      },
      vertical: {
        visible: true,
        stroke: '#eaedf3',
        strokeWidth: 1,
        opacity: 1,
        dash: [4, 4],
      },
      lumaSteps: [224, 184, 128, 96, 64, 32, 16, 8, 4, 2, 1, 0, 0, 0, 0, 0],
    },
  },
  colors: {
    vizColors: palettes.echPaletteColorBlind.colors,
    defaultVizColor: '#6092C0',
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
      visible: true,
      fill: '#F1F4FA',
    },
    line: {
      visible: true,
      stroke: '#69707D',
      strokeWidth: 1,
      dash: [4, 4],
    },
    crossLine: {
      visible: true,
      stroke: '#69707D',
      strokeWidth: 1,
      dash: [4, 4],
    },
  },
  background: {
    color: '#FFF',
    fallbackColor: '#FFF',
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
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#646a77',
    },
    majorLabel: {
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#343741',
    },
    minorLabel: {
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#646a77',
    },
    majorCenterLabel: {
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#343741',
    },
    minorCenterLabel: {
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#646a77',
    },
    targetLine: {
      stroke: '#343741',
    },
    tickLine: {
      stroke: '#98A2B3',
    },
    progressLine: {
      stroke: '#343741',
    },
  },
  partition: {
    outerSizeRatio: 1,
    emptySizeRatio: 0,
    fontFamily: DEFAULT_FONT_FAMILY,
    minFontSize: 8,
    maxFontSize: 16,
    idealFontSizeJump: 1.05,
    maximizeFontSize: false,
    circlePadding: 4,
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
        fontWeight: 700,
        fontStyle: 'normal',
        fontVariant: 'normal',
      },
      padding: 2,
      clipText: false,
    },
    linkLabel: {
      maximumSection: 10,
      fontFamily: 'Sans-Serif',
      fontSize: 11,
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 400,
      gap: 10,
      spacing: 2,
      horizontalStemLength: 10,
      radiusPadding: 10,
      lineWidth: 1,
      maxCount: 5,
      maxTextLength: 100,
      textColor: '#343741',
      minimumStemLength: 0,
      stemAngle: TAU / 8,
      padding: 0,
      valueFont: {
        fontWeight: 400,
        fontStyle: 'normal',
        fontVariant: 'normal',
      },
    },
    sectorLineWidth: 1.5,
    sectorLineStroke: '#FFF',
  },
  heatmap: {
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
    nonFiniteText: 'N/A',
    minHeight: 64,
  },
  tooltip: {
    maxWidth: 260,
    maxTableHeight: 120,
    defaultDotColor: Colors.Black.keyword,
  },
  flamegraph: {
    navigation: {
      textColor: 'rgb(52, 55, 65)',
      buttonTextColor: 'rgb(0, 97, 166)',
      buttonDisabledTextColor: 'rgb(162, 171, 186)',
      buttonBackgroundColor: 'rgb(204, 228, 245)',
      buttonDisabledBackgroundColor: 'rgba(211, 218, 230, 0.15)',
    },
    scrollbarThumb: 'rgb(52, 55, 65)',
    scrollbarTrack: 'rgb(211, 218, 230)',
  },
  highlighter: {
    point: {
      opacity: 1,
      fill: ColorVariant.None,
      stroke: ColorVariant.Series,
      strokeWidth: 4,
      radius: 10,
    },
  },
};
