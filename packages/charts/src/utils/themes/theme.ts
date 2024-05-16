/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CSSProperties } from 'react';
import { $Values } from 'utility-types';

import { PartitionStyle } from './partition';
import { BulletStyle } from '../../chart_types/bullet_graph/theme';
import { Color } from '../../common/colors';
import { Pixels, Radian, Ratio } from '../../common/geometry';
import { Font, FontStyle } from '../../common/text_utils';
import { ColorVariant, HorizontalAlignment, RecursivePartial, VerticalAlignment } from '../common';
import { Margins, Padding, SimplePadding } from '../dimensions';
import { Point } from '../point';

/**
 * Base color definitions - theme-specific
 * @public
 */
export interface ChartBaseColors {
  emptyShade: string;
  lightShade: string;
  lightestShade: string;
  mediumShade: string;
  darkShade: string;
  darkestShade: string;
  title: string;
}

/** @public */
export interface Visible {
  visible: boolean;
}

/** @public */
export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  fontStyle?: FontStyle;
  fill: Color;
  padding: number | SimplePadding;
}

/**
 * Offset in pixels
 * @public
 */
export interface TextOffset {
  /**
   * X offset of tick in px or string with % of height
   */
  x: number | string;
  /**
   * X offset of tick in px or string with % of height
   */
  y: number | string;
  /**
   * Offset coordinate system reference
   *
   * - `global` - aligns offset coordinate system to global (non-rotated) coordinate system
   * - `local` - aligns offset coordinate system to local rotated coordinate system
   */
  reference: 'global' | 'local';
}

/**
 * Text alignment
 * @public
 */
export interface TextAlignment {
  horizontal: HorizontalAlignment;
  vertical: VerticalAlignment;
}

/**
 * Tooltip styles
 * @public
 */
export interface TooltipStyle {
  /**
   * Sets max width of tooltip
   */
  maxWidth: NonNullable<CSSProperties['maxWidth']>;
  /**
   * Sets max height of scrolling tooltip table body
   */
  maxTableHeight: CSSProperties['maxHeight'];
  /**
   * Color used as fallback when contrast logic fails
   */
  defaultDotColor: Color;
}

/**
 * Shared style properties for varies geometries
 * @public
 */
export interface GeometryStyle {
  /**
   * Opacity multiplier
   *
   * if set to `0.5` all given opacities will be halfed
   */
  opacity: number;
}

/**
 * Shared style properties for varies geometries
 * @public
 */
export interface GeometryStateStyle {
  /**
   * Opacity multiplier
   *
   * if set to `0.5` all given opacities will be halfed
   */
  opacity: number;
}

/** @public */
export interface SharedGeometryStateStyle<S extends CSSProperties = GeometryStateStyle> {
  default: S;
  highlighted: S;
  unhighlighted: S;
}

/**
 * The stroke color style
 * @public
 */
export interface StrokeStyle<C = Color> {
  /** The stroke color in hex, rgba, hsl */
  stroke: C;
  /** The stroke width in pixel */
  strokeWidth: number;
}

/** @public */
export type TickStyle = StrokeStyle &
  Visible & {
    /**
     * Amount of padding between tick line and labels
     */
    padding: number;
    /**
     * length of tick line
     */
    size: number;
  };

/**
 * The dash array for a stroke
 * @public
 */
export interface StrokeDashArray {
  /** The dash array for dashed strokes */
  dash: number[];
}
/** @public */
export interface FillStyle {
  /** The fill color in hex, rgba, hsl */
  fill: Color;
}
/** @public */
export interface Opacity {
  /** The opacity value from 0 to 1 */
  opacity: number;
}

/** @public */
export interface AxisStyle {
  axisTitle: TextStyle & Visible;
  axisPanelTitle: TextStyle & Visible;
  axisLine: StrokeStyle & Visible;
  tickLabel: TextStyle &
    Visible & {
      /** The degrees of rotation of the tick labels */
      rotation: number;
      /**
       * Offset in pixels to render text relative to anchor
       *
       * **Note:** rotation aligns to global cartesian coordinates
       */
      offset: TextOffset;
      alignment: TextAlignment;
    };
  tickLine: TickStyle;
  gridLine: {
    horizontal: GridLineStyle;
    vertical: GridLineStyle;
    lumaSteps: number[];
  };
}

