/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { overrideOpacity } from '../../../../common/color_library_wrappers';
import { Fill, Stroke } from '../../../../geoms/types';
import { GeometryStateStyle, SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { Cell } from '../../layout/types/viewmodel_types';
import { isValueInRanges } from '../../layout/viewmodel/viewmodel';

/** @internal */
export function getGeometryStateStyle(
  cell: Cell,
  sharedGeometryStyle: SharedGeometryStateStyle,
  highlightedLegendBands: Array<[start: number, end: number]>,
): GeometryStateStyle {
  const { default: defaultStyles, highlighted, unhighlighted } = sharedGeometryStyle;

  if (highlightedLegendBands.length > 0) {
    const isHighlightedBand = isValueInRanges(cell.value, highlightedLegendBands);
    return isHighlightedBand ? highlighted : unhighlighted;
  }

  return defaultStyles;
}

/** @internal */
export function getColorBandStyle(cell: Cell, geometryStateStyle: GeometryStateStyle): { fill: Fill; stroke: Stroke } {
  const fillColor = overrideOpacity(cell.fill.color, (opacity) => opacity * geometryStateStyle.opacity);
  const fill: Fill = {
    ...cell.fill,
    color: fillColor,
  };

  const strokeColor = overrideOpacity(cell.stroke.color, (opacity) => opacity * geometryStateStyle.opacity);
  const stroke: Stroke = {
    ...cell.stroke,
    color: strokeColor,
  };
  return { fill, stroke };
}
