/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { GenericDomain } from '../../../utils/domain';
import type { GeometryHighlightState } from '../../../utils/geometry';
import type { Cell } from '../layout/types/viewmodel_types';
import { isValueInRanges } from '../layout/viewmodel/viewmodel';

/**
 * Determines the highlight state of a heatmap cell based on the currently highlighted legend bands.
 *
 * @param cell - The heatmap cell to evaluate.
 * @param highlightedLegendBands - An array of value ranges representing the currently highlighted legend bands.
 * @returns The geometry highlight state: 'highlighted' if the cell's value is within any highlighted band,
 *          'dimmed' if not, or 'default' if no bands are highlighted.
 * @internal
 */
export function getCellHighlightState(
  cell: Cell,
  highlightedLegendBands: Array<GenericDomain>,
): GeometryHighlightState {
  if (highlightedLegendBands.length > 0) {
    return isValueInRanges(cell.value, highlightedLegendBands) ? 'highlighted' : 'dimmed';
  }
  return 'default';
}