/**
 * @public
 */
export interface GridLineStyle {
  visible: boolean;
  stroke: Color;
  strokeWidth: number;
  opacity: number;
  dash: number[];
}

/**
 * @public
 */
export interface GoalStyles {
  progressLine: Pick<StrokeStyle, 'stroke'>;
  targetLine: Pick<StrokeStyle, 'stroke'>;
  tickLine: Pick<StrokeStyle, 'stroke'>;
  tickLabel: Omit<TextStyle, 'padding' | 'fontSize'>;
  majorLabel: Omit<TextStyle, 'padding' | 'fontSize'>;
  minorLabel: Omit<TextStyle, 'padding' | 'fontSize'>;
  majorCenterLabel: Omit<TextStyle, 'padding' | 'fontSize'>;
  minorCenterLabel: Omit<TextStyle, 'padding' | 'fontSize'>;
  minFontSize: number;
  maxFontSize: number;
  /**
   * Circular goal/gauge size limit. The chart will _NOT_ be bigger even if there's ample room.
   */
  maxCircularSize: number;
  /**
   * Bullet goal/gauge size limit. The chart will _NOT_ be bigger even if there's ample room.
   */
  maxBulletSize: number;
  /**
   * The bar thickness is a maximum of this fraction of the smaller graph area size
   */
  barThicknessMinSizeRatio: number;
  /**
   * Bar thickness if there's ample room, no need for greater thickness even if there's a large area
   */
  baselineArcThickness: number;
  /**
   * Bar thickness if there's ample room, no need for greater thickness even if there's a large area
   */
  baselineBarThickness: number;
  /**
   * same ratio on each side
   */
  marginRatio: number;
  maxTickFontSize: number;
  maxLabelFontSize: number;
  maxCentralFontSize: number;
  /**
   * 5-degree pitch ie. a circle is 72 steps
   */
  arcBoxSamplePitch: Radian;
  /**
   * mouse hover is detected in the padding too (eg. for Fitts law)
   */
  capturePad: number;
}

/**
 * @public
 */
export interface HeatmapStyle {
  /**
   * Config of the mask over the area outside of the selected cells
   */
  brushMask: { visible: boolean; fill: Color };
  /**
   * Config of the mask over the selected cells
   */
  brushArea: { visible: boolean; fill?: Color; stroke: Color; strokeWidth: number };
  /**
   * Config of the brushing tool
   */
  brushTool: {
    visible: boolean;
    // TODO add support for changing the brush tool color
    fill: Color;
  };
  xAxisLabel: Font & {
    fontSize: Pixels;
    visible: boolean;
    padding: Pixels | Padding;
    /**
     * Positive 0 - 90 degree angle
     * @defaultValue 0
     */
    rotation: number;
  };
  yAxisLabel: Font & {
    fontSize: Pixels;
    width: Pixels | 'auto' | { max: Pixels };
    visible: boolean;
    padding: Pixels | Padding;
  };
  grid: {
    stroke: {
      color: string;
      width: number;
    };
  };
  cell: {
    maxWidth: Pixels | 'fill';
    maxHeight: Pixels | 'fill';
    align: 'center';
    label: Font & {
      minFontSize: Pixels;
      maxFontSize: Pixels;
      useGlobalMinFontSize: boolean;
      maxWidth: Pixels | 'fill';
      visible: boolean;
    };
    border: {
      strokeWidth: Pixels;
      stroke: Color;
    };
  };
  maxLegendHeight?: number;
}

/** @public */
export interface MetricStyle {
  text: {
    darkColor: Color;
    lightColor: Color;
  };
  border: Color;
  barBackground: Color;
  emptyBackground: Color;
  /**
   * Optional color used to blend transparent colors. Defaults to `Theme.background`
   */
  blendingBackground?: Color;
  nonFiniteText: string;
  minHeight: Pixels;
  value: {
    fontSize: 'default' | 'auto' | number;
  };
}

