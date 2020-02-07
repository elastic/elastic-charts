import { PointStyle, GeometryStateStyle } from '../../../../../utils/themes/theme';
import { stringToRGB } from '../../../../partition_chart/layout/utils/d3_utils';
import { Fill, Stroke } from '../../../../../geoms/types';
import { mergePartial } from '../../../../../utils/commons';

/**
 * Return the style of a point.
 * The color value is used for stroke or fill if they are undefind in the PointStyle
 * @param baseColor the series color
 * @param themeStyle the theme style or the merged point style if a custom PointStyle is applied
 * @param geometryStateStyle the state style of the geometry
 */
export function buildPointStyles(
  baseColor: string,
  themeStyle: PointStyle,
  geometryStateStyle: GeometryStateStyle,
  overrides?: Partial<PointStyle>,
): { fill: Fill; stroke: Stroke; radius: number } {
  const pointStyle = mergePointStyles(themeStyle, overrides);
  const fillColor = stringToRGB(pointStyle.fill || baseColor);
  fillColor.opacity = fillColor.opacity * pointStyle.opacity * geometryStateStyle.opacity;
  const fill: Fill = {
    color: fillColor,
  };

  const strokeColor = stringToRGB(pointStyle.stroke || baseColor);
  strokeColor.opacity = strokeColor.opacity * pointStyle.opacity * geometryStateStyle.opacity;
  const stroke: Stroke = {
    color: strokeColor,
    width: pointStyle.strokeWidth,
  };

  const radius = overrides && overrides.radius ? overrides.radius : themeStyle.radius;
  return { fill, stroke, radius };
}

function mergePointStyles(defaultStyle: PointStyle, overrides?: Partial<PointStyle>): PointStyle {
  if (!overrides) {
    return defaultStyle;
  }

  return mergePartial(defaultStyle, overrides);
}
