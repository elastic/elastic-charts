/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { palettes } from './legacy_colors';
import { DEFAULT_ANNOTATION_LINE_STYLE, DEFAULT_ANNOTATION_RECT_STYLE } from './merge_utils';
import type { Theme } from './theme';
import {
  DEFAULT_GEOMETRY_STYLES,
  DEFAULT_MISSING_COLOR,
  LEGACY_CHART_MARGINS,
  LEGACY_CHART_PADDING,
} from './theme_common';
import { DARK_THEME_BULLET_STYLE } from '../../chart_types/bullet_graph/theme';
import { Colors } from '../../common/colors';
import { GOLDEN_RATIO, TAU } from '../../common/constants';
import { ColorVariant } from '../common';

/**
 * Legacy dark chart theme to be removed at some point
 *
 * @public
 * @deprecated Use new `DARK_THEME`
 */
export const LEGACY_DARK_THEME: Theme = {
  chartPaddings: LEGACY_CHART_PADDING,
  chartMargins: LEGACY_CHART_MARGINS,
  lineSeriesStyle: {
    line: {
      visible: true,
      strokeWidth: 1,
      opacity: 1,
    },
    point: {
      visible: 'always',
      stroke: ColorVariant.Series,
      strokeWidth: 1,
      fill: Colors.Black.keyword,
      radius: 2,
      opacity: 1,
    },
    isolatedPoint: {
      enabled: true,
      visible: 'always',
      stroke: ColorVariant.Series,
      strokeWidth: 1,
      fill: Colors.Black.keyword,
      opacity: 1,
    },
    fit: {
      line: {
        visible: true,
        dash: [5, 5],
        stroke: ColorVariant.Series,
        opacity: 1,
      },
    },
    pointVisibilityMinDistance: 20,
  },
  bubbleSeriesStyle: {
    point: {
      visible: 'always',
      strokeWidth: 1,
      fill: Colors.Black.keyword,
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
      visible: 'never',
      stroke: ColorVariant.Series,
      strokeWidth: 1,
      fill: Colors.Black.keyword,
      radius: 2,
      opacity: 1,
    },
    isolatedPoint: {
      enabled: true,
      visible: 'always',
      stroke: ColorVariant.Series,
      strokeWidth: 1,
      fill: Colors.Black.keyword,
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
    pointVisibilityMinDistance: 20,
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
      fill: '#999',
      offsetX: 0,
      offsetY: 0,
    },
  },
  arcSeriesStyle: {
    arc: {
      visible: true,
      stroke: 'white',
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
      fontSize: 12,
      fontFamily: 'sans-serif',
      padding: {
        inner: 8,
        outer: 0,
      },
      fill: '#D4D4D4',
      visible: true,
    },
    axisPanelTitle: {
      fontSize: 10,
      fontFamily: 'sans-serif',
      padding: {
        inner: 8,
        outer: 0,
      },
      fill: '#D4D4D4',
      visible: true,
    },
    axisLine: {
      visible: true,
      stroke: '#444',
      strokeWidth: 1,
    },
    tickLabel: {
      visible: true,
      fontSize: 10,
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      fill: '#999',
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
      stroke: '#444',
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
      fill: '#2A2A2A',
      visible: true,
    },
    line: {
      stroke: '#999',
      strokeWidth: 1,
      visible: true,
    },
    crossLine: {
      stroke: '#999',
      strokeWidth: 1,
      dash: [5, 5],
      visible: true,
    },
  },
  background: {
    color: 'transparent',
    fallbackColor: Colors.Black.keyword,
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
      fill: 'white',
    },
    majorLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: 'white',
    },
    minorLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: 'white',
    },
    majorCenterLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: 'white',
    },
    minorCenterLabel: {
      fontStyle: 'normal',
      fontFamily: 'sans-serif',
      fill: 'white',
    },
    targetLine: {
      stroke: 'white',
    },
    tickLine: {
      stroke: 'snow',
    },
    progressLine: {
      stroke: 'white',
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
    sectorLineStroke: Colors.Black.keyword,
  },
  heatmap: {
    brushArea: {
      visible: true,
      stroke: '#D3DAE6', // euiColorLightShade,
      strokeWidth: 2,
    },
    brushMask: {
      visible: true,
      fill: '#8c8c8c80',
    },
    brushTool: {
      visible: false,
      fill: 'snow',
    },

    xAxisLabel: {
      visible: true,
      fontSize: 12,
      fontFamily: 'Sans-Serif',
      fontStyle: 'normal',
      textColor: Colors.White.keyword,
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
      textColor: Colors.White.keyword,
      fontVariant: 'normal',
      fontWeight: 'normal',
      padding: { top: 5, bottom: 5, left: 5, right: 5 },
    },
    grid: {
      stroke: {
        width: 1,
        color: 'snow',
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
        textColor: Colors.White.keyword,
        fontVariant: 'normal',
        fontWeight: 'normal',
        useGlobalMinFontSize: true,
      },
      border: {
        strokeWidth: 1,
        stroke: 'snow',
      },
    },
  },
  metric: {
    textLightColor: '#E0E5EE',
    textDarkColor: '#343741',
    valueFontSize: 'default',
    minValueFontSize: 12,
    titlesTextAlign: 'left',
    extraTextAlign: 'right',
    valueTextAlign: 'right',
    iconAlign: 'right',
    border: '#343741',
    barBackground: '#343741',
    emptyBackground: Colors.Transparent.keyword,
    nonFiniteText: 'N/A',
    minHeight: 64,
  },
  bulletGraph: DARK_THEME_BULLET_STYLE,
  tooltip: {
    maxWidth: 500,
    maxTableHeight: 120,
    defaultDotColor: Colors.White.keyword,
  },
  flamegraph: {
    navigation: {
      textColor: 'rgb(223, 229, 239)',
      buttonTextColor: 'rgb(54, 162, 239)',
      buttonDisabledTextColor: 'rgb(81, 87, 97)',
      buttonBackgroundColor: '#36a2ef33',
      buttonDisabledBackgroundColor: 'rgba(52, 55, 65, 0.15)',
    },
    scrollbarThumb: 'rgb(223, 229, 239)',
    scrollbarTrack: 'rgb(52, 55, 65)',
    minimapFocusBorder: 'mangenta',
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
  lineAnnotation: DEFAULT_ANNOTATION_LINE_STYLE,
  rectAnnotation: DEFAULT_ANNOTATION_RECT_STYLE,
};
