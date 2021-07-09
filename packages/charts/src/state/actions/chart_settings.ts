/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Dimensions } from '../../utils/dimensions';

/** @internal */
export const UPDATE_PARENT_DIMENSION = 'UPDATE_PARENT_DIMENSION';

interface UpdateParentDimensionAction {
  type: typeof UPDATE_PARENT_DIMENSION;
  dimensions: Dimensions;
}

/** @internal */
export function updateParentDimensions(dimensions: Dimensions): UpdateParentDimensionAction {
  return { type: UPDATE_PARENT_DIMENSION, dimensions };
}

/** @internal */
export type ChartSettingsActions = UpdateParentDimensionAction;
