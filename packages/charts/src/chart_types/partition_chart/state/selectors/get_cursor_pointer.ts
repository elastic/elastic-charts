/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DEFAULT_CSS_CURSOR } from '../../../../common/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getPickedShapes } from './picked_shapes';

/** @internal */
export const getPointerCursorSelector = createCustomCachedSelector(
  [getPickedShapes, getSettingsSpecSelector],
  (pickedShapes, { onElementClick, onElementOver }) => {
    return Array.isArray(pickedShapes) && pickedShapes.length > 0 && (onElementClick || onElementOver)
      ? 'pointer'
      : DEFAULT_CSS_CURSOR;
  },
);
