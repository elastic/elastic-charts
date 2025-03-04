/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { overrideOpacity } from '../../../../common/color_library_wrappers';
import type { Fill, Stroke } from '../../../../geoms/types';
import type { GenericDomain } from '../../../../utils/domain';
import type { GeometryStateStyle, SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import type { Cell } from '../../layout/types/viewmodel_types';
import { isValueInRanges } from '../../layout/viewmodel/viewmodel';

/** @internal */
export function getGeometryStateStyle(
  cell: Cell,
  sharedGeometryStyle: SharedGeometryStateStyle,
  highlightedLegendBands: Array<GenericDomain>,
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
