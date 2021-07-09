/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastDragSelector } from '../../../../state/selectors/get_last_drag';
import { PickDragFunction } from '../../layout/types/viewmodel_types';
import { geometries } from './geometries';

/** @internal */
export const getPickedCells = createCustomCachedSelector(
  [geometries, getLastDragSelector],
  (geoms, dragState): ReturnType<PickDragFunction> | null => {
    if (!dragState) {
      return null;
    }

    return geoms.pickDragArea([dragState.start.position, dragState.end.position]);
  },
);
