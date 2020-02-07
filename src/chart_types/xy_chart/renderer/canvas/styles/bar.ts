import { GeometryStateStyle, RectStyle, RectBorderStyle } from '../../../../../utils/themes/theme';
import { stringToRGB } from '../../../../partition_chart/layout/utils/d3_utils';
import { Stroke, Fill } from '../../../../../geoms/types';

export function buildBarStyles(
  color: string,
  rect: RectStyle,
  rectBorder: RectBorderStyle,
  geometryStateStyle: GeometryStateStyle,
): { fill: Fill; stroke: Stroke } {
  const fillColor = stringToRGB(rect.fill || color);
  // rectStyle.opacity * geometryStateStyle.opacity;
  const fillOpacity = rect.opacity * geometryStateStyle.opacity;
  fillColor.opacity = fillOpacity;
  const fill: Fill = {
    color: fillColor,
  };
  const strokeColor = stringToRGB(rectBorder.stroke || color);
  const defaultStrokeOpacity = rectBorder.strokeOpacity === undefined ? rect.opacity : rectBorder.strokeOpacity;
  const borderStrokeOpacity = defaultStrokeOpacity * geometryStateStyle.opacity;
  strokeColor.opacity = strokeColor.opacity * borderStrokeOpacity;
  const stroke: Stroke = {
    color: strokeColor,
    width: rectBorder.visible ? rectBorder.strokeWidth : 0,
  };
  return { fill, stroke };
}
