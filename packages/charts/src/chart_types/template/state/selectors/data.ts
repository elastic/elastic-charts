/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../..';
import { SpecType } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSpecsFromStore } from '../../../../state/utils';
import { NewVizSpec } from '../../specs';

/** @internal */
export const getSpecs = createCustomCachedSelector(
  [(global: GlobalChartState) => global.specs],
  (specs): NewVizSpec[] => {
    return getSpecsFromStore<NewVizSpec>(specs, ChartType.NewViz, SpecType.Series);
  },
);

/** @internal */
export const data = createCustomCachedSelector([getSpecs], (spec): number[] => {
  return spec.map((d) => d.data);
});