/** @alpha */
export interface FlamegraphStyle {
  navigation: {
    textColor: Color;
    buttonTextColor: Color;
    buttonDisabledTextColor: Color;
    buttonBackgroundColor: Color;
    buttonDisabledBackgroundColor: Color;
  };
  scrollbarTrack: Color;
  scrollbarThumb: Color;
}

/** @public */
export interface ScalesConfig {
  /**
   * The proportion of the range that is reserved for blank space between bands.
   * A value of 0 means no blank space between bands, and a value of 1 means a bandwidth of zero.
   * A number between 0 and 1.
   */
  barsPadding: number;
  /**
   * The proportion of the range that is reserved for blank space between bands in histogramMode.
   * A value of 0 means no blank space between bands, and a value of 1 means a bandwidth of zero.
   * A number between 0 and 1.
   */
  histogramPadding: number;
}
/** @public */
export interface ColorConfig {
  vizColors: Color[];
  defaultVizColor: Color;
}
/**
 * The background style applied to the chart.
 * This is used to coordinate adequate contrast of the text in partition and treemap charts.
 * @public
 */
export interface BackgroundStyle {
  /**
   * The background color
   */
  color: string;
  /**
   * The fallback background color used for constrast logic.
   * Must be opaque, alpha value will be ignored otherwise.
   */
  fallbackColor: Color;
}

/** @public */
export interface LegendLabelOptions {
  /**
   * Sets maxlines allowable before truncating
   *
   * Setting value to `0` will _never_ truncate the text
   *
   * @defaultValue 1
   */
  maxLines: number;
}

/** @public */
export interface LegendStyle {
  /**
   * Max width used for left/right legend
   *
   * or
   *
   * Width of `LegendItem` for top/bottom legend
   */
  verticalWidth: number;
  /**
   * Max height used for top/bottom legend
   */
  horizontalHeight: number;
  /**
   * Added buffer between label and value.
   *
   * Smaller values render a more compact legend
   */
  spacingBuffer: number;
  /**
   * Legend padding. The Chart margins are independent of the legend.
   *
   * TODO: make SimplePadding when after axis changes are added
   */
  margin: number;
  /**
   * Options to control legend labels
   */
  labelOptions: LegendLabelOptions;
}
/** @public */
export interface Theme {
  /**
   * Space btw parent DOM element and first available element of the chart (axis if exists, else the chart itself)
   */
  chartMargins: Margins;
  /**
   * Space btw the chart geometries and axis; if no axis, pads space btw chart & container
   */
  chartPaddings: Margins;
  /**
   * Global line styles.
   *
   * __Note:__ This is not used to set the color of a specific series. As such, any changes to the styles will not be reflected in the tooltip, legend, etc..
   *
   * You may use `SeriesColorAccessor` to assign colors to a given series or replace the `theme.colors.vizColors` colors to your desired colors.
   */
  lineSeriesStyle: LineSeriesStyle;
  /**
   * Global area styles.
   *
   * __Note:__ This is not used to set the color of a specific series. As such, any changes to the styles will not be reflected in the tooltip, legend, etc..
   *
   * You may use `SeriesColorAccessor` to assign colors to a given series or replace the `theme.colors.vizColors` colors to your desired colors.
   */
  areaSeriesStyle: AreaSeriesStyle;
  /**
   * Global bar styles.
   *
   * __Note:__ This is not used to set the color of a specific series. As such, any changes to the styles will not be reflected in the tooltip, legend, etc..
   *
   * You may use `SeriesColorAccessor` to assign colors to a given series or replace the `theme.colors.vizColors` colors to your desired colors.
   */
  barSeriesStyle: BarSeriesStyle;
  /**
   * Global bubble styles.
   *
   * __Note:__ This is not used to set the color of a specific series. As such, any changes to the styles will not be reflected in the tooltip, legend, etc..
   *
   * You may use `SeriesColorAccessor` to assign colors to a given series or replace the `theme.colors.vizColors` colors to your desired colors.
   */
  bubbleSeriesStyle: BubbleSeriesStyle;
  arcSeriesStyle: ArcSeriesStyle;
  sharedStyle: SharedGeometryStateStyle;
  axes: AxisStyle;
  scales: ScalesConfig;
  colors: ColorConfig;
  legend: LegendStyle;
  crosshair: CrosshairStyle;
  /**
   * Used to scale radius with `markSizeAccessor`
   *
   * value from 1 to 100
   */
  markSizeRatio?: number;
  /**
   * The background allows the consumer to provide a color of the background container of the chart.
   * This can then be used to calculate the contrast of the text for partition charts.
   */
  background: BackgroundStyle;
  /**
   * Theme styles for goal and gauge chart types
   */
  goal: GoalStyles;
  /**
   * Theme styles for partition chart types
   */
  partition: PartitionStyle;
  /**
   * Theme styles for heatmap chart types
   */
  heatmap: HeatmapStyle;
  /**
   * Theme styles for metric chart types
   */
  metric: MetricStyle;

