/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { pickedShapes, pickShapesLayerValues } from '../../layout/viewmodel/picked_shapes';
import { partitionDrilldownFocus, partitionMultiGeometries } from './geometries';

function getCurrentPointerPosition(state: GlobalChartState) {
  return state.interactions.pointer.current.position;
}

/** @internal */
export const getPickedShapes = createCustomCachedSelector(
  [partitionMultiGeometries, getCurrentPointerPosition, partitionDrilldownFocus],
  pickedShapes,
);

/** @internal */
export const getPickedShapesLayerValues = createCustomCachedSelector([getPickedShapes], pickShapesLayerValues);
