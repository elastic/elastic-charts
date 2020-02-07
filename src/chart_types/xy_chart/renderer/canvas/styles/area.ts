import { GeometryStateStyle, AreaStyle } from '../../../../../utils/themes/theme';
import { stringToRGB } from '../../../../partition_chart/layout/utils/d3_utils';
import { Fill } from '../../../../../geoms/types';

/**
 * Return the rendering props for a line. The color of the line will be overwritten
 * by the stroke color of the lineStyle parameter if present
 * @param baseColor the computed color of the line for this series
 * @param themeStyle the line theme style
 * @param geometryStateStyle the highlight geometry style
 */
export function buildAreaStyles(
  baseColor: string,
  themeStyle: AreaStyle,
  geometryStateStyle: GeometryStateStyle,
): Fill {
  const fillColor = stringToRGB(themeStyle.fill || baseColor);
  fillColor.opacity = fillColor.opacity * themeStyle.opacity * geometryStateStyle.opacity;
  return {
    color: fillColor,
  };
}
