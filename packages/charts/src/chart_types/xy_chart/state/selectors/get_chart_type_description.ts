/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSeriesSpecsSelector } from './get_specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { SeriesType } from '../../utils/specs';

/** @internal */
export const getChartTypeDescriptionSelector = createCustomCachedSelector([getSeriesSpecsSelector], (specs): string => {
  const seriesTypes = new Set<SeriesType>();
  specs.forEach((value) => seriesTypes.add(value.seriesType));
  return seriesTypes.size > 1 ? `Mixed chart: ${[...seriesTypes].join(' and ')} chart` : `${[...seriesTypes]} chart`;
});
