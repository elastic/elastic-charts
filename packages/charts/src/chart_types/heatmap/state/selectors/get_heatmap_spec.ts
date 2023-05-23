/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSpecs } from '../../../../state/selectors/get_specs';
import { getSpecFromStore } from '../../../../state/utils';
import { HeatmapSpec } from '../../specs';

/** @internal */
export const getHeatmapSpecSelector = createCustomCachedSelector([getSpecs], (specs): HeatmapSpec => {
  return getSpecFromStore<HeatmapSpec, true>(specs, ChartType.Heatmap, SpecType.Series, true);
});
