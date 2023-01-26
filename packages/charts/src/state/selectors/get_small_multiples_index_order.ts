/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types';
import { SmallMultiplesGroupBy } from '../../common/panel_utils';
import { SmallMultiplesSpec, SpecType, GroupBySpec } from '../../specs';
import { createCustomCachedSelector } from '../create_selector';
import { getSpecsFromStore } from '../utils';
import { getSpecs } from './get_specs';

/** @internal */
export const getSmallMultiplesIndexOrderSelector = createCustomCachedSelector(
  [getSpecs],
  (specs): SmallMultiplesGroupBy => {
    const [smallMultiples] = getSpecsFromStore<SmallMultiplesSpec>(specs, ChartType.Global, SpecType.SmallMultiples);
    const groupBySpecs = getSpecsFromStore<GroupBySpec>(specs, ChartType.Global, SpecType.IndexOrder);

    return {
      horizontal: groupBySpecs.find((s) => s.id === smallMultiples?.splitHorizontally),
      vertical: groupBySpecs.find((s) => s.id === smallMultiples?.splitVertically),
    };
  },
);
