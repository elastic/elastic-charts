/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { OpacityFn } from '../../../common/color_library_wrappers';
import { colorToRgba, overrideOpacity } from '../../../common/color_library_wrappers';
import { getColorFromVariant, mergePartial } from '../../../utils/common';
import type { PointGeometryStyle } from '../../../utils/geometry';
import type { PointStyle } from '../../../utils/themes/theme';
import { PointShape } from '../../../utils/themes/theme';

/** @internal */
export function buildPointGeometryStyles(
  color: string,
  themePointStyle: Omit<PointStyle, 'radius' | 'visible'>,
  overrides?: Partial<PointStyle>,
): PointGeometryStyle {
  const pointStyle = mergePartial(themePointStyle, overrides);
  const opacityFn: OpacityFn = (opacity) => opacity * pointStyle.opacity;
  return {
    fill: { color: overrideOpacity(colorToRgba(getColorFromVariant(color, pointStyle.fill)), opacityFn) },
    stroke: {
      color: overrideOpacity(colorToRgba(getColorFromVariant(color, pointStyle.stroke)), opacityFn),
      width: pointStyle.strokeWidth,
    },
    shape: pointStyle.shape ?? PointShape.Circle,
  };
}
