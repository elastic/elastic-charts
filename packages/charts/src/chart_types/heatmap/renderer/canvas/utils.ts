/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { colorToRgba, RGBATupleToString } from '../../../../common/color_library_wrappers';
import type { Fill, Stroke } from '../../../../geoms/types';
import { getColorFromVariant } from '../../../../utils/common';
import type { GeometryHighlightState } from '../../../../utils/geometry';
import type { Theme } from '../../../../utils/themes/theme';
import type { Cell } from '../../layout/types/viewmodel_types';

/** @internal */
export function getCellStyle(
  cell: Cell,
  highlightState: GeometryHighlightState,
  cellStyle: Theme['heatmap']['cell'],
): { fill: Fill; stroke: Stroke } {
  const cellColorAsString = RGBATupleToString(cell.fill.color);
  const cellStrokeAsString = RGBATupleToString(cell.stroke.color);
  switch (highlightState) {
    case 'default':
    case 'highlighted':
      return {
        fill: cell.fill,
        stroke: cell.stroke,
      };
    case 'dimmed':
      return {
        fill: {
          ...cell.fill,
          color: colorToRgba(getColorFromVariant(cellColorAsString, cellStyle.dimmed.fill)),
        },
        stroke: {
          ...cell.stroke,
          color: colorToRgba(getColorFromVariant(cellStrokeAsString, cellStyle.dimmed.stroke)),
        },
      };
  }
}
