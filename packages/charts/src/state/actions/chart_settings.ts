/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';

import type { Dimensions } from '../../utils/dimensions';

interface UpdateChartTitles {
  title?: string;
  description?: string;
}

/** @internal */
export const updateParentDimensions = createAction<Dimensions>('UPDATE_PARENT_DIMENSIONS');

/** @internal */
export const updateChartTitles = createAction<UpdateChartTitles>('UPDATE_CHART_TITLES');
