/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getAnnotationTooltipStateSelector } from './get_annotation_tooltip_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';

/** @internal */
export const isAnnotationTooltipVisibleSelector = createCustomCachedSelector(
  [getAnnotationTooltipStateSelector],
  (annotationTooltipState): boolean => annotationTooltipState !== null && annotationTooltipState.isVisible,
);
