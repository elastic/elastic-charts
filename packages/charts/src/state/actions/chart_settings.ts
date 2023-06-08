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

/** @internal */
export const UPDATE_CHART_TITLES = 'UPDATE_CHART_TITLES';

interface UpdateParentDimensionAction {
  type: typeof UPDATE_PARENT_DIMENSION;
  dimensions: Dimensions;
}

interface UpdateChartTitlesAction {
  type: typeof UPDATE_CHART_TITLES;
  title?: string;
  description?: string;
}

/** @internal */
export function updateParentDimensions(dimensions: Dimensions): UpdateParentDimensionAction {
  return { type: UPDATE_PARENT_DIMENSION, dimensions };
}

/** @internal */
export function updateChartTitles(title?: string, description?: string): UpdateChartTitlesAction {
  return { type: UPDATE_CHART_TITLES, title, description };
}

/** @internal */
export type ChartSettingsActions = UpdateParentDimensionAction | UpdateChartTitlesAction;
