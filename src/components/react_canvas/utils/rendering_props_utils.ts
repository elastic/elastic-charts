import {
  AreaStyle,
  LineStyle,
  PointStyle,
  RectBorderStyle,
  RectStyle,
  ArcStyle,
  GeometryStyle,
} from '../../../utils/themes/theme';
import { GlobalKonvaElementProps } from '../globals';
import { RectConfig, PathConfig, CircleConfig } from 'konva';

export interface PointStyleProps {
  radius: number;
  stroke: string;
  strokeWidth: number;
  strokeEnabled: boolean;
  fill: string;
  opacity: number;
}

/**
 * Return the style of a point.
 * The color value is used for stroke or fill if they are undefind in the PointStyle
 * @param color the series color
 * @param pointStyle the merged point style
 */
export function buildPointStyleProps(
  color: string,
  pointStyle: PointStyle,
  geometryStyle: GeometryStyle,
): PointStyleProps {
  const { strokeWidth, opacity } = pointStyle;
  const stroke = pointStyle.stroke || color;
  const fill = pointStyle.fill || color;
  return {
    radius: pointStyle.radius,
    stroke,
    strokeWidth,
    strokeEnabled: strokeWidth !== 0,
    fill: fill,
    ...geometryStyle,
    opacity: opacity * geometryStyle.opacity,
  };
}

/**
 * Return the rendering props for a point
 * @param x the x position of the point
 * @param y the y position of the point
 * @param pointStyleProps the style props of the point
 */
export function buildPointRenderProps(x: number, y: number, pointStyleProps: PointStyleProps): CircleConfig {
  return {
    x,
    y,
    ...pointStyleProps,
    ...GlobalKonvaElementProps,
  };
}

/**
 * Return the rendering props for a line. The color of the line will be overwritten
 * by the stroke color of the lineStyle parameter if present
 * @param x the horizontal offset to place the line
 * @param linePath the SVG line path
 * @param color the computed color of the line for this series
 * @param lineStyle the line style
 * @param geometryStyle the highlight geometry style
 */
export function buildLineRenderProps(
  x: number,
  linePath: string,
  color: string,
  lineStyle: LineStyle,
  geometryStyle: GeometryStyle,
): PathConfig {
  const opacity = lineStyle.opacity * geometryStyle.opacity;

  return {
    x,
    data: linePath,
    stroke: lineStyle.stroke || color,
    strokeWidth: lineStyle.strokeWidth,
    lineCap: 'round',
    lineJoin: 'round',
    ...geometryStyle,
    opacity, // want to override opactiy of geometryStyle
    ...GlobalKonvaElementProps,
  };
}

/**
 * Return the rendering props for an area. The color of the area will be overwritten
 * by the fill color of the areaStyle parameter if present
 * @param areaPath the SVG area path
 * @param x the horizontal offset to place the area
 * @param color the computed color of the line for this series
 * @param areaStyle the area style
 * @param geometryStyle the highlight geometry style
 */
export function buildAreaRenderProps(
  xTransform: number,
  areaPath: string,
  color: string,
  areaStyle: AreaStyle,
  geometryStyle: GeometryStyle,
): PathConfig {
  const opacity = areaStyle.opacity * geometryStyle.opacity;

  return {
    x: xTransform,
    data: areaPath,
    fill: areaStyle.fill || color,
    lineCap: 'round',
    lineJoin: 'round',
    ...geometryStyle,
    opacity, // want to override opactiy of geometryStyle
    ...GlobalKonvaElementProps,
  };
}

/**
 * Return the rendering props for a bar. The color of the bar will be overwritten
 * by the fill color of the rectStyle parameter if present
 * @param x the x position of the rect
 * @param y the y position of the rect
 * @param width the width of the rect
 * @param height the height of the rect
 * @param color the computed color of the rect for this series
 * @param rectStyle the rect style
 * @param geometryStyle the highlight geometry style
 */
export function buildBarRenderProps(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  rectStyle: RectStyle,
  borderStyle: RectBorderStyle,
  geometryStyle: GeometryStyle,
): RectConfig {
  const opacity = rectStyle.opacity * geometryStyle.opacity;
  const { stroke, visible, strokeWidth, strokeOpacity = 0 } = borderStyle;
  const offset = !visible || strokeWidth <= 0 || !stroke || strokeOpacity <= 0 || opacity <= 0 ? 0 : strokeWidth;

  return {
    x: x + offset,
    y: y + offset,
    width: width - 2 * offset,
    height: height - 2 * offset,
    fill: rectStyle.fill || color,
    strokeEnabled: false,
    ...geometryStyle,
    opacity, // want to override opactiy of geometryStyle
    ...GlobalKonvaElementProps,
  };
}

/**
 * Return the rendering props for a bar. The color of the bar will be overwritten
 * by the fill color of the rectStyle parameter if present
 * @param x the x position of the rect
 * @param y the y position of the rect
 * @param width the width of the rect
 * @param height the height of the rect
 * @param color the computed color of the rect for this series
 * @param rectStyle the rect style
 * @param borderStyle the border rect style
 * @param geometryStyle the highlight geometry style
 */
export function buildBarBorderRenderProps(
  x: number,
  y: number,
  width: number,
  height: number,
  rectStyle: RectStyle,
  borderStyle: RectBorderStyle,
  geometryStyle: GeometryStyle,
): RectConfig | null {
  const { stroke, visible, strokeWidth, strokeOpacity = rectStyle.opacity } = borderStyle;
  const opacity = strokeOpacity * geometryStyle.opacity;

  if (!visible || strokeWidth <= 0 || !stroke || opacity <= 0) {
    return null;
  }

  return {
    x: x + strokeWidth / 2,
    y: y + strokeWidth / 2,
    width: width - strokeWidth,
    height: height - strokeWidth,
    fillEnabled: false,
    strokeEnabled: true,
    strokeWidth,
    stroke,
    ...geometryStyle,
    opacity, // want to override opactiy of geometryStyle
    ...GlobalKonvaElementProps,
  };
}

/**
 * Return the rendering props for an arc. The color of the arc will be overwritten
 * by the fill color of the arcStyle parameter if present
 * @param arcPath the SVG arc path
 * @param x the horizontal offset to place the arc
 * @param color the computed color of the line for this series
 * @param arcStyle the arc style
 * @param geometryStyle the highlight geometry style
 */
export function buildArcRenderProps(
  transform: { x: number; y: number },
  arcPath: string,
  color: string,
  arcStyle: ArcStyle,
  geometryStyle: GeometryStyle,
) {
  return {
    x: transform.x,
    y: transform.y,
    data: arcPath,
    fill: arcStyle.fill || color,
    stroke: arcStyle.stroke,
    strokeWidth: arcStyle.strokeWidth,
    lineCap: 'round',
    lineJoin: 'round',
    ...geometryStyle,
    ...GlobalKonvaElementProps,
  };
}
