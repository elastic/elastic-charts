/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PointerEvent, SettingsSpec } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { isNil } from '../../../../utils/common';
import { isValidPointerOverEvent } from '../../../../utils/events';
import { IndexedGeometry } from '../../../../utils/geometry';
import { ChartDimensions } from '../../utils/dimensions';
import { IndexedGeometryMap } from '../../utils/indexed_geometry_map';
import { sortClosestToPoint } from '../utils/common';
import { ComputedScales } from '../utils/types';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getComputedScalesSelector } from './get_computed_scales';
import { getGeometriesIndexSelector } from './get_geometries_index';
import { getGeometriesIndexKeysSelector } from './get_geometries_index_keys';
import { getOrientedProjectedPointerPositionSelector } from './get_oriented_projected_pointer_position';
import { PointerPosition } from './get_projected_pointer_position';

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

/** @internal */
export const getElementAtCursorPositionSelector = createCustomCachedSelector(
  [
    getOrientedProjectedPointerPositionSelector,
    getComputedScalesSelector,
    getGeometriesIndexKeysSelector,
    getGeometriesIndexSelector,
    getExternalPointerEventStateSelector,
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
  ],
  getElementAtCursorPosition,
);

function getElementAtCursorPosition(
  orientedProjectedPointerPosition: PointerPosition,
  scales: ComputedScales,
  geometriesIndexKeys: (string | number)[],
  geometriesIndex: IndexedGeometryMap,
  externalPointerEvent: PointerEvent | null,
  { chartDimensions }: ChartDimensions,
  { pointBuffer }: SettingsSpec,
): IndexedGeometry[] {
  if (isValidPointerOverEvent(scales.xScale, externalPointerEvent)) {
    if (isNil(externalPointerEvent.x)) {
      return [];
    }

    const x = scales.xScale.pureScale(externalPointerEvent.x);

    if (Number.isNaN(x) || x > chartDimensions.width + chartDimensions.left || x < 0) {
      return [];
    }
    // TODO: Handle external event with spatial points
    return geometriesIndex.find(externalPointerEvent.x, pointBuffer, { x: -1, y: -1 });
  }
  const xValue = scales.xScale.invertWithStep(
    orientedProjectedPointerPosition.x,
    geometriesIndexKeys as number[],
  ).value;
  if (isNil(xValue) || Number.isNaN(xValue)) {
    return [];
  }
  // get the elements at cursor position
  return geometriesIndex
    .find(
      xValue,
      pointBuffer,
      orientedProjectedPointerPosition,
      orientedProjectedPointerPosition.horizontalPanelValue,
      orientedProjectedPointerPosition.verticalPanelValue,
    )
    .sort(sortClosestToPoint(orientedProjectedPointerPosition));
}