  /**
   * Theme styles for bullet graph types
   */
  bulletGraph: BulletStyle;
  /**
   * Theme styles for tooltip
   */
  tooltip: TooltipStyle;

  /** @alpha */
  flamegraph: FlamegraphStyle;

  highlighter: HighlighterStyle;

  lineAnnotation: LineAnnotationStyle;

  rectAnnotation: RectAnnotationStyle;
}

/** @public */
export type PartialTheme = RecursivePartial<Theme>;

/** @public */
export type DisplayValueStyle = Omit<TextStyle, 'fill' | 'fontSize'> & {
  offsetX: number;
  offsetY: number;
  fontSize:
    | number
    | {
        min: number;
        max: number;
      };
  fill:
    | Color
    | { color: Color; borderColor?: Color; borderWidth?: number }
    | {
        textBorder?: number;
      };
  alignment?: {
    horizontal: Exclude<HorizontalAlignment, 'far' | 'near'>;
    vertical: Exclude<VerticalAlignment, 'far' | 'near'>;
  };
};

/** @public */
export const PointShape = Object.freeze({
  Circle: 'circle' as const,
  Square: 'square' as const,
  Diamond: 'diamond' as const,
  Plus: 'plus' as const,
  X: 'x' as const,
  Triangle: 'triangle' as const,
});
/** @public */
export type PointShape = $Values<typeof PointShape>;

/** @public */
export interface PointStyle {
  /** is the point visible or hidden */
  visible: boolean;
  /** a static stroke color if defined, if not it will use the color of the series */
  stroke?: Color | ColorVariant;
  /** the stroke width of the point */
  strokeWidth: number;
  /**  a static fill color if defined, if not it will use the color of the series */
  fill?: Color | ColorVariant;
  /** the opacity of each point on the theme/series */
  opacity: number;
  /** the radius of each point of the theme/series */
  radius: Pixels;
  /** shape for the point, default to circle */
  shape?: PointShape;
}

/** @public */
export interface LineStyle {
  /** is the line visible or hidden ? */
  visible: boolean;
  /** a static stroke color if defined, if not it will use the color of the series */
  stroke?: Color | ColorVariant;
  /** the stroke width of the line */
  strokeWidth: number;
  /** the opacity of each line on the theme/series */
  opacity: number;
  /** the dash array */
  dash?: number[];
}

/** @public */
export const TextureShape = Object.freeze({
  ...PointShape,
  Line: 'line' as const,
});
/** @public */
export type TextureShape = $Values<typeof TextureShape>;

/** @public */
export interface TexturedStylesBase {
  /** polygon fill color for texture */
  fill?: Color | ColorVariant;
  /** polygon stroke color for texture */
  stroke?: Color | ColorVariant;
  /** polygon stroke width for texture  */
  strokeWidth?: number;
  /** polygon opacity for texture  */
  opacity?: number;
  /** polygon opacity for texture  */
  dash?: number[];
  /** polygon opacity for texture  */
  size?: number;
  /**
   * The angle of rotation for entire texture
   * in degrees
   */
  rotation?: number;
  /**
   * The angle of rotation for polygons
   * in degrees
   */
  shapeRotation?: number;
  /** texture spacing between polygons */
  spacing?: Partial<Point> | number;
  /** overall origin offset of pattern */
  offset?: Partial<Point> & {
    /** apply offset along global coordinate axes */
    global?: boolean;
  };
}

/** @public */
export interface TexturedShapeStyles extends TexturedStylesBase {
  /** typed of texture designs currently supported */
  shape: TextureShape;
}

