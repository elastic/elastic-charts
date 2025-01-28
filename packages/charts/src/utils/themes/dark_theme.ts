/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  DARK_TEXT_COLORS,
  DARK_BORDER_COLORS,
  DARK_BACKGROUND_COLORS,
  DARK_BACKGROUND_COLORS_CUSTOM,
  LIGHT_TEXT_COLORS,
} from './base_colors';
import { palettes } from './colors';
import { Theme } from './theme';
import { DEFAULT_CHART_MARGINS, DEFAULT_CHART_PADDING, DEFAULT_GEOMETRY_STYLES } from './theme_common';
import { DARK_THEME_BULLET_STYLE } from '../../chart_types/bullet_graph/theme';
import { Colors } from '../../common/colors';
import { TAU } from '../../common/constants';
import { DEFAULT_FONT_FAMILY } from '../../common/default_theme_attributes';
import { ColorVariant } from '../common';

/** @public */
export const DARK_THEME: Theme = {
  chartPaddings: DEFAULT_CHART_PADDING,
  chartMargins: DEFAULT_CHART_MARGINS,
  lineSeriesStyle: {
    line: {
      visible: true,
      strokeWidth: 2,
      opacity: 1,
    },
    point: {
      visible: 'auto',
      strokeWidth: 0,
      stroke: ColorVariant.None,
      fill: ColorVariant.Series,
      radius: 3,
      opacity: 1,
    },
    isolatedPoint: {
      enabled: true,
      visible: 'auto',
      strokeWidth: 0,
      stroke: ColorVariant.None,
      fill: ColorVariant.Series,
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
    pointVisibilityMinDistance: 40,
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
      strokeWidth: 2,
      opacity: 1,
    },
    point: {
      visible: 'never',
      strokeWidth: 0,
      stroke: ColorVariant.None,
      fill: ColorVariant.Series,
      radius: 3,
      opacity: 1,
    },
    isolatedPoint: {
      enabled: true,
      visible: 'auto',
      stroke: ColorVariant.None,
      strokeWidth: 0,
      fill: ColorVariant.Series,
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
      fontFamily: DEFAULT_FONT_FAMILY,
      padding: {
        inner: 10,
        outer: 0,
      },
      fill: DARK_TEXT_COLORS.textParagraph,
      visible: true,
    },
    axisPanelTitle: {
      fontSize: 10,
      fontFamily: DEFAULT_FONT_FAMILY,
      padding: {
        inner: 8,
        outer: 0,
      },
      fill: DARK_TEXT_COLORS.textParagraph,
      visible: true,
    },
    axisLine: {
      visible: true,
      stroke: DARK_BORDER_COLORS.borderBaseSubdued,
      strokeWidth: 1,
    },
    tickLabel: {
      visible: true,
      fontSize: 10,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontStyle: 'normal',
      fill: DARK_TEXT_COLORS.textSubdued,
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
      stroke: DARK_BORDER_COLORS.borderBaseSubdued,
      strokeWidth: 1,
      size: 10,
      padding: 10,
    },
    gridLine: {
      horizontal: {
        visible: true,
        stroke: DARK_BORDER_COLORS.borderBaseSubdued,
        strokeWidth: 1,
        opacity: 1,
        dash: [0, 0],
      },
      vertical: {
        visible: true,
        stroke: DARK_BORDER_COLORS.borderBaseSubdued,
        strokeWidth: 1,
        opacity: 1,
        dash: [0, 0],
      },
      lumaSteps: [63, 103, 159, 191, 223, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
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
      fill: DARK_BACKGROUND_COLORS.backgroundBaseInteractiveHover,
    },
    line: {
      visible: true,
      stroke: DARK_BORDER_COLORS.borderBasePlain,
      strokeWidth: 1,
      dash: [4, 4],
    },
    crossLine: {
      visible: true,
      stroke: DARK_BORDER_COLORS.borderBasePlain,
      strokeWidth: 1,
      dash: [4, 4],
    },
  },
  background: {
    color: DARK_BACKGROUND_COLORS.backgroundBasePlain,
    fallbackColor: DARK_BACKGROUND_COLORS.backgroundBasePlain,
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
      fill: '#81858f',
    },
    majorLabel: {
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#DFE5EF',
    },
    minorLabel: {
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#81858f',
    },
    majorCenterLabel: {
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#DFE5EF',
    },
    minorCenterLabel: {
      fontStyle: 'normal',
      fontFamily: DEFAULT_FONT_FAMILY,
      fill: '#81858f',
    },
    targetLine: {
      stroke: '#D4DAE5',
    },
    tickLine: {
      stroke: '#535966',
    },
    progressLine: {
      stroke: '#D4DAE5',
    },
  },
  partition: {
    outerSizeRatio: 1,
    emptySizeRatio: 0,
    fontFamily: DEFAULT_FONT_FAMILY,
    minFontSize: 8,
    maxFontSize: 64,
    idealFontSizeJump: 1.05,
    maximizeFontSize: false,
    circlePadding: 4,
    radialPadding: TAU / 360,
    horizontalTextAngleThreshold: TAU / 12,
    horizontalTextEnforcer: 1,
    fillLabel: {
      textColor: ColorVariant.Adaptive,
      fontFamily: DEFAULT_FONT_FAMILY,
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
      fontFamily: DEFAULT_FONT_FAMILY,
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
      textColor: DARK_TEXT_COLORS.textParagraph,
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
    sectorLineStroke: DARK_BACKGROUND_COLORS.backgroundBasePlain,
  },
  heatmap: {
    brushArea: {
      visible: true,
      stroke: DARK_BORDER_COLORS.borderBasePlain,
      strokeWidth: 2,
    },
    brushMask: {
      visible: true,
      fill: DARK_BACKGROUND_COLORS_CUSTOM.backgroundBasePlainAlpha70,
    },
    brushTool: {
      visible: false,
      fill: DARK_BACKGROUND_COLORS_CUSTOM.backgroundBasePlainAlpha70,
    },

    xAxisLabel: {
      visible: true,
      fontSize: 12,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontStyle: 'normal',
      textColor: DARK_TEXT_COLORS.textSubdued,
      fontVariant: 'normal',
      fontWeight: 'normal',
      padding: { top: 5, bottom: 5, left: 5, right: 5 },
      rotation: 0,
    },
    yAxisLabel: {
      visible: true,
      width: 'auto',
      fontSize: 12,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontStyle: 'normal',
      textColor: DARK_TEXT_COLORS.textSubdued,
      fontVariant: 'normal',
      fontWeight: 'normal',
      padding: { top: 5, bottom: 5, left: 5, right: 5 },
    },
    grid: {
      stroke: {
        width: 1,
        color: DARK_BORDER_COLORS.borderBaseSubdued,
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
        fontFamily: DEFAULT_FONT_FAMILY,
        fontStyle: 'normal',
        textColor: Colors.White.keyword,
        fontVariant: 'normal',
        fontWeight: 'normal',
        useGlobalMinFontSize: true,
      },
      border: {
        strokeWidth: 0,
        stroke: DARK_BORDER_COLORS.borderBaseSubdued,
      },
    },
  },
  metric: {
    textLightColor: DARK_TEXT_COLORS.textHeading,
    textDarkColor: LIGHT_TEXT_COLORS.textHeading,
    valueFontSize: 'default',
    minValueFontSize: 12,
    titlesTextAlign: 'left',
    valuesTextAlign: 'right',
    iconAlign: 'right',
    border: DARK_BORDER_COLORS.borderBaseSubdued,
    barBackground: DARK_BACKGROUND_COLORS.backgroundBaseDisabled,
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
  // TODO map colors to base color mappings
  flamegraph: {
    navigation: {
      textColor: DARK_TEXT_COLORS.textHeading,
      buttonTextColor: DARK_TEXT_COLORS.textInverse,
      buttonDisabledTextColor: DARK_TEXT_COLORS.textDisabled,
      buttonBackgroundColor: DARK_BACKGROUND_COLORS.backgroundFilledPrimary,
      buttonDisabledBackgroundColor: DARK_BACKGROUND_COLORS.backgroundBaseDisabled,
    },
    scrollbarThumb: DARK_BACKGROUND_COLORS.backgroundFilledText,
    scrollbarTrack: DARK_BACKGROUND_COLORS.backgroundBaseDisabled,
    minimapFocusBorder: DARK_BACKGROUND_COLORS.backgroundFilledAccent,
  },
  highlighter: {
    point: {
      opacity: 0.5,
      fill: ColorVariant.Series,
      stroke: ColorVariant.None,
      strokeWidth: 0,
      radius: 5,
    },
  },
  lineAnnotation: {
    line: {
      stroke: '#98A2B3',
      strokeWidth: 1,
      opacity: 1,
    },
  },
  rectAnnotation: {
    strokeWidth: 0,
    opacity: 0.25,
    fill: '#98A2B3',
    stroke: '#98A2B3',
  },
};
