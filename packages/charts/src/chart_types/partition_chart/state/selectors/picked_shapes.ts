/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { pickedShapes, pickShapesLayerValues } from '../../layout/viewmodel/picked_shapes';
import { getActivePointerPosition } from './../../../../state/selectors/get_active_pointer_position';
import { partitionDrilldownFocus, partitionMultiGeometries } from './geometries';

/** @internal */
export const getPickedShapes = createCustomCachedSelector(
  [partitionMultiGeometries, getActivePointerPosition, partitionDrilldownFocus],
  pickedShapes,
);

/** @internal */
export const getPickedShapesLayerValues = createCustomCachedSelector([getPickedShapes], pickShapesLayerValues);