/** @public */
export interface TexturedPathStyles extends TexturedStylesBase {
  /** path for polygon texture */
  path: string | Path2D;
}

/**
 * @public
 *
 * Texture style config for area spec
 */
export type TexturedStyles = TexturedPathStyles | TexturedShapeStyles;

/** @public */
export interface AreaStyle {
  /** applying textures to the area on the theme/series */
  texture?: TexturedStyles;
  /** is the area is visible or hidden ? */
  visible: boolean;
  /** a static fill color if defined, if not it will use the color of the series */
  fill?: Color | ColorVariant;
  /** the opacity of each area on the theme/series */
  opacity: number;
}

/** @public */
export interface ArcStyle {
  /** is the arc is visible or hidden ? */
  visible: boolean;
  /** a static fill color if defined, if not it will use the color of the series */
  fill?: Color | ColorVariant;
  /** a static stroke color if defined, if not it will use the color of the series */
  stroke?: Color | ColorVariant;
  /** the stroke width of the line */
  strokeWidth: number;
  /** the opacity of each arc on the theme/series */
  opacity: number;
}

/** @public */
export interface RectStyle {
  /** a static fill color if defined, if not it will use the color of the series */
  fill?: Color | ColorVariant;
  /** the opacity of each rect on the theme/series */
  opacity: number;
  /** The width of the rect in pixel. If expressed together with `widthRatio` then the `widthRatio`
   * will express the max available size, where the `widthPixel` express the derived/min width. */
  widthPixel?: Pixels;
  /** The ratio of the width limited to [0,1]. If expressed together with `widthPixel` then the `widthRatio`
   * will express the max available size, where the `widthPixel` express the derived/min width. */
  widthRatio?: Ratio;
  /** applying textures to the bar on the theme/series */
  texture?: TexturedStyles;
}

/** @public */
export interface RectBorderStyle {
  /**
   * Border visibility
   */
  visible: boolean;
  /**
   * Border stroke color
   */
  stroke?: Color | ColorVariant;
  /**
   * Border stroke width
   */
  strokeWidth: number;
  /**
   * Border stroke opacity
   */
  strokeOpacity?: number;
}
/** @public */
export interface BarSeriesStyle {
  rect: RectStyle;
  rectBorder: RectBorderStyle;
  displayValue: DisplayValueStyle;
}

/** @public */
export interface BubbleSeriesStyle {
  point: PointStyle;
}

/** @public */
export interface LineSeriesStyle {
  line: LineStyle;
  point: PointStyle;
  isolatedPoint: PointStyle;
  fit: {
    line: LineFitStyle;
  };
}

/** @public */
export interface AreaSeriesStyle {
  area: AreaStyle;
  line: LineStyle;
  point: PointStyle;
  isolatedPoint: PointStyle;
  fit: {
    line: LineFitStyle;
    area: AreaFitStyle;
  };
}

/** @public */
export type AreaFitStyle = Visible &
  Opacity & {
    fill: Color | typeof ColorVariant.Series;
    texture?: TexturedStyles;
  };

/** @public */
export type LineFitStyle = Visible &
  Opacity &
  StrokeDashArray & {
    stroke: Color | typeof ColorVariant.Series;
  };

/** @public */
export interface ArcSeriesStyle {
  arc: ArcStyle;
}

/** @public */
export interface CrosshairStyle {
  band: FillStyle & Visible;
  line: StrokeStyle & Visible & Partial<StrokeDashArray>;
  crossLine: StrokeStyle & Visible & Partial<StrokeDashArray>;
}

/**
 * The style for a linear annotation
 * @public
 */
export interface LineAnnotationStyle {
  /**
   * The style for the line geometry
   */
  line: StrokeStyle & Opacity & Partial<StrokeDashArray>;
}

/** @public */
export type RectAnnotationStyle = StrokeStyle & FillStyle & Opacity & Partial<StrokeDashArray>;

/** @public */
export interface HighlighterStyle {
  point: {
    fill: Color | ColorVariant;
    stroke: Color | ColorVariant;
    strokeWidth: Pixels;
    opacity: Ratio;
    radius: Pixels;
  };
}
