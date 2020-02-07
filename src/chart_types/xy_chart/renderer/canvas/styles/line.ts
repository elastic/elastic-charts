import { GeometryStateStyle, LineStyle } from '../../../../../utils/themes/theme';
import { stringToRGB } from '../../../../partition_chart/layout/utils/d3_utils';
import { Stroke } from '../../../../../geoms/types';

/**
 * Return the rendering props for a line. The color of the line will be overwritten
 * by the stroke color of the lineStyle parameter if present
 * @param baseColor the computed color of the line for this series
 * @param themeStyle the line theme style
 * @param geometryStateStyle the highlight geometry style
 */
export function buildLineStyles(
  baseColor: string,
  themeStyle: LineStyle,
  geometryStateStyle: GeometryStateStyle,
): Stroke {
  const strokeColor = stringToRGB(themeStyle.stroke || baseColor);
  strokeColor.opacity = strokeColor.opacity * themeStyle.opacity * geometryStateStyle.opacity;
  return {
    color: strokeColor,
    width: themeStyle.strokeWidth,
    dash: themeStyle.dash,
  };
}
