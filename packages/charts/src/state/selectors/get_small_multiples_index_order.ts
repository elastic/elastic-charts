/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSpecs } from './get_specs';
import { ChartType } from '../../chart_types/chart_type';
import { SmallMultiplesGroupBy } from '../../common/panel_utils';
import { SmallMultiplesSpec } from '../../specs';
import { GroupBySpec } from '../../specs/group_by';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { createCustomCachedSelector } from '../create_selector';
import { getSpecsFromStore } from '../utils/get_specs_from_store';

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
